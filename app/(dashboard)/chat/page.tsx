"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { ThoughtChain } from '@/components/chat/ThoughtChain';

const suggestionChips = [
  { label: "حلل فكرتي الاستثمارية", prompt: "هل يمكنك إجراء تحليل شامل وفني لفكرتي المستندة إلى السوق المصري؟" },
  { label: "صياغة خطة عمل كاملة", prompt: "ساعدني في بناء خطة عمل احترافية موجهة للمستثمرين في مصر." },
  { label: "تنبيهات حارس الأخطاء", prompt: "ما هي الأخطاء القاتلة التي يجب أن أتجنبها عند التأسيس في السوق المحلي؟" },
  { label: "اكتشاف فرص التمويل", prompt: "أخبرني عن أحدث جولات التمويل، مسابقات ريادة الأعمال، والفعاليات القادمة في مصر." },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, setMessages, status } = useChat({
    api: "/api/chat",
    onFinish: async (message: any) => {
      if (user) {
        await saveChatToFirestore([...messages, message]);
      }
    },
    onError: (err: Error) => {
      console.error(err);
      toast.error("حدث خطأ أثناء التواصل مع كلميرون.");
    },
  } as any);

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (!user) return;
    const loadChat = async () => {
      const chatRef = doc(db, "users", user.uid, "chat_history", "default-chat");
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        if (data.messages) setMessages(data.messages);
      }
    };
    loadChat();
  }, [user, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const saveChatToFirestore = async (updatedMessages: any[]) => {
    if (!user) return;
    const chatRef = doc(db, "users", user.uid, "chat_history", "default-chat");
    const chatSnap = await getDoc(chatRef);
    const payload = {
      userId: user.uid,
      messages: updatedMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: new Date(),
      })),
      updated_at: serverTimestamp(),
    };
    if (chatSnap.exists()) {
      await updateDoc(chatRef, payload);
    } else {
      await setDoc(chatRef, { ...payload, created_at: serverTimestamp() });
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

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !pdfContext) return;
    const messageContent = pdfContext
      ? `[سياق من ملف PDF]: ${pdfContext}\n\n[رسالة المستخدم]: ${input}`
      : input;
    sendMessage({ role: 'user', text: messageContent } as any);
    setInput("");
    if (pdfContext) setPdfContext(null);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto glass-panel rounded-3xl shadow-2xl overflow-hidden relative" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 text-white backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/20">
              <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
              <AvatarFallback>K</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg text-[#D4AF37]">كلميرون</h2>
              <span className="text-xs text-neutral-400">الوكيل الذكي</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
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

            {messages.map((m) => {
              const textContent = (m.parts ?? [])
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('');

              return (
                <div
                  key={m.id}
                  className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <Avatar className="h-8 w-8 shrink-0 border border-white/10">
                    {m.role === "user" ? (
                      <AvatarFallback className="bg-black/50 text-white">{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
                        <AvatarFallback>K</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[85%] text-sm shadow-sm",
                      m.role === "user"
                        ? "brand-gradient text-white rounded-tr-none border-none"
                        : "glass-panel text-neutral-200 rounded-tl-none border border-white/10"
                    )}
                  >
                    <div className="prose prose-sm prose-invert max-w-none" dir="auto">
                      {m.role === 'assistant' && isLoading && m.id === messages[messages.length - 1]?.id ? (
                        <motion.div
                          animate={{ opacity: [0.5, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        >
                          <ReactMarkdown>{textContent}</ReactMarkdown>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                          <ReactMarkdown>{textContent}</ReactMarkdown>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0 border border-white/10">
                  <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
                </Avatar>
                <div className="glass-panel text-neutral-200 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm min-w-[220px]">
                  <ThoughtChain />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Footer / Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {suggestionChips.map((chip) => (
              <Badge
                key={chip.label}
                variant="outline"
                className="cursor-pointer glass-panel border-white/10 hover:bg-white/10 py-1.5 px-3 rounded-full text-xs transition-colors text-neutral-300"
                onClick={() => setInput(chip.prompt)}
              >
                {chip.label}
              </Badge>
            ))}
          </div>

          {pdfContext && (
            <div className="mb-3 p-2 glass-panel border border-[#0A66C2]/50 rounded-lg flex items-center justify-between text-xs text-[#0A66C2]">
              <span className="flex items-center gap-2">
                <Paperclip className="h-3 w-3" />
                ملف PDF مرقّق كلياً (سيتم إرسال المحتوى مع الرسالة القادمة)
              </span>
              <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-white/10" onClick={() => setPdfContext(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <form onSubmit={onFormSubmit} className="relative flex items-center gap-2">
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
              className="shrink-0 h-10 w-10 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
            </Button>

            <Input
              value={input}
              placeholder="صف فكرتك أو اطرح سؤالك.. كلميرون هنا للرد."
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-12 rounded-xl bg-black/40 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-[#D4AF37] px-4"
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={(!input.trim() && !pdfContext) || isLoading}
              className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#0A66C2] text-white hover:opacity-90 shrink-0 border-none disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <div className="mt-2 text-[10px] text-center text-neutral-500">
            الذكاء الاصطناعي قد يخطئ أحياناً؛ استشر خبيراً قبل اتخاذ قرارات مصيرية.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
