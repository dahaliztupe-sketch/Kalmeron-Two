"use client";

import React, {
  useState, useEffect, useRef, useCallback, Suspense, useMemo,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/src/lib/firebase";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, getDocs, query, orderBy, limit, deleteDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2, Send, Paperclip, X, Square, FileText,
  ShieldAlert, Radar, Plus, MessageSquare, Trash2,
  Copy, Check, Brain, Scale, Briefcase, PanelLeftClose, PanelLeftOpen,
  Download, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, Star,
  Search, Users, ChevronDown, ChevronUp, ChevronRight,
  Zap, TrendingUp, Building2, Megaphone, Code, UserCheck,
  AlertCircle, ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import ReactMarkdown from "react-markdown";
import { AssistantContent } from "@/components/chat/AssistantContent";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ThoughtChain, type Phase } from "@/components/chat/ThoughtChain";
import { VoiceInputButton } from "@/components/chat/VoiceInputButton";

// ── Slash command definitions ──────────────────────────────────────────────
/**
 * Slash command definitions.
 * `agentName` matches the agent `name` field in AgentRegistry
 * (src/ai/agents/registry.ts) — sent as uiContext.agentName to the
 * chat API so the supervisor can pin-route to the correct graph node.
 */
const SLASH_COMMANDS: Array<{
  cmd: string;
  aliases?: string[];
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  prompt: string;
  agentName: string;
}> = [
  {
    cmd: "/cfo", aliases: ["/مالي", "/financial"],
    label: "المدير المالي", description: "تحليل مالي وتدفق نقدي",
    icon: Briefcase, color: "amber",
    prompt: "كـ CFO متخصص في السوق المصري، حلّل وضعي المالي وقدّم توصياتك: ",
    agentName: "cfo-agent",
  },
  {
    cmd: "/legal", aliases: ["/قانوني", "/law"],
    label: "المرشد القانوني", description: "قانون الشركات المصري",
    icon: Scale, color: "violet",
    prompt: "كـ مستشار قانوني متخصص في الشركات المصرية، أجب على سؤالي القانوني: ",
    agentName: "legal-guide",
  },
  {
    cmd: "/marketing", aliases: ["/تسويق", "/market"],
    label: "استراتيجي التسويق", description: "خطة تسويق وقنوات نمو",
    icon: Megaphone, color: "rose",
    prompt: "كـ استراتيجي تسويق متخصص في الأسواق العربية، ضع لي خطة لـ: ",
    agentName: "marketing-strategist",
  },
  {
    cmd: "/idea", aliases: ["/فكرة", "/analyze"],
    label: "محلّل الأفكار", description: "تحليل SWOT وجدوى المشروع",
    icon: Brain, color: "cyan",
    prompt: "حلّل هذه الفكرة بشكل شامل مع SWOT وحجم السوق والمخاطر: ",
    agentName: "idea-validator",
  },
  {
    cmd: "/plan", aliases: ["/خطة", "/business"],
    label: "بنّاء خطة العمل", description: "خطة عمل كاملة",
    icon: FileText, color: "indigo",
    prompt: "ابنِ خطة عمل تفصيلية احترافية لـ: ",
    agentName: "plan-builder",
  },
  {
    cmd: "/opportunities", aliases: ["/فرص", "/funding"],
    label: "رادار الفرص", description: "تمويل وفرص ريادية",
    icon: Radar, color: "emerald",
    prompt: "ابحث عن أحدث فرص التمويل والمنح والمسابقات لـ: ",
    agentName: "opportunity-radar",
  },
  {
    cmd: "/ceo", aliases: ["/رئيس", "/strategy"],
    label: "المدير التنفيذي", description: "استراتيجية ورؤية شاملة",
    icon: Building2, color: "indigo",
    prompt: "كـ CEO استراتيجي، قيّم موقفي الاستراتيجي وقدّم رؤيتك بشأن: ",
    agentName: "ceo-agent",
  },
  {
    cmd: "/sales", aliases: ["/مبيعات", "/sell"],
    label: "مدرب المبيعات", description: "استراتيجية مبيعات",
    icon: TrendingUp, color: "emerald",
    prompt: "كـ مدرب مبيعات محترف، ساعدني على تحسين مبيعاتي لـ: ",
    agentName: "sales-coach",
  },
  {
    cmd: "/hr", aliases: ["/موارد", "/team"],
    label: "مستشار التوظيف", description: "بناء الفريق والتوظيف",
    icon: UserCheck, color: "rose",
    prompt: "ساعدني في بناء فريقي وتوظيف المواهب المناسبة لـ: ",
    agentName: "hiring-advisor",
  },
  {
    cmd: "/tech", aliases: ["/تقني", "/cto"],
    label: "مدير التقنية", description: "استراتيجية تقنية وبنية تحتية",
    icon: Code, color: "cyan",
    prompt: "كـ CTO متخصص في الشركات الناشئة، أشاركك التحدي التقني: ",
    agentName: "cto-agent",
  },
];


const EMPTY_STATE_KEYS = [
  "pharmacy", "marketing", "saas", "breakeven", "company", "subscription",
] as const;

/**
 * Council agents.
 * `agentName` maps to AgentRegistry keys in src/ai/agents/registry.ts.
 * `agentRoleAr` is passed to runCouncilSafe as the role/system-prompt injection.
 */
const COUNCIL_AGENTS: Array<{
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  agentName: string;
  agentRoleAr: string;
}> = [
  {
    id: "ceo", label: "المدير التنفيذي", icon: Building2, color: "indigo",
    agentName: "ceo-agent",
    agentRoleAr: "المدير التنفيذي الاستراتيجي المتخصص في قيادة الشركات الناشئة المصرية",
  },
  {
    id: "cfo", label: "المالية", icon: Briefcase, color: "amber",
    agentName: "cfo-agent",
    agentRoleAr: "المدير المالي المتخصص في النمذجة المالية والتدفق النقدي للسوق المصري",
  },
  {
    id: "cmo", label: "التسويق", icon: Megaphone, color: "rose",
    agentName: "marketing-strategist",
    agentRoleAr: "استراتيجي التسويق الرقمي المتخصص في الأسواق العربية وبناء العلامة التجارية",
  },
  {
    id: "legal", label: "القانوني", icon: Scale, color: "violet",
    agentName: "legal-guide",
    agentRoleAr: "المستشار القانوني المتخصص في قانون الشركات والملكية الفكرية في مصر",
  },
  {
    id: "ops", label: "العمليات", icon: Zap, color: "emerald",
    agentName: "operations-manager",
    agentRoleAr: "مدير العمليات المتخصص في بناء الأنظمة والعمليات القابلة للتوسع",
  },
];

// ── Stage-based Quick Prompts ───────────────────────────────────────────────
const STAGE_PROMPTS: Record<string, Array<{ text: string; icon: LucideIcon; color: string }>> = {
  idea: [
    { text: "حلّل فكرتي في السوق المصري وقيّم جدواها", icon: Brain, color: "cyan" },
    { text: "ما حجم السوق المستهدف وفرص النمو؟", icon: TrendingUp, color: "emerald" },
    { text: "كيف أتحقق من صحة فكرتي بأقل تكلفة؟", icon: Zap, color: "amber" },
    { text: "ما الأخطاء الشائعة في مرحلة الفكرة؟", icon: ShieldAlert, color: "rose" },
    { text: "ابنِ لي MVP بسيط لاختبار الفكرة", icon: FileText, color: "indigo" },
    { text: "ابحث عن فرص تمويل مبكر لمشروعي", icon: Radar, color: "violet" },
  ],
  validation: [
    { text: "كيف أختبر فرضيات مشروعي مع العملاء؟", icon: Brain, color: "cyan" },
    { text: "ما مقاييس Product-Market Fit في مرحلتي؟", icon: TrendingUp, color: "emerald" },
    { text: "كيف أحصل على أول 100 عميل في مصر؟", icon: Megaphone, color: "rose" },
    { text: "ما نموذج التسعير الأمثل لمشروعي؟", icon: Briefcase, color: "amber" },
    { text: "حلّل منافسيّ في السوق المصري", icon: Radar, color: "indigo" },
    { text: "ما الشكل القانوني الأنسب لمشروعي؟", icon: Scale, color: "violet" },
  ],
  growth: [
    { text: "كيف أوسّع نطاق عملياتي للمرحلة القادمة؟", icon: TrendingUp, color: "emerald" },
    { text: "استراتيجية النمو الأمثل لمرحلتي الحالية", icon: Brain, color: "cyan" },
    { text: "كيف أبني فريق مبيعات فعّال في مصر؟", icon: UserCheck, color: "rose" },
    { text: "كيف أستعدّ لجولة تمويل Series A؟", icon: Briefcase, color: "amber" },
    { text: "ما مؤشرات الأداء التي يهتم بها المستثمرون؟", icon: FileText, color: "indigo" },
    { text: "كيف أدخل أسواقاً عربية جديدة؟", icon: Building2, color: "violet" },
  ],
  default: [
    { text: "حلّل فكرتي وقيّم جدواها في السوق المصري", icon: Brain, color: "cyan" },
    { text: "ابنِ خطة عمل احترافية لمشروعي", icon: FileText, color: "indigo" },
    { text: "ابحث عن فرص تمويل ومنح متاحة لي", icon: Radar, color: "emerald" },
    { text: "حلّل وضعي المالي وقدّم توصياتك", icon: Briefcase, color: "amber" },
    { text: "ما الأخطاء الشائعة لرواد الأعمال في مصر؟", icon: ShieldAlert, color: "rose" },
    { text: "استشارة قانونية لتأسيس شركتي في مصر", icon: Scale, color: "violet" },
  ],
};

function getDailyPrompts(stage: string): Array<{ text: string; icon: LucideIcon; color: string }> {
  const pool = STAGE_PROMPTS[stage] ?? STAGE_PROMPTS.default;
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const offset = dayIndex % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 6);
}

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
  feedback?: "good" | "bad" | null;
  agentId?: string;
};

type CouncilResponse = {
  agentId: string;
  label: string;
  content: string;
  streaming: boolean;
};

type SavedPrompt = {
  id: string;
  text: string;
  savedAt: Date;
};

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messageCount: number;
};

// ── helpers ────────────────────────────────────────────────────────────────
function groupConversationsByDate(convs: Conversation[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "اليوم", items: [] },
    { label: "أمس", items: [] },
    { label: "هذا الأسبوع", items: [] },
    { label: "أقدم", items: [] },
  ];

  for (const c of convs) {
    const d = c.updatedAt;
    if (d >= startOfToday) groups[0].items.push(c);
    else if (d >= startOfYesterday) groups[1].items.push(c);
    else if (d >= startOfWeek) groups[2].items.push(c);
    else groups[3].items.push(c);
  }
  return groups.filter((g) => g.items.length > 0);
}

function chipColorClasses(color: string) {
  switch (color) {
    case "cyan": return "bg-cyan-500/5 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/15";
    case "indigo": return "bg-indigo-500/5 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/15";
    case "rose": return "bg-rose-500/5 border-rose-500/20 text-rose-300 hover:bg-rose-500/15";
    case "emerald": return "bg-emerald-500/5 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15";
    case "amber": return "bg-amber-500/5 border-amber-500/20 text-amber-300 hover:bg-amber-500/15";
    case "violet": return "bg-violet-500/5 border-violet-500/20 text-violet-300 hover:bg-violet-500/15";
    default: return "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10";
  }
}

// ── CopyButton ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const t = useTranslations("Chat.actions");
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-neutral-200 transition-all opacity-0 group-hover:opacity-100"
      title={copied ? t("copied") : t("copy")}
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── FeedbackButtons ────────────────────────────────────────────────────────
function FeedbackButtons({ messageId, feedback, onFeedback }: {
  messageId: string;
  feedback?: "good" | "bad" | null;
  onFeedback: (id: string, val: "good" | "bad", comment?: string) => void;
}) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  const handleBad = () => {
    if (feedback === "bad") return;
    setShowComment(true);
  };

  const submitBad = () => {
    onFeedback(messageId, "bad", comment.trim() || undefined);
    setShowComment(false);
    setComment("");
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onFeedback(messageId, "good")}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            feedback === "good"
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-neutral-500 hover:text-emerald-400 hover:bg-emerald-500/10"
          )}
          title="إجابة جيدة"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleBad}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            feedback === "bad"
              ? "text-rose-400 bg-rose-500/10"
              : "text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"
          )}
          title="إجابة سيئة"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
              <p className="text-[10px] text-rose-300">ما الذي لم يعجبك؟ (اختياري)</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="معلومة غير دقيقة، إجابة غير مفيدة..."
                rows={2}
                className="w-full bg-transparent border border-white/10 rounded-lg p-2 text-xs text-neutral-300 placeholder-neutral-600 outline-none focus:border-rose-500/30 resize-none"
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => { setShowComment(false); setComment(""); }}
                  className="text-[10px] text-neutral-500 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={submitBad}
                  className="text-[10px] text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2 py-1 rounded-lg transition-all"
                >
                  إرسال
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CitationCard ───────────────────────────────────────────────────────────
function CitationCard({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false);
  const score = Math.round(citation.similarity * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-2.5 p-2.5 text-right"
      >
        <span className="shrink-0 w-5 h-5 rounded-md bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
          {citation.index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-neutral-200 truncate">{citation.documentName}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            صفحة {citation.chunkIndex + 1} · دقة {score}%
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-neutral-600 shrink-0 mt-0.5" />
          : <ChevronDown className="w-3.5 h-3.5 text-neutral-600 shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <p className="px-2.5 pb-2.5 text-[11px] text-neutral-400 leading-relaxed border-t border-white/[0.05] pt-2">
              {citation.snippet}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── SlashCommandMenu ───────────────────────────────────────────────────────
function SlashCommandMenu({ query, onSelect, onClose }: {
  query: string;
  onSelect: (cmd: typeof SLASH_COMMANDS[number]) => void;
  onClose: () => void;
}) {
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return SLASH_COMMANDS.filter((c) =>
      c.cmd.includes(q) ||
      c.label.includes(q) ||
      c.description.includes(q) ||
      (c.aliases?.some((a) => a.includes(q)) ?? false)
    ).slice(0, 6);
  }, [query]);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    async function reset() { setActiveIdx(0); }
    void reset();
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); if (filtered[activeIdx]) onSelect(filtered[activeIdx]); }
      if (e.key === "Escape")    onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, activeIdx, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-full left-0 right-0 mb-2 bg-[#0d1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[11px] text-neutral-400">أوامر الوكلاء السريعة</span>
        <span className="mr-auto text-[10px] text-neutral-600">↑↓ تنقل · Enter اختيار · Esc إغلاق</span>
      </div>
      {filtered.map((cmd, i) => {
        const Icon = cmd.icon;
        return (
          <button
            key={cmd.cmd}
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => setActiveIdx(i)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-right transition-colors",
              i === activeIdx ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
            )}
          >
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", chipColorClasses(cmd.color))}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">{cmd.label}</span>
                <span className="text-[10px] text-neutral-500 font-mono">{cmd.cmd}</span>
              </div>
              <p className="text-[11px] text-neutral-500 truncate">{cmd.description}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
          </button>
        );
      })}
    </motion.div>
  );
}

// ── SavedPromptsPanel ──────────────────────────────────────────────────────
function SavedPromptsPanel({
  prompts, onSelect, onDelete, onClose,
}: {
  prompts: SavedPrompt[];
  onSelect: (text: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-[#0d1120] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">الأسئلة المحفوظة</span>
        </div>
        <button onClick={onClose} className="text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto scrollbar-thin p-2">
        {prompts.length === 0 ? (
          <div className="text-center py-8 text-neutral-600 text-xs">
            <Bookmark className="w-6 h-6 mx-auto mb-2 opacity-50" />
            لا توجد أسئلة محفوظة بعد
          </div>
        ) : (
          prompts.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-2 p-2 hover:bg-white/5 rounded-xl group cursor-pointer transition-all"
              onClick={() => { onSelect(p.text); onClose(); }}
            >
              <p className="flex-1 text-xs text-neutral-300 line-clamp-2">{p.text}</p>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                className="shrink-0 p-1 opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── ChatSidebar ────────────────────────────────────────────────────────────
function ChatSidebar({
  conversations, activeId, onSelect, onNew, onDelete, open,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Chat.sidebar");
  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const groups = useMemo(() => groupConversationsByDate(filtered), [filtered]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 264, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="hidden md:flex flex-col border-l border-white/10 bg-[#080c14] overflow-hidden shrink-0"
        >
          <div className="p-3 space-y-2 border-b border-white/[0.06]">
            <button
              onClick={onNew}
              className="w-full flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              {t("newConversation")}
            </button>
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pr-8 pl-3 py-2 text-xs text-neutral-300 placeholder-neutral-600 outline-none focus:border-indigo-500/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {groups.length === 0 ? (
              <div className="text-center text-xs text-neutral-600 py-8">
                {search ? "لا نتائج" : t("noConversations")}
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-600 px-2 py-1 mb-1">
                    {group.label}
                  </p>
                  {group.items.map((conv) => (
                    <div key={conv.id}>
                      {deleteConfirmId === conv.id ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5 px-2 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-0.5"
                          dir="rtl"
                        >
                          <span className="flex-1 text-[10px] text-rose-300 leading-tight">حذف هذه المحادثة؟</span>
                          <button
                            onClick={confirmDelete}
                            className="text-[10px] font-medium text-rose-400 hover:text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-2 py-1 rounded-lg transition-all"
                          >
                            حذف
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
                          >
                            إلغاء
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelect(conv.id)}
                          className={cn(
                            "w-full text-right group flex items-start gap-2 px-3 py-2.5 rounded-xl transition-all mb-0.5",
                            activeId === conv.id
                              ? "bg-indigo-500/15 border border-indigo-500/20"
                              : "hover:bg-white/5 border border-transparent"
                          )}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-neutral-200 truncate">
                              {conv.title}
                            </div>
                            <div className="text-[10px] text-neutral-600 truncate mt-0.5">
                              {conv.lastMessage}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteClick(e, conv.id)}
                            title={t("deleteThread")}
                            className="shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-rose-400 text-neutral-600 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-white/[0.06]">
            <div className="text-[10px] text-neutral-600 text-center">{t("secureFooter")}</div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────
function EmptyState({ onSuggestion }: { onSuggestion: (s: string) => void }) {
  const t = useTranslations("Chat.emptyState");
  const tSuggRaw = useTranslations("Chat.emptyState.suggestions");
  const tSugg = tSuggRaw as unknown as (k: string) => string;
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/30 via-indigo-500/30 to-fuchsia-500/30 blur-2xl logo-halo" />
        <div className="relative w-20 h-20 rounded-3xl border border-white/10 bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center shadow-xl overflow-hidden">
          <Image
            alt="Kalmeron AI"
            src="/brand/kalmeron-mark.svg"
            width={64}
            height={64}
            className="w-[78%] h-[78%] object-contain"
          />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center border-2 border-[#080c14]">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{t("greeting")}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-md mb-6">
          {t("description")}
        </p>
        <p className="text-[11px] text-neutral-600 mb-6">
          اكتب <span className="text-indigo-400 font-mono">/cfo</span> أو{" "}
          <span className="text-violet-400 font-mono">/legal</span> أو{" "}
          <span className="text-rose-400 font-mono">/marketing</span> لتوجيه سؤالك لوكيل متخصص
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl"
      >
        {EMPTY_STATE_KEYS.map((key, i) => {
          const text = tSugg(key);
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => onSuggestion(text)}
              className="text-right text-sm bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-indigo-400/30 text-neutral-200 px-4 py-3 rounded-xl transition-all text-start leading-relaxed"
            >
              {text}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── CouncilPanel ───────────────────────────────────────────────────────────
function CouncilPanel({
  question,
  onClose,
  responses,
  isLoading,
}: {
  question: string;
  onClose: () => void;
  responses: CouncilResponse[];
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full max-w-md shrink-0 border-r border-white/10 bg-[#060a10] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black/20">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-white">مجلس الخبراء</span>
          {isLoading && (
            <span className="flex gap-0.5">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2 bg-indigo-500/5 border-b border-indigo-500/10">
        <p className="text-xs text-neutral-400 line-clamp-2">&quot;{question}&quot;</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {COUNCIL_AGENTS.map((agent) => {
          const resp = responses.find((r) => r.agentId === agent.agentName);
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className={cn("flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]", chipColorClasses(agent.color))}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{agent.label}</span>
                {resp?.streaming && (
                  <Loader2 className="w-3 h-3 animate-spin mr-auto" />
                )}
                {resp && !resp.streaming && (
                  <Check className="w-3 h-3 text-emerald-400 mr-auto" />
                )}
              </div>
              <div className="p-3 text-xs text-neutral-300 leading-relaxed min-h-[60px]">
                {resp?.content ? (
                  <div className="prose prose-xs prose-invert max-w-none" dir="auto">
                    <ReactMarkdown>{resp.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>في انتظار الرد...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── ActiveAgentChip ────────────────────────────────────────────────────────
function ActiveAgentChip({ agent, onClear }: {
  agent: typeof SLASH_COMMANDS[number];
  onClear: () => void;
}) {
  const Icon = agent.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border",
        chipColorClasses(agent.color)
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{agent.label}</span>
      <button
        onClick={onClear}
        className="hover:opacity-70 transition-opacity ml-0.5"
        title="إلغاء الوكيل"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </motion.div>
  );
}

// ── MessageBubble ──────────────────────────────────────────────────────────
function MessageBubble({ m, isStreaming, activePhases, onFeedback }: {
  m: ChatMessage;
  isStreaming: boolean;
  activePhases: Phase[];
  onFeedback?: (id: string, val: "good" | "bad", comment?: string) => void;
}) {
  const tChat = useTranslations("Chat");
  const isUser = m.role === "user";
  const [citationsOpen, setCitationsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 w-full items-end group",
        isUser ? "justify-start flex-row" : "justify-end flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 border border-white/10 overflow-hidden">
        {isUser ? (
          <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-semibold text-sm">أ</AvatarFallback>
        ) : (
          <div className="w-full h-full bg-[#070A18] flex items-center justify-center">
            <Image
              alt="Kalmeron AI"
              src="/brand/kalmeron-mark.svg"
              width={32}
              height={32}
              className="w-[78%] h-[78%] object-contain"
            />
          </div>
        )}
      </Avatar>

      <div className={cn(
        "rounded-2xl px-4 py-3.5 max-w-[85%] md:max-w-[75%] text-sm shadow-sm border relative",
        isUser
          ? "bg-indigo-500/10 border-indigo-500/20 text-white rounded-tr-sm"
          : "bg-white/[0.04] border-white/10 text-neutral-100 rounded-tl-sm"
      )}>
        {!isUser && (m.phases?.length || isStreaming) ? (
          <div className="mb-3 pb-3 border-b border-white/10">
            <ThoughtChain
              phases={isStreaming ? activePhases : m.phases}
              done={!isStreaming}
            />
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
            <button
              onClick={() => setCitationsOpen((v) => !v)}
              className="flex items-center gap-2 text-[11px] text-cyan-400/80 hover:text-cyan-300 transition-colors mb-2"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="uppercase tracking-wider">{tChat("sources")}</span>
              <span className="text-neutral-600">({m.citations.length})</span>
              {citationsOpen
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {citationsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-1.5"
                >
                  {m.citations.map((c) => (
                    <CitationCard key={`${c.documentId}-${c.chunkIndex}`} citation={c} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!isUser && m.content && !isStreaming && (
          <div className="absolute -bottom-7 left-0 flex items-center gap-1">
            <CopyButton text={m.content} />
            {onFeedback && (
              <FeedbackButtons
                messageId={m.id}
                feedback={m.feedback}
                onFeedback={onFeedback}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── ChatPageContent ────────────────────────────────────────────────────────
function ChatPageContent() {
  const tChat = useTranslations("Chat");
  const tToasts = useTranslations("Chat.toasts");
  const tInput = useTranslations("Chat.input");
  const tCommon = useTranslations("Common");
  const tDash = useTranslations("Dashboard");

  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePhases, setActivePhases] = useState<Phase[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("default-chat");
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showSavedPrompts, setShowSavedPrompts] = useState(false);
  const [userStage, setUserStage] = useState<string>("default");

  // Slash command state
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<typeof SLASH_COMMANDS[number] | null>(null);

  // Council mode state
  const [councilOpen, setCouncilOpen] = useState(false);
  const [councilQuestion, setCouncilQuestion] = useState("");
  const [councilResponses, setCouncilResponses] = useState<CouncilResponse[]>([]);
  const [councilLoading, setCouncilLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch user profile stage ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const stage = snap.data()?.stage;
          if (stage && typeof stage === "string") setUserStage(stage);
        }
      })
      .catch(() => {});
  }, [user]);

  // ── Mobile: visualViewport keyboard avoidance ─────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
      document.documentElement.style.setProperty("--keyboard-offset", `${offset}px`);
    };
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
      document.documentElement.style.removeProperty("--keyboard-offset");
    };
  }, []);

  // ── Conversation management ──────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const convRef = collection(db, "users", user.uid, "chat_history");
      const snapshot = await getDocs(
        query(convRef, orderBy("updated_at", "desc"), limit(30))
      );
      const convs: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const msgs: ChatMessage[] = Array.isArray(data.messages) ? data.messages : [];
        const lastMsg = msgs[msgs.length - 1];
        convs.push({
          id: docSnap.id,
          title: data.title || (msgs[0]?.content?.slice(0, 40) || tDash("newConversation")),
          lastMessage: lastMsg?.content?.slice(0, 60) || "",
          updatedAt: data.updated_at?.toDate?.() || new Date(),
          messageCount: msgs.length,
        });
      });
      setConversations(convs);
    } catch {}
  }, [user, tDash]);

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
    async function run() { await loadConversations(); }
    void run();
  }, [user, loadConversations]);
  useEffect(() => {
    async function run() { if (activeConvId) await loadChat(activeConvId); }
    void run();
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
    const title = firstUserMsg?.content?.slice(0, 40) || tDash("newConversation");
    const payload = {
      userId: user.uid,
      title,
      messages: updatedMessages.map((m) => ({
        id: m.id, role: m.role, content: m.content,
        phases: m.phases || [], citations: m.citations || [],
        feedback: m.feedback || null,
        createdAt: new Date(),
      })),
      updated_at: serverTimestamp(),
    };
    if (chatSnap.exists()) await updateDoc(chatRef, payload);
    else await setDoc(chatRef, { ...payload, created_at: serverTimestamp() });
    loadConversations();
  }, [user, activeConvId, loadConversations, tDash]);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    const assistantId = `a-${Date.now()}`;
    const baseMessages = [...messages, userMsg];
    setMessages([
      ...baseMessages,
      { id: assistantId, role: "assistant", content: "", phases: [] },
    ]);
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
          uiContext: activeAgent
            ? { agentHint: activeAgent.cmd, agentName: activeAgent.agentName }
            : {},
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let collectedText = "";
      let collectedPhases: Phase[] = [];
      let collectedCitations: Citation[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleEvent = (event: string, data: any) => {
        if (event === "phase") {
          collectedPhases = [...collectedPhases, { id: data.id, label: data.label }];
          setActivePhases(collectedPhases);
        } else if (event === "delta") {
          collectedText += data.text || "";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: collectedText, phases: collectedPhases }
                : m
            )
          );
        } else if (event === "citations") {
          collectedCitations = Array.isArray(data?.items) ? data.items : [];
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, citations: collectedCitations } : m
            )
          );
        } else if (event === "done") {
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === assistantId
                ? {
                  ...m,
                  content: collectedText,
                  phases: collectedPhases,
                  citations: collectedCitations,
                  agentId: activeAgent?.cmd,
                }
                : m
            );
            void saveChatToFirestore(next);
            return next;
          });
        } else if (event === "error") {
          toast.error(data.message || tToasts("genericError"));
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
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.name !== "AbortError") {
        toast.error(tToasts("connectionLost"));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: tToasts("genericError") } : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      setActivePhases([]);
      abortRef.current = null;
    }
  };

  // ── Council mode (SSE per-agent streaming) ───────────────────────────────
  const openCouncil = async () => {
    const question = input.trim() || (messages.length > 0 ? messages[messages.length - 1].content : "");
    if (!question) { toast.error("اكتب سؤالك أولاً ثم اسأل المجلس"); return; }
    setCouncilQuestion(question);
    setCouncilOpen(true);
    setCouncilLoading(true);
    // Use agentName (registry key) as agentId so it matches the SSE stream events
    setCouncilResponses(
      COUNCIL_AGENTS.map((a) => ({ agentId: a.agentName, label: a.label, content: "", streaming: true }))
    );

    const token = user ? await user.getIdToken().catch(() => null) : null;

    try {
      const res = await fetch("/api/council/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question,
          agentIds: COUNCIL_AGENTS.map((a) => a.agentName),
          mode: "fast",
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Parse SSE events from the stream
      const parseEvents = (chunk: string) => {
        buffer += chunk;
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const eventLine = part.split("\n").find((l) => l.startsWith("event: "));
          const dataLine = part.split("\n").find((l) => l.startsWith("data: "));
          if (!eventLine || !dataLine) continue;
          const event = eventLine.slice(7).trim();
          let data: Record<string, unknown> = {};
          try { data = JSON.parse(dataLine.slice(5)); } catch { continue; }

          if (event === "agent_done") {
            const { agentId, markdown, error } = data as {
              agentId: string; markdown?: string; error?: string;
            };
            setCouncilResponses((prev) =>
              prev.map((r) =>
                r.agentId === agentId
                  ? {
                      ...r,
                      content: markdown || (error ? `تعذّر الحصول على رأي هذا الوكيل` : "لا يوجد رد"),
                      streaming: false,
                    }
                  : r
              )
            );
          }
        }
      };

      // Read the SSE stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parseEvents(decoder.decode(value, { stream: true }));
      }
    } catch {
      // Mark all still-streaming agents as failed
      setCouncilResponses((prev) =>
        prev.map((r) => r.streaming ? { ...r, content: "تعذّر الحصول على رأي هذا الوكيل", streaming: false } : r)
      );
    }

    setCouncilLoading(false);
  };

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error(tToasts("fileError")); return; }
    if (!user) { toast.error(tChat("toasts.genericError")); return; }
    setIsUploading(true);
    setPdfFilename(file.name);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });
      const data = await res.json();
      if (data.text) { setPdfContext(data.text); toast.success(tToasts("fileExtracted")); }
      else throw new Error(data.error);
    } catch { toast.error(tToasts("fileError")); setPdfFilename(""); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setActivePhases([]);
    setMessages((prev) => { void saveChatToFirestore(prev); return prev; });
  }, [saveChatToFirestore]);

  const exportConversation = useCallback(() => {
    if (messages.length === 0) { toast.error("لا توجد رسائل للتصدير"); return; }
    const lines = [
      `# محادثة كلميرون`,
      `**التاريخ:** ${new Date().toLocaleDateString("ar-EG")}`,
      "", "---", "",
    ];
    for (const m of messages) {
      const role = m.role === "user" ? "**أنت:**" : "**كلميرون:**";
      lines.push(`${role}\n\n${m.content}`);
      lines.push("\n---\n");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kalmeron-chat-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير المحادثة");
  }, [messages]);

  const startNewConversation = () => {
    const newId = `chat-${Date.now()}`;
    setActiveConvId(newId);
    setMessages([]);
    setActiveAgent(null);
  };

  const deleteConversation = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "chat_history", id));
      loadConversations();
      if (activeConvId === id) startNewConversation();
    } catch { toast.error(tToasts("genericError")); }
  };

  const loadSavedPrompts = useCallback(async () => {
    if (!user) return;
    try {
      const ref = collection(db, "users", user.uid, "saved_prompts");
      const snap = await getDocs(query(ref, orderBy("savedAt", "desc"), limit(30)));
      const items: SavedPrompt[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({ id: d.id, text: data.text, savedAt: data.savedAt?.toDate?.() || new Date() });
      });
      setSavedPrompts(items);
    } catch {}
  }, [user]);

  useEffect(() => {
    async function run() { await loadSavedPrompts(); }
    void run();
  }, [loadSavedPrompts]);

  const saveCurrentPrompt = async () => {
    if (!user || !input.trim()) return;
    const id = `sp-${Date.now()}`;
    const ref = doc(db, "users", user.uid, "saved_prompts", id);
    await setDoc(ref, { text: input.trim(), savedAt: serverTimestamp() }).catch(() => {});
    setSavedPrompts((prev) => [{ id, text: input.trim(), savedAt: new Date() }, ...prev]);
    toast.success("تم حفظ السؤال");
  };

  const deleteSavedPrompt = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "saved_prompts", id)).catch(() => {});
    setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const onFeedback = useCallback(async (messageId: string, val: "good" | "bad", comment?: string) => {
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, feedback: val } : m));
    if (!user) return;
    try {
      const chatRef = doc(db, "users", user.uid, "chat_history", activeConvId);
      const snap = await getDoc(chatRef);
      if (snap.exists()) {
        const msgs: ChatMessage[] = (snap.data().messages || []) as ChatMessage[];
        const updated = msgs.map((m: ChatMessage) =>
          m.id === messageId ? { ...m, feedback: val } : m
        );
        await updateDoc(chatRef, { messages: updated });
      }
      // Store in dedicated feedbacks collection with optional comment
      const fbRef = doc(db, "feedbacks", `${user.uid}_${messageId}`);
      await setDoc(fbRef, {
        userId: user.uid,
        messageId,
        conversationId: activeConvId,
        rating: val,
        comment: comment || null,
        timestamp: serverTimestamp(),
        agentId: messages.find((m) => m.id === messageId)?.agentId || null,
      });
    } catch {}
    toast.success(
      val === "good" ? "شكراً! سيساعدنا ذلك في التحسين" : "شكراً على ملاحظتك، سنعمل على التحسين"
    );
  }, [user, activeConvId, messages]);

  // ── Input handling ───────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    autoResize();

    // Slash command detection
    const lastWord = val.split(/\s/)[0] || "";
    if (lastWord.startsWith("/") && lastWord.length >= 1) {
      setSlashQuery(lastWord);
    } else {
      setSlashQuery(null);
    }
  };

  const applySlashCommand = useCallback((cmd: typeof SLASH_COMMANDS[number]) => {
    setActiveAgent(cmd);
    setInput(cmd.prompt);
    setSlashQuery(null);
    textareaRef.current?.focus();
    // Move cursor to end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 0);
  }, []);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!input.trim() && !pdfContext) return;
    const messageContent = pdfContext
      ? `[PDF: ${pdfFilename || "document"}]\n${pdfContext}\n\n${input}`
      : input;
    void sendMessage(messageContent);
    setInput("");
    setPdfContext(null);
    setPdfFilename("");
    setSlashQuery(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If slash menu is open, let it handle arrow/enter
    if (slashQuery !== null && ["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) return;
      if (!input.trim() && !pdfContext) return;
      const messageContent = pdfContext
        ? `[PDF: ${pdfFilename || "document"}]\n${pdfContext}\n\n${input}`
        : input;
      void sendMessage(messageContent);
      setInput("");
      setPdfContext(null);
      setPdfFilename("");
      setSlashQuery(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  // Auto-send from URL ?q=
  const autoSentRef = useRef(false);
  const sendMessageRef = useRef(sendMessage);
  useEffect(() => { sendMessageRef.current = sendMessage; });
  useEffect(() => {
    if (!user || autoSentRef.current) return;
    const initialQ = searchParams.get("q");
    if (!initialQ) return;
    autoSentRef.current = true;
    const t = setTimeout(() => { void sendMessageRef.current(initialQ); }, 300);
    return () => clearTimeout(t);
  }, [user, searchParams]);

  // Load a specific conversation from URL ?conv=<id> (deep-links from dashboard)
  const convLoadedRef = useRef(false);
  useEffect(() => {
    if (!user || convLoadedRef.current) return;
    const convId = searchParams.get("conv");
    if (!convId) return;
    convLoadedRef.current = true;
    void (async () => {
      setActiveConvId(convId);
      await loadChat(convId);
    })();
  }, [user, searchParams, loadChat]);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden" dir="rtl">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConvId}
          onSelect={(id) => { setActiveConvId(id); }}
          onNew={startNewConversation}
          onDelete={deleteConversation}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Council Panel */}
        <AnimatePresence>
          {councilOpen && (
            <CouncilPanel
              question={councilQuestion}
              onClose={() => { setCouncilOpen(false); setCouncilResponses([]); }}
              responses={councilResponses}
              isLoading={councilLoading}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06] bg-black/20 backdrop-blur-md shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              title={sidebarOpen ? tCommon("close") : tCommon("open")}
            >
              {sidebarOpen
                ? <PanelLeftClose className="w-4 h-4" />
                : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 border border-cyan-500/30 overflow-hidden">
                <div className="w-full h-full bg-[#070A18] flex items-center justify-center">
                  <Image
                    alt="Kalmeron AI"
                    src="/brand/kalmeron-mark.svg"
                    width={32}
                    height={32}
                    className="w-[78%] h-[78%] object-contain"
                  />
                </div>
              </Avatar>
              <div>
                <h2 className="font-bold text-sm text-white leading-tight">{tCommon("appName")}</h2>
                <span className="text-[10px] text-neutral-400">{tDash("subtitle")}</span>
              </div>
            </div>

            {/* Active agent chip */}
            <AnimatePresence>
              {activeAgent && (
                <ActiveAgentChip agent={activeAgent} onClear={() => setActiveAgent(null)} />
              )}
            </AnimatePresence>

            <div className="flex-1" />

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              {tCommon("live")}
            </div>

            {messages.length > 0 && (
              <button
                onClick={exportConversation}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-300 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-xl transition-all"
                title="تصدير المحادثة"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={startNewConversation}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tCommon("new")}</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-6 scrollbar-thin">
            {messages.length === 0 ? (
              <EmptyState onSuggestion={(s) => setInput(s)} />
            ) : (
              messages.map((m, idx) => {
                const isLast = idx === messages.length - 1;
                const isAssistantStreaming = isLoading && isLast && m.role === "assistant";
                return (
                  <MessageBubble
                    key={m.id}
                    m={m}
                    isStreaming={isAssistantStreaming}
                    activePhases={activePhases}
                    onFeedback={onFeedback}
                  />
                );
              })
            )}
            <div ref={scrollRef} className="h-4" />
          </div>

          {/* Input area */}
          <div
            className="shrink-0 border-t border-white/[0.06] bg-black/30 backdrop-blur-md p-3"
            style={{
              paddingBottom: "max(12px, env(safe-area-inset-bottom))",
              marginBottom: "var(--keyboard-offset, 0px)",
            }}
          >
            {/* Quick Prompts — stage-aware, daily rotation */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
                {getDailyPrompts(userStage).map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      type="button"
                      onClick={() => { setInput(prompt.text); textareaRef.current?.focus(); }}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all",
                        chipColorClasses(prompt.color)
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="max-w-[140px] truncate">{prompt.text}</span>
                    </motion.button>
                  );
                })}

                {/* Council button */}
                <button
                  type="button"
                  onClick={openCouncil}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border bg-indigo-500/10 border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/20 transition-all"
                >
                  <Users className="w-3 h-3" />
                  اسأل المجلس
                </button>
              </div>
            )}

            {/* Compact Council button when chat is active */}
            {messages.length > 0 && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={openCouncil}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border bg-indigo-500/10 border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/20 transition-all"
                >
                  <Users className="w-3 h-3" />
                  اسأل المجلس
                </button>
              </div>
            )}

            {/* PDF context badge */}
            {pdfContext && (
              <div className="mb-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-xs text-blue-300">
                {isUploading ? (
                  <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                ) : (
                  <FileText className="h-3 w-3 shrink-0" />
                )}
                <span className="flex-1 truncate">{pdfFilename || "PDF"}</span>
                <span className="text-blue-500 shrink-0">{pdfContext.length.toLocaleString()} حرف</span>
                <Button
                  variant="ghost" size="icon"
                  className="h-5 w-5"
                  onClick={() => { setPdfContext(null); setPdfFilename(""); }}
                  title={tChat("actions.removeAttachment")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Upload in progress */}
            {isUploading && !pdfContext && (
              <div className="mb-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2 text-xs text-indigo-300">
                <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                <span>جاري استخراج محتوى الـ PDF...</span>
              </div>
            )}

            <input
              aria-label="رفع ملف"
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
            />

            <div className="relative">
              {/* Slash command menu */}
              <AnimatePresence>
                {slashQuery !== null && (
                  <SlashCommandMenu
                    query={slashQuery}
                    onSelect={applySlashCommand}
                    onClose={() => setSlashQuery(null)}
                  />
                )}
              </AnimatePresence>

              {/* Saved prompts panel */}
              {showSavedPrompts && (
                <SavedPromptsPanel
                  prompts={savedPrompts}
                  onSelect={(text) => { setInput(text); textareaRef.current?.focus(); }}
                  onDelete={deleteSavedPrompt}
                  onClose={() => setShowSavedPrompts(false)}
                />
              )}

              <form
                onSubmit={onFormSubmit}
                className="relative flex items-end gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/40 transition-all shadow-lg"
              >
                <Button
                  type="button" variant="ghost" size="icon"
                  className={cn(
                    "shrink-0 h-9 w-9 rounded-xl transition-all",
                    showSavedPrompts
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10"
                  )}
                  onClick={() => setShowSavedPrompts((p) => !p)}
                  title="الأسئلة المحفوظة"
                >
                  {showSavedPrompts
                    ? <BookmarkCheck className="h-4 w-4" />
                    : <Bookmark className="h-4 w-4" />}
                </Button>

                <Button
                  type="button" variant="ghost" size="icon"
                  disabled={isUploading || isLoading}
                  className="shrink-0 h-9 w-9 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                  title={tChat("actions.attach")}
                >
                  {isUploading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Paperclip className="h-4 w-4" />}
                </Button>

                {input.trim() && !isLoading && (
                  <Button
                    type="button" variant="ghost" size="icon"
                    className="shrink-0 h-9 w-9 rounded-xl text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    onClick={saveCurrentPrompt}
                    title="حفظ هذا السؤال"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}

                <textarea
                  ref={textareaRef}
                  value={input}
                  placeholder={tInput("placeholder")}
                  onChange={handleInputChange}
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
                  <Button
                    type="button"
                    onClick={stopGenerating}
                    title={tChat("actions.stop")}
                    className="h-9 w-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white shrink-0 border-none"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!input.trim() && !pdfContext}
                    title={tChat("actions.send")}
                    className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white hover:opacity-90 shrink-0 border-none disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                )}
              </form>

              {/* Hint */}
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-[10px] text-neutral-700">
                  اكتب <span className="text-neutral-500 font-mono">/</span> لأوامر الوكلاء · Shift+Enter سطر جديد
                </span>
                {activeAgent && (
                  <span className="text-[10px] text-indigo-400">
                    ← موجّه إلى: {activeAgent.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert if Firestore is down */}
      <AnimatePresence>
        {!user && messages.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-4 py-2 rounded-full"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            سجّل دخولك لحفظ المحادثة
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
