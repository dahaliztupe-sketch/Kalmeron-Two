"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity, ChefHat, Sun, Sparkles, ArrowLeft,
  ShieldCheck, Zap, Clock, CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/src/lib/utils";

interface OpsFeed {
  summary?: { pending?: number; executed?: number; failed?: number };
  recent?: Array<{ id: string; actionId?: string; status?: string; title?: string }>;
}
interface Recipe {
  id: string;
  title: string;
  emoji: string;
  category: string;
  involves: string[];
  steps: unknown[];
}
interface Brief {
  generatedAt: string;
  greeting: string;
  blocks?: Array<{ type: string; title: string; body: string }>;
  signals?: { pendingApprovals: number; actionsLast24h: number; activeRecipes: number; topPriority?: string };
}

const METRIC_CARDS = (pending: number, executed: number, recipesLen: number, briefReady: boolean, briefLoading: boolean) => [
  {
    href: "/operations",
    label: "بانتظار موافقتك",
    value: pending,
    sub: "طلب يحتاج قرارك",
    color: "amber",
    icon: Clock,
    urgent: pending > 0,
    gradient: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/25",
    textColor: "text-amber-200",
    valueColor: "text-amber-100",
  },
  {
    href: "/operations",
    label: "مكتمل اليوم",
    value: executed,
    sub: "إجراء نُفّذ",
    color: "emerald",
    icon: CheckCircle,
    gradient: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/25",
    textColor: "text-emerald-200",
    valueColor: "text-emerald-100",
  },
  {
    href: "/recipes",
    label: "وصفات جاهزة",
    value: recipesLen,
    sub: "بضغطة واحدة",
    color: "violet",
    icon: ChefHat,
    gradient: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/25",
    textColor: "text-violet-200",
    valueColor: "text-violet-100",
  },
  {
    href: "/daily-brief",
    label: "إيجاز اليوم",
    value: briefReady ? "جاهز" : briefLoading ? "…" : "—",
    sub: "قرار + تحليل",
    color: "cyan",
    icon: Sun,
    gradient: "from-cyan-500/10 to-sky-500/5",
    border: "border-cyan-500/25",
    textColor: "text-cyan-200",
    valueColor: "text-cyan-100",
  },
];

export function SmartHubSection() {
  const { user } = useAuth();
  const [ops, setOps] = useState<OpsFeed | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    fetch("/api/recipes/list")
      .then((r) => r.json())
      .then((j) => setRecipes(j.recipes || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setBriefLoading(true);
    user.getIdToken().then((token) => {
      fetch("/api/operations/feed?limit=8", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json()).then(setOps).catch(() => {});
      fetch("/api/daily-brief", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json()).then(setBrief).catch(() => {})
        .finally(() => setBriefLoading(false));
    });
  }, [user]);

  const topRecipes = recipes.slice(0, 3);
  const decision = brief?.blocks?.find((b) => b.type === "decision");
  const pendingApprovals = ops?.summary?.pending ?? brief?.signals?.pendingApprovals ?? 0;
  const executed = ops?.summary?.executed ?? 0;
  const metrics = METRIC_CARDS(pendingApprovals, executed, recipes.length, !!brief, briefLoading);

  return (
    <div
      className="rounded-3xl p-5 md:p-6 mb-5"
      style={{
        background: "linear-gradient(135deg, rgba(56,189,248,0.05) 0%, rgba(99,102,241,0.04) 50%, rgba(245,158,11,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #38BDF8, #8B5CF6)" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-cyan-300/70 font-bold">
              مركز العمليات
            </p>
            <h2 className="text-[15px] font-bold text-white leading-none mt-0.5">
              كل التحديثات في مكان واحد
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href="/operations"
            className="text-[11px] font-medium rounded-lg px-2.5 py-1.5 transition-colors text-neutral-300 hover:text-white"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> العمليات</span>
          </Link>
          <Link
            href="/recipes"
            className="text-[11px] font-medium rounded-lg px-2.5 py-1.5 transition-colors text-neutral-300 hover:text-white"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> الوصفات</span>
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className={cn(
                "rounded-2xl p-3.5 transition-all hover:scale-[1.02] group",
                `bg-gradient-to-br ${m.gradient}`,
                m.border,
                "border"
              )}
            >
              <div className={cn("flex items-center gap-1.5 mb-2", m.textColor)}>
                <Icon className="w-3 h-3" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{m.label}</span>
              </div>
              <p className={cn("text-2xl font-black leading-none mb-1", m.valueColor)}>
                {m.value}
              </p>
              <p className={cn("text-[10px] opacity-70", m.textColor)}>{m.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Decision of the day */}
      {decision && (
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "rgba(56,189,248,0.06)",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-3.5 h-3.5 text-cyan-300" />
            <p className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
              قرار اليوم المقترح
            </p>
          </div>
          <p className="text-white font-bold text-sm mb-1">{decision.title}</p>
          <p className="text-neutral-300 text-xs leading-relaxed line-clamp-2">
            {decision.body}
          </p>
          <Link
            href="/daily-brief"
            className="text-cyan-300 hover:text-cyan-200 text-xs inline-flex items-center gap-1 mt-2 transition-colors"
          >
            افتح الإيجاز كاملاً <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Top recipes */}
      {topRecipes.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2 flex items-center gap-1.5">
            <ChefHat className="w-3 h-3" /> وصفات شائعة
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {topRecipes.map((r) => (
              <Link
                key={r.id}
                href="/recipes"
                className="rounded-xl p-3 flex items-center gap-2.5 transition-all hover:bg-white/[0.05] group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-lg shrink-0">{r.emoji}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate group-hover:text-cyan-200 transition-colors">
                    {r.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-400">
                    <Zap className="w-2.5 h-2.5" />{r.steps.length} خطوة
                    <ShieldCheck className="w-2.5 h-2.5 mr-1" />موافقتك أولاً
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
