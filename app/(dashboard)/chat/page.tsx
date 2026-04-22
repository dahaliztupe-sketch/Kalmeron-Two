"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Paperclip, X, Square, Lightbulb, FileText, ShieldAlert, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ThoughtChain, type Phase } from "@/components/chat/ThoughtChain";

const suggestionChips = [
  { label: "حلل فكرتي الاستثمارية", icon: Lightbulb, prompt: "هل يمكنك إجراء تحليل شامل وفني لفكرتي المستندة إلى السوق المصري؟" },
  { label: "صياغة خطة عمل كاملة", icon: FileText, prompt: "ساعدني في بناء خطة عمل احترافية موجهة للمستثمرين في مصر." },
  { label: "تنبيهات حارس الأخطاء", icon: ShieldAlert, prompt: "ما هي الأخطاء القاتلة التي يجب أن أتجنبها عند التأسيس في السوق المحلي؟" },
  { label: "اكتشاف فرص التمويل", icon: Radar, prompt: "أخبرني عن أحدث جولات التمويل، مسابقات ريادة الأعمال، والفعاليات القادمة في مصر." },
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  phases?: Phase[];
};

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePhases, setActivePhases] = useState<Phase[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadChat = async () => {
      const chatRef = doc(db, "users", user.uid, "chat_history", "default-chat");
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        if (Array.isArray(data.messages)) setMessages(data.messages as ChatMessage[]);
      }
    };
    loadChat();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePhases]);

  const saveChatToFirestore = useCallback(
    async (updatedMessages: ChatMessage[]) => {
      if (!user) return;
      const chatRef = doc(db, "users", user.uid, "chat_history", "default-chat");
      const chatSnap = await getDoc(chatRef);
      const payload = {
        userId: user.uid,
        messages: updatedMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          phases: m.phases || [],
          createdAt: new Date(),
        })),
        updated_at: serverTimestamp(),
      };
      if (chatSnap.exists()) await updateDoc(chatRef, payload);
      else await setDoc(chatRef, { ...payload, created_at: serverTimestamp() });
    },
    [user]
  );

  const sendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };
    const assistantId = `a-${Date.now()}`;
    const baseMessages = [...messages, userMsg];
    setMessages([...baseMessages, { id: assistantId, role: "assistant", content: "", phases: [] }]);
    setIsLoading(true);
    setActivePhases([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = user ? await user.getIdToken().catch(() => null) : null;
      const res = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: baseMessages.map((m) => ({ role: m.role, content: m.content })),
          isGuest: !user,
          threadId: user?.uid ? `thread-${user.uid}` : undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let collectedText = "";
      let collectedPhases: Phase[] = [];

      const handleEvent = (event: string, data: any) => {
        if (event === "phase") {
          collectedPhases = [...collectedPhases, { id: data.id, label: data.label }];
          setActivePhases(collectedPhases);
        } else if (event === "delta") {
          collectedText += data.text || "";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: collectedText, phases: collectedPhases } : m
            )
          );
        } else if (event === "done") {
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === assistantId ? { ...m, content: collectedText, phases: collectedPhases } : m
            );
            void saveChatToFirestore(next);
            return next;
          });
        } else if (event === "error") {
          toast.error(data.message || "حدث خطأ أثناء التواصل مع كلميرون.");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (!block.trim()) continue;
          let event = "message";
          let dataStr = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          try {
            handleEvent(event, JSON.parse(dataStr));
          } catch {
            /* ignore malformed event */
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error(err);
        toast.error("حدث خطأ أثناء التواصل مع كلميرون.");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "عذراً، كالميرون بيواجه مشكلة فنية حالياً." }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      setActivePhases([]);
      abortRef.current = null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("يرجى تحميل ملف بصيغة PDF فقط.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) {
        setPdfContext(data.text);
        toast.success("تم استخراج البيانات من الملف بنجاح.");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("فشل استخراج النصوص من الملف.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const stopGenerating = useCallback(() => {
    if (!abortRef.current) return;
    abortRef.current.abort();
    abortRef.current = null;
    // الرسالة الجزئية محفوظة بالفعل في messages بفضل onDelta؛
    // نُجبر فقط على إنهاء حالة التحميل ونحفظ ما وصل في Firestore.
    setIsLoading(false);
    setActivePhases([]);
    setMessages((prev) => {
      void saveChatToFirestore(prev);
      return prev;
    });
    toast.message("تم إيقاف التوليد. الجزء الذي وصل تم حفظه.");
  }, [saveChatToFirestore]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!input.trim() && !pdfContext) return;
    const messageContent = pdfContext
      ? `[سياق من ملف PDF]: ${pdfContext}\n\n[رسالة المستخدم]: ${input}`
      : input;
    void sendMessage(messageContent);
    setInput("");
    if (pdfContext) setPdfContext(null);
  };

  return (
    <AppShell>
      <div
        className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto glass-panel rounded-3xl shadow-2xl overflow-hidden relative font-arabic"
        dir="rtl"
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/20 text-white backdrop-blur-md">
          <Avatar className="h-11 w-11 border border-brand-gold/40 shrink-0 ring-2 ring-brand-gold/20">
            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
            <AvatarFallback className="bg-brand-gold/20 text-brand-gold font-bold">K</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg leading-tight text-brand-gold">كلميرون</h2>
            <span className="text-xs text-neutral-400 leading-tight mt-1">المستشار الذكي</span>
          </div>
          <span className="ms-auto inline-flex items-center gap-1.5 text-[11px] text-emerald-400/90">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            متصل
          </span>
        </div>

        <ScrollArea className="flex-1 p-4 md:p-6 bg-transparent">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[200px] text-neutral-400 space-y-4">
                <div className="p-4 glass-panel rounded-full border border-white/10 shadow-inner">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
                  </Avatar>
                </div>
                <h3 className="text-xl font-bold text-white">أهلاً بك! أنا &quot;كلميرون&quot;</h3>
                <p className="max-w-[400px] text-center text-neutral-400 text-sm leading-relaxed">
                  أنا مستشارك المعتمد، جاهز لتحويل تطلعاتك إلى خطط ملموسة بنظرة محترفة. كيف يمكنني دعمك اليوم؟
                </p>
              </div>
            )}

            {messages.map((m, idx) => {
              const isLast = idx === messages.length - 1;
              const isAssistantStreaming = isLoading && isLast && m.role === "assistant";
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3 w-full items-end",
                    m.role === "user" ? "justify-start flex-row" : "justify-end flex-row-reverse"
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0 border border-white/10">
                    {m.role === "user" ? (
                      <AvatarFallback className="bg-brand-gold/20 text-brand-gold font-semibold">
                        {user?.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
                        <AvatarFallback className="bg-brand-blue/20 text-brand-blue">K</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[85%] text-sm shadow-sm border",
                      m.role === "user"
                        ? "bg-brand-gold/15 border-brand-gold/30 text-white rounded-tr-md"
                        : "bg-brand-blue/15 border-brand-blue/30 text-neutral-100 rounded-tl-md"
                    )}
                  >
                    {m.role === "assistant" && (m.phases?.length || isAssistantStreaming) ? (
                      <div className="mb-3 pb-3 border-b border-white/10">
                        <ThoughtChain
                          phases={isAssistantStreaming ? activePhases : m.phases}
                          done={!isAssistantStreaming}
                        />
                      </div>
                    ) : null}
                    {isAssistantStreaming && !m.content && (
                      <div className="flex items-center gap-1.5 py-1" aria-label="جارٍ الكتابة">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-soft-pulse" />
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-soft-pulse [animation-delay:200ms]" />
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-soft-pulse [animation-delay:400ms]" />
                      </div>
                    )}
                    {m.content && (
                      <div className="prose prose-sm prose-invert max-w-none" dir="auto">
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {suggestionChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setInput(chip.prompt)}
                  className="cursor-pointer flex items-center gap-1.5 glass-panel border border-white/10 hover:bg-brand-gold/10 hover:border-brand-gold/40 hover:text-white py-1.5 px-3 rounded-full text-xs transition-all text-neutral-300"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-gold/80" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {pdfContext && (
            <div className="mb-3 p-2 glass-panel border border-[#0A66C2]/50 rounded-lg flex items-center justify-between text-xs text-[#0A66C2]">
              <span className="flex items-center gap-2">
                <Paperclip className="h-3 w-3" />
                ملف PDF مرفّق (سيتم إرسال المحتوى مع الرسالة القادمة)
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-white/10"
                onClick={() => setPdfContext(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <form
            onSubmit={onFormSubmit}
            className="relative flex items-center gap-2 h-14 rounded-2xl bg-black/20 border border-white/10 px-2 focus-within:border-brand-gold/50 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUploading || isLoading}
              className="shrink-0 h-10 w-10 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              aria-label="رفع ملف PDF"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
            </Button>

            <input
              value={input}
              placeholder="صف فكرتك أو اطرح سؤالك.. كلميرون هنا للرد."
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-full bg-transparent border-none outline-none text-white placeholder-neutral-500 text-sm px-2"
              disabled={isLoading}
            />

            {isLoading ? (
              <Button
                type="button"
                onClick={stopGenerating}
                className="h-10 w-10 rounded-xl bg-red-500/90 hover:bg-red-500 text-white shrink-0 border-none"
                aria-label="إيقاف التوليد"
                title="إيقاف التوليد"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={(!input.trim() && !pdfContext)}
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-gold to-brand-blue text-white hover:opacity-90 shrink-0 border-none disabled:opacity-50"
                aria-label="إرسال"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
          <div className="mt-2 text-[10px] text-center text-neutral-500">
            الذكاء الاصطناعي قد يخطئ أحياناً؛ استشر خبيراً قبل اتخاذ قرارات مصيرية.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
