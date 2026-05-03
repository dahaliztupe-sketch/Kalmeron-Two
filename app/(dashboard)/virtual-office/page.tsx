"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users, CheckSquare, Bot, MessageSquare, Zap, BarChart2,
  ArrowRight, Clock, CheckCircle2, Plus, Trash2, Loader2, RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/src/lib/utils";

interface TodoItem { id: string; label: string; done: boolean; createdAt: number; }

interface Conversation {
  id: string;
  phoneNumber?: string;
  userMessage?: string;
  aiReply?: string | null;
  timestamp?: number;
}

const TEAM_AGENTS = [
  { id: "ceo", nameAr: "الرئيس التنفيذي", role: "استراتيجية ونمو", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", q: "حلّل الموقف الاستراتيجي الحالي لشركتي وأعطني 3 أولويات للربع القادم" },
  { id: "cfo", nameAr: "المدير المالي",    role: "تمويل وتقارير مالية",  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", q: "حلّل التدفق النقدي وأخبرني كيف أحسّن Burn Rate" },
  { id: "cmo", nameAr: "مدير التسويق",     role: "نمو وعلامة تجارية",   color: "text-rose-400",   bg: "bg-rose-500/10 border-rose-500/30",   q: "اقترح استراتيجية تسويق للسوق المصري بميزانية 10,000 جنيه شهرياً" },
  { id: "cto", nameAr: "مدير التقنية",     role: "بنية تحتية ومنتج",    color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",   q: "ما أفضل بنية تقنية لشركة ناشئة في مرحلة Seed مع فريق صغير؟" },
  { id: "chro", nameAr: "مدير الموارد البشرية", role: "فريق وثقافة",   color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30", q: "ساعدني في بناء خطة توظيف لمرحلة Series A" },
  { id: "clo", nameAr: "المستشار القانوني", role: "عقود وامتثال",       color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/30",   q: "ما أهم البنود القانونية التي يجب مراجعتها عند إبرام عقد مع مستثمر؟" },
];

const STORAGE_KEY = "kalmeron:virtual-office-todos";

function loadTodos(): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as TodoItem[];
  } catch {
    return [];
  }
}

function saveTodos(todos: TodoItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function VirtualOfficePage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  const persistTodos = (updated: TodoItem[]) => {
    setTodos(updated);
    saveTodos(updated);
  };

  const toggleTodo = (id: string) =>
    persistTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const addTodo = () => {
    if (!newTodo.trim()) return;
    persistTodos([...todos, { id: crypto.randomUUID(), label: newTodo.trim(), done: false, createdAt: Date.now() }]);
    setNewTodo("");
  };

  const removeTodo = (id: string) =>
    persistTodos(todos.filter(t => t.id !== id));

  const doneCnt = todos.filter(t => t.done).length;

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setConvLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/whatsapp/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.conversations) {
        setConversations(
          [...(data.conversations as Conversation[])].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)).slice(0, 5)
        );
      }
    } catch {
    } finally {
      setConvLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatTime = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("ar-EG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 text-white" dir="rtl">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.06] px-3 py-1 text-[11px] text-cyan-200 mb-3">
            <Users className="w-3.5 h-3.5" />
            المكتب الافتراضي · Virtual Office
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">مكتبك الافتراضي</h1>
          <p className="text-neutral-400 text-sm max-w-xl">
            فريقك التنفيذي الذكي جاهز — أدر مهامك وابدأ محادثة مع أي وكيل فوراً.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">

          {/* Persistent Tasks */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="md:col-span-1">
            <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />مهامي
                </h2>
                {todos.length > 0 && (
                  <span className="text-xs text-neutral-500">{doneCnt}/{todos.length}</span>
                )}
              </div>
              {todos.length > 0 && (
                <div className="w-full bg-neutral-800 rounded-full h-1 mb-3">
                  <div className="bg-cyan-500 h-1 rounded-full transition-all"
                    style={{ width: `${(doneCnt / todos.length) * 100}%` }} />
                </div>
              )}
              <ul className="space-y-2 flex-1 overflow-y-auto max-h-48">
                {todos.length === 0 && (
                  <li className="text-xs text-neutral-600 text-center py-4">أضف مهمتك الأولى أدناه</li>
                )}
                {todos.map(t => (
                  <li key={t.id} className="flex items-start gap-2 group">
                    <button onClick={() => toggleTodo(t.id)}
                      className={cn(
                        "w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                        t.done ? "bg-cyan-500 border-cyan-500" : "border-neutral-600 hover:border-cyan-500/50",
                      )}>
                      {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <span className={cn("text-xs leading-relaxed flex-1", t.done ? "line-through text-neutral-600" : "text-neutral-300")}>
                      {t.label}
                    </span>
                    <button onClick={() => removeTodo(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-rose-400 transition-all shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-800">
                <input value={newTodo} onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTodo()}
                  placeholder="مهمة جديدة..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors" />
                <button onClick={addTodo} disabled={!newTodo.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white rounded-lg px-2.5 py-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Agent Team */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-2">
            <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4 text-cyan-400" />فريقك التنفيذي الذكي
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEAM_AGENTS.map(agent => (
                  <Link key={agent.id}
                    href={`/chat?q=${encodeURIComponent(agent.q)}`}
                    className={cn("border rounded-xl p-3 transition-all hover:scale-[1.02] group", agent.bg)}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", agent.bg)}>
                      <Bot className={cn("w-4 h-4", agent.color)} />
                    </div>
                    <div className={cn("text-xs font-bold mb-0.5", agent.color)}>{agent.nameAr}</div>
                    <div className="text-[11px] text-neutral-500">{agent.role}</div>
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-3 h-3 text-neutral-400" />
                      <span className="text-[11px] text-neutral-400">ابدأ محادثة</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Real WhatsApp Agent Activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-6 bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />آخر نشاط وكلاء WhatsApp
            </h2>
            <button onClick={loadConversations} disabled={convLoading}
              className="text-neutral-600 hover:text-neutral-300 transition-colors">
              {convLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            </button>
          </div>
          {!user ? (
            <p className="text-xs text-neutral-600 text-center py-4">سجّل الدخول لعرض نشاط الوكلاء</p>
          ) : convLoading && conversations.length === 0 ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-4">
              <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
              <p className="text-xs text-neutral-600">لا يوجد نشاط بعد</p>
              <p className="text-xs text-neutral-700 mt-1">
                <Link href="/whatsapp-agent" className="text-cyan-600 hover:text-cyan-400">فعّل وكيل WhatsApp</Link> وسيظهر نشاطه هنا
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map(conv => (
                <div key={conv.id} className="flex items-start gap-3 border-b border-neutral-800/50 pb-3 last:border-0 last:pb-0">
                  <Bot className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-300 truncate">{conv.userMessage}</p>
                    {conv.aiReply && (
                      <p className="text-xs text-neutral-500 truncate mt-0.5">↩ {conv.aiReply}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-neutral-700">
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px]">{formatTime(conv.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/growth-lab",       label: "مختبر النمو",    icon: BarChart2,   color: "text-orange-400" },
            { href: "/smart-pricing",    label: "التسعير الذكي",  icon: Zap,         color: "text-yellow-400" },
            { href: "/hr-ai",            label: "مساعد HR",       icon: Users,       color: "text-blue-400"   },
            { href: "/cofounder-health", label: "صحة المؤسسين",   icon: CheckSquare, color: "text-green-400"  },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="bg-neutral-900/40 border border-neutral-700/30 hover:border-neutral-600/50 rounded-xl p-4 flex items-center gap-3 transition-all group">
              <Icon className={cn("w-5 h-5 shrink-0", color)} />
              <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{label}</span>
              <ArrowRight className="w-3 h-3 text-neutral-600 mr-auto group-hover:text-neutral-400 transition-colors" />
            </Link>
          ))}
        </motion.div>

      </div>
    </AppShell>
  );
}
