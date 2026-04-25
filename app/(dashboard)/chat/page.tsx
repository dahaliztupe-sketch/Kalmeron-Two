"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/src/lib/firebase";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, getDocs, query, orderBy, limit, deleteDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2, Send, Paperclip, X, Square, FileText,
  ShieldAlert, Radar, Plus, MessageSquare, Trash2,
  Copy, Check, Brain, Scale, Briefcase, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import ReactMarkdown from "react-markdown";
import { AssistantContent } from "@/components/chat/AssistantContent";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ThoughtChain, type Phase } from "@/components/chat/ThoughtChain";
import { VoiceInputButton } from "@/components/chat/VoiceInputButton";

const AGENT_CHIPS = [
  { label: "محلل الأفكار", icon: Brain, prompt: "هل يمكنك إجراء تحليل شامل وفني لفكرتي المستندة إلى السوق المصري؟", color: "cyan" },
  { label: "خطة عمل", icon: FileText, prompt: "ساعدني في بناء خطة عمل احترافية موجهة للمستثمرين في مصر.", color: "indigo" },
  { label: "حارس الأخطاء", icon: ShieldAlert, prompt: "ما هي الأخطاء القاتلة التي يجب أن أتجنبها عند التأسيس في السوق المحلي؟", color: "rose" },
  { label: "رادار الفرص", icon: Radar, prompt: "أخبرني عن أحدث جولات التمويل، مسابقات ريادة الأعمال، والفعاليات القادمة في مصر.", color: "emerald" },
  { label: "المدير المالي", icon: Briefcase, prompt: "احسب لي نموذج مالي أولي مع توقعات التدفق النقدي لمشروعي.", color: "amber" },
  { label: "المرشد القانوني", icon: Scale, prompt: "ما الوثائق القانونية التي أحتاجها لتأسيس شركتي في مصر؟", color: "violet" },
];

const EMPTY_STATE_SUGGESTIONS = [
  "حلل فكرتي عن تطبيق توصيل من الصيدليات",
  "ابني لي خطة تسويقية لمنتج غذائي جديد",
  "ما هي متطلبات تأسيس شركة SaaS في مصر؟",
  "احسب نقطة التعادل المالي لمطعم بتكلفة 300 ألف جنيه",
  "اشرح لي الفرق بين شركة الأموال وشركة الأشخاص",
  "هل فكرة subscription box للكتب في مصر ناجحة؟",
];

type Citation = {
  index: number;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  snippet: string;
  similarity: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  phases?: Phase[];
  citations?: Citation[];
  timestamp?: Date;
};

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messageCount: number;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-neutral-200 transition-all opacity-0 group-hover:opacity-100"
      title="نسخ"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ChatSidebar({
  conversations, activeId, onSelect, onNew, onDelete, open, onToggle,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="hidden md:flex flex-col border-l border-white/10 bg-[#080c14] overflow-hidden shrink-0"
          >
            <div className="p-3 border-b border-white/[0.06]">
              <button onClick={onNew}
                className="w-full flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4 text-indigo-400" /> محادثة جديدة
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {conversations.length === 0 ? (
                <div className="text-center text-xs text-neutral-600 py-8">لا توجد محادثات بعد</div>
              ) : (
                conversations.map((conv) => (
                  <motion.button key={conv.id} whileTap={{ scale: 0.98 }} onClick={() => onSelect(conv.id)}
                    className={cn(
                      "w-full text-right group flex items-start gap-2 px-3 py-2.5 rounded-xl transition-all",
                      activeId === conv.id ? "bg-indigo-500/15 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-neutral-200 truncate">{conv.title}</div>
                      <div className="text-[10px] text-neutral-600 truncate mt-0.5">{conv.lastMessage}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                      className="shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-neutral-600 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.button>
                ))
              )}
            </div>
            <div className="p-3 border-t border-white/[0.06]">
              <div className="text-[10px] text-neutral-600 text-center">تاريخ محادثاتك محفوظ وآمن</div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function EmptyState({ onSuggestion }: { onSuggestion: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "circOut" }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/30 via-indigo-500/30 to-fuchsia-500/30 blur-2xl logo-halo" />
        <div className="relative w-20 h-20 rounded-3xl border border-white/10 bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center shadow-xl">
          <Avatar className="h-16 w-16">
            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
            <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-bold text-xl">K</AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center border-2 border-[#080c14]">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">أهلاً! أنا كلميرون</h3>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-md mb-8">
          فريق من 16 مساعداً ذكياً عبر 7 أقسام تحت تصرفك. اسألني عن أي شيء — فكرتك، شركتك، سوقك، أو مستقبلك.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl"
      >
        {EMPTY_STATE_SUGGESTIONS.map((s, i) => (
          <motion.button key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => onSuggestion(s)}
            className="text-right text-sm bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-indigo-400/30 text-neutral-200 px-4 py-3 rounded-xl transition-all text-start leading-relaxed"
          >
            {s}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

function MessageBubble({ m, isStreaming, activePhases }: { m: ChatMessage; isStreaming: boolean; activePhases: Phase[] }) {
  const isUser = m.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 w-full items-end group", isUser ? "justify-start flex-row" : "justify-end flex-row-reverse")}
    >
      <Avatar className="h-8 w-8 shrink-0 border border-white/10">
        {isUser ? (
          <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-semibold text-sm">أ</AvatarFallback>
        ) : (
          <>
            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
            <AvatarFallback className="bg-cyan-500/20 text-cyan-300">K</AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={cn(
        "rounded-2xl px-4 py-3.5 max-w-[85%] text-sm shadow-sm border relative",
        isUser
          ? "bg-indigo-500/10 border-indigo-500/20 text-white rounded-tr-sm"
          : "bg-white/[0.04] border-white/10 text-neutral-100 rounded-tl-sm"
      )}>
        {!isUser && (m.phases?.length || isStreaming) ? (
          <div className="mb-3 pb-3 border-b border-white/10">
            <ThoughtChain phases={isStreaming ? activePhases : m.phases} done={!isStreaming} />
          </div>
        ) : null}

        {isStreaming && !m.content && (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        {m.content && (
          isUser ? (
            <div className="prose prose-sm prose-invert max-w-none" dir="auto">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          ) : (
            <AssistantContent content={m.content} />
          )
        )}

        {m.role === "assistant" && m.citations && m.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[11px] uppercase tracking-wider text-cyan-400/80 mb-2">مصادر من مستنداتك</p>
            <ol className="space-y-1.5 text-xs text-neutral-300">
              {m.citations.map((c) => (
                <li key={`${c.documentId}-${c.chunkIndex}`} className="flex gap-2">
                  <span className="text-cyan-400 shrink-0">[{c.index}]</span>
                  <span className="flex-1">
                    <span className="text-white">{c.documentName}</span>
                    <span className="block text-neutral-400 mt-0.5 line-clamp-2">{c.snippet}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {!isUser && m.content && !isStreaming && (
          <div className="absolute -bottom-7 left-0 flex items-center gap-1">
            <CopyButton text={m.content} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePhases, setActivePhases] = useState<Phase[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("default-chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const convRef = collection(db, "users", user.uid, "chat_history");
      const snapshot = await getDocs(query(convRef, orderBy("updated_at", "desc"), limit(20)));
      const convs: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const msgs: ChatMessage[] = Array.isArray(data.messages) ? data.messages : [];
        const lastMsg = msgs[msgs.length - 1];
        convs.push({
          id: docSnap.id,
          title: data.title || (msgs[0]?.content?.slice(0, 40) || "محادثة جديدة"),
          lastMessage: lastMsg?.content?.slice(0, 50) || "",
          updatedAt: data.updated_at?.toDate?.() || new Date(),
          messageCount: msgs.length,
        });
      });
      setConversations(convs);
    } catch {}
  }, [user]);

  const loadChat = useCallback(async (convId: string) => {
    if (!user) return;
    try {
      const chatRef = doc(db, "users", user.uid, "chat_history", convId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        if (Array.isArray(data.messages)) setMessages(data.messages as ChatMessage[]);
        else setMessages([]);
      } else {
        setMessages([]);
      }
    } catch { setMessages([]); }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [user, loadConversations]);

  useEffect(() => {
    if (activeConvId) loadChat(activeConvId);
  }, [activeConvId, loadChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePhases]);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  };

  const saveChatToFirestore = useCallback(async (updatedMessages: ChatMessage[]) => {
    if (!user) return;
    const chatRef = doc(db, "users", user.uid, "chat_history", activeConvId);
    const chatSnap = await getDoc(chatRef);
    const firstUserMsg = updatedMessages.find((m) => m.role === "user");
    const title = firstUserMsg?.content?.slice(0, 40) || "محادثة جديدة";
    const payload = {
      userId: user.uid,
      title,
      messages: updatedMessages.map((m) => ({
        id: m.id, role: m.role, content: m.content,
        phases: m.phases || [], createdAt: new Date(),
      })),
      updated_at: serverTimestamp(),
    };
    if (chatSnap.exists()) await updateDoc(chatRef, payload);
    else await setDoc(chatRef, { ...payload, created_at: serverTimestamp() });
    loadConversations();
  }, [user, activeConvId, loadConversations]);

  const sendMessage = async (content: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content, timestamp: new Date() };
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
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          messages: baseMessages.map((m) => ({ role: m.role, content: m.content })),
          isGuest: !user,
          threadId: user?.uid ? `thread-${user.uid}` : undefined,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let collectedText = "";
      let collectedPhases: Phase[] = [];
      let collectedCitations: Citation[] = [];

      const handleEvent = (event: string, data: any) => {
        if (event === "phase") {
          collectedPhases = [...collectedPhases, { id: data.id, label: data.label }];
          setActivePhases(collectedPhases);
        } else if (event === "delta") {
          collectedText += data.text || "";
          setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: collectedText, phases: collectedPhases } : m));
        } else if (event === "citations") {
          collectedCitations = Array.isArray(data?.items) ? data.items : [];
          setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, citations: collectedCitations } : m));
        } else if (event === "done") {
          setMessages((prev) => {
            const next = prev.map((m) => m.id === assistantId ? { ...m, content: collectedText, phases: collectedPhases, citations: collectedCitations } : m);
            void saveChatToFirestore(next);
            return next;
          });
        } else if (event === "error") {
          toast.error(data.message || "حدث خطأ.");
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
          try { handleEvent(event, JSON.parse(dataStr)); } catch {}
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("حدث خطأ أثناء التواصل مع كلميرون.");
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "عذراً، كلميرون يواجه مشكلة فنية حالياً. حاول مرة أخرى." } : m));
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
    if (file.type !== "application/pdf") { toast.error("يرجى تحميل ملف PDF فقط."); return; }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) { setPdfContext(data.text); toast.success("تم استخراج البيانات من الملف."); }
      else throw new Error(data.error);
    } catch { toast.error("فشل استخراج النصوص."); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setActivePhases([]);
    setMessages((prev) => { void saveChatToFirestore(prev); return prev; });
    toast.message("تم إيقاف التوليد.");
  }, [saveChatToFirestore]);

  const startNewConversation = () => {
    const newId = `chat-${Date.now()}`;
    setActiveConvId(newId);
    setMessages([]);
  };

  const deleteConversation = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "chat_history", id));
      loadConversations();
      if (activeConvId === id) startNewConversation();
      toast.success("تم حذف المحادثة.");
    } catch { toast.error("فشل حذف المحادثة."); }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!input.trim() && !pdfContext) return;
    const messageContent = pdfContext ? `[سياق من ملف PDF]: ${pdfContext}\n\n[رسالة المستخدم]: ${input}` : input;
    void sendMessage(messageContent);
    setInput("");
    setPdfContext(null);
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onFormSubmit(e as any);
    }
  };

  // Auto-send the `?q=` query once when the user is loaded.
  // Lives after `sendMessage` is declared so the React Compiler doesn't
  // flag a TDZ access from the effect closure.
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (!user || autoSentRef.current) return;
    const initialQ = searchParams.get("q");
    if (!initialQ) return;
    autoSentRef.current = true;
    const t = setTimeout(() => { void sendMessage(initialQ); }, 300);
    return () => clearTimeout(t);
  }, [user, searchParams]);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden" dir="rtl">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConvId}
          onSelect={(id) => { setActiveConvId(id); }}
          onNew={startNewConversation}
          onDelete={deleteConversation}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-black/20 backdrop-blur-md shrink-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              title={sidebarOpen ? "إخفاء الشريط الجانبي" : "إظهار الشريط الجانبي"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2.5 flex-1">
              <Avatar className="h-8 w-8 border border-cyan-500/30">
                <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=Kalmeron" />
                <AvatarFallback className="bg-cyan-500/20 text-cyan-300 font-bold text-xs">K</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-sm text-white leading-tight">كلميرون</h2>
                <span className="text-[10px] text-neutral-400">المستشار الذكي الخاص بك</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              متصل
            </div>

            <button onClick={startNewConversation}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> جديد
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6 scrollbar-thin">
            {messages.length === 0 ? (
              <EmptyState onSuggestion={(s) => setInput(s)} />
            ) : (
              messages.map((m, idx) => {
                const isLast = idx === messages.length - 1;
                const isAssistantStreaming = isLoading && isLast && m.role === "assistant";
                return (
                  <MessageBubble key={m.id} m={m} isStreaming={isAssistantStreaming} activePhases={activePhases} />
                );
              })
            )}
            <div ref={scrollRef} className="h-4" />
          </div>

          <div className="shrink-0 border-t border-white/[0.06] bg-black/30 backdrop-blur-md p-3">
            <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
              {AGENT_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button key={chip.label} type="button" onClick={() => setInput(chip.prompt)}
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all",
                      chip.color === "cyan" ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/15" :
                      chip.color === "indigo" ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/15" :
                      chip.color === "rose" ? "bg-rose-500/5 border-rose-500/20 text-rose-300 hover:bg-rose-500/15" :
                      chip.color === "emerald" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15" :
                      chip.color === "amber" ? "bg-amber-500/5 border-amber-500/20 text-amber-300 hover:bg-amber-500/15" :
                      "bg-violet-500/5 border-violet-500/20 text-violet-300 hover:bg-violet-500/15"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {pdfContext && (
              <div className="mb-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-xs text-blue-300">
                <Paperclip className="h-3 w-3 shrink-0" />
                <span className="flex-1">ملف PDF مرفق</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setPdfContext(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />

            <form onSubmit={onFormSubmit}
              className="relative flex items-end gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/40 transition-all shadow-lg"
            >
              <Button type="button" variant="ghost" size="icon" disabled={isUploading || isLoading}
                className="shrink-0 h-9 w-9 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>

              <textarea
                ref={textareaRef}
                value={input}
                placeholder="صف فكرتك أو اطرح سؤالك… (Enter للإرسال، Shift+Enter لسطر جديد)"
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-600 text-sm resize-none py-2 px-2 max-h-40 scrollbar-hide"
                disabled={isLoading}
                style={{ height: "auto", minHeight: "36px" }}
              />

              <VoiceInputButton
                onTranscript={(t) => setInput((cur) => (cur ? cur + " " + t : t))}
                className="h-9 w-9 text-neutral-500 hover:text-white shrink-0"
              />

              {isLoading ? (
                <Button type="button" onClick={stopGenerating}
                  className="h-9 w-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white shrink-0 border-none"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : (
                <Button type="submit" disabled={!input.trim() && !pdfContext}
                  className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white hover:opacity-90 shrink-0 border-none disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}
            </form>

            <div className="mt-2 text-[10px] text-center text-neutral-600">
              كلميرون قد يخطئ أحياناً — استشر متخصصاً قبل القرارات المصيرية
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
