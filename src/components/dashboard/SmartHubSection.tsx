// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity, ChefHat, Sun, Sparkles, ArrowLeft, ShieldCheck, Zap,
  Brain, Search, Calculator, FileText, Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

const CAPABILITIES = [
  { icon: Search, label: "بحث ويب حقيقي", desc: "كل وكيل يبحث ويستشهد" },
  { icon: Calculator, label: "حسابات دقيقة", desc: "بدل تخمينات الـLLM" },
  { icon: FileText, label: "قراءة PDF", desc: "عقود، فواتير، سير ذاتية" },
  { icon: ImageIcon, label: "تحليل صور", desc: "مراجعة الإعلانات" },
  { icon: Brain, label: "نقد ذاتي", desc: "كل قرار يُراجَع قبل التنفيذ" },
  { icon: Sparkles, label: "اقتراحات استباقية", desc: "بعد كل إنجاز، الخطوة التالية" },
];

export function SmartHubSection() {
  const { user } = useAuth();
  const [ops, setOps] = useState<OpsFeed | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    fetch("/api/recipes/list").then((r) => r.json()).then((j) => setRecipes(j.recipes || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: triggers async fetch on user change
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

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-cyan-500/[0.08] via-violet-500/[0.05] to-amber-500/[0.06] p-6 md:p-7 mb-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 p-2.5 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-cyan-300 font-semibold mb-0.5">
              المركز الذكي · جديد
            </p>
            <h2 className="text-xl font-bold text-white">كل التحديثات في مكان واحد</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link href="/operations" className="rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-neutral-200 inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> غرفة العمليات
          </Link>
          <Link href="/recipes" className="rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-neutral-200 inline-flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5" /> الوصفات
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Link href="/operations" className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 hover:bg-amber-500/15 transition">
          <p className="text-[10px] text-amber-200 uppercase tracking-wider">بانتظار موافقتك</p>
          <p className="text-2xl font-bold text-amber-100 mt-1">{pendingApprovals}</p>
          <p className="text-[10px] text-amber-200/70 mt-0.5">طلب يحتاج قرارك</p>
        </Link>
        <Link href="/operations" className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 hover:bg-emerald-500/15 transition">
          <p className="text-[10px] text-emerald-200 uppercase tracking-wider">نُفّذ فعلاً</p>
          <p className="text-2xl font-bold text-emerald-100 mt-1">{executed}</p>
          <p className="text-[10px] text-emerald-200/70 mt-0.5">إجراء مكتمل</p>
        </Link>
        <Link href="/recipes" className="rounded-2xl bg-violet-500/10 border border-violet-500/30 p-3 hover:bg-violet-500/15 transition">
          <p className="text-[10px] text-violet-200 uppercase tracking-wider">وصفات جاهزة</p>
          <p className="text-2xl font-bold text-violet-100 mt-1">{recipes.length}</p>
          <p className="text-[10px] text-violet-200/70 mt-0.5">تدفّق بضغطة واحدة</p>
        </Link>
        <Link href="/daily-brief" className="rounded-2xl bg-cyan-500/10 border border-cyan-500/30 p-3 hover:bg-cyan-500/15 transition">
          <p className="text-[10px] text-cyan-200 uppercase tracking-wider">إيجاز اليوم</p>
          <p className="text-2xl font-bold text-cyan-100 mt-1 flex items-center gap-1">
            <Sun className="w-5 h-5" /> {brief ? "جاهز" : briefLoading ? "..." : "—"}
          </p>
          <p className="text-[10px] text-cyan-200/70 mt-0.5">قرار + رسالة + 5 دقائق</p>
        </Link>
      </div>

      {decision && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.06] p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-cyan-300" />
            <p className="text-[11px] uppercase tracking-wider text-cyan-300 font-semibold">قرار اليوم المقترح</p>
          </div>
          <p className="text-white font-bold text-base mb-1">{decision.title}</p>
          <p className="text-neutral-200 text-sm leading-relaxed line-clamp-2">{decision.body}</p>
          <Link href="/daily-brief" className="text-cyan-300 hover:text-cyan-200 text-xs inline-flex items-center gap-1 mt-2">
            افتح الإيجاز كاملاً <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
      )}

      {topRecipes.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-wider text-neutral-300 font-semibold mb-2 flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5" /> وصفات شائعة
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {topRecipes.map((r) => (
              <Link
                key={r.id}
                href="/recipes"
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] p-3 transition group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{r.emoji}</span>
                  <p className="text-white text-sm font-medium group-hover:text-cyan-200">{r.title}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                  <Zap className="w-3 h-3" />{r.steps.length} خطوات
                  <ShieldCheck className="w-3 h-3 mr-1" />موافقتك أوّلاً
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wider text-neutral-300 font-semibold mb-2 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" /> قدرات الوكلاء الجديدة (يستخدمونها تلقائيّاً)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 flex items-center gap-2">
                <div className="rounded-lg bg-white/[0.06] p-1.5 text-cyan-300 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{c.label}</p>
                  <p className="text-neutral-400 text-[10px] truncate">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
