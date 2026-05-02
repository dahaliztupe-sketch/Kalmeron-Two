"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Target, Plus, RefreshCw, Loader2, CheckCircle2,
  TrendingUp, BarChart3, Clock, Sparkles, ChevronDown,
  ChevronUp, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface KR { description: string; target: number; current: number; unit: string }
interface OKR {
  id: string; period: "weekly" | "monthly"; department: string;
  objective: string; keyResults: KR[]; status: string; agentId: string;
}

const DEPT_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  marketing:  { label: "التسويق",         color: "text-pink-300",    bg: "bg-pink-500/10",    border: "border-pink-500/25" },
  sales:      { label: "المبيعات",         color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  product:    { label: "المنتج",           color: "text-violet-300",  bg: "bg-violet-500/10",  border: "border-violet-500/25" },
  finance:    { label: "المالية",          color: "text-amber-300",   bg: "bg-amber-500/10",   border: "border-amber-500/25" },
  hr:         { label: "الموارد البشرية", color: "text-cyan-300",    bg: "bg-cyan-500/10",    border: "border-cyan-500/25" },
  legal:      { label: "القانوني",         color: "text-indigo-300",  bg: "bg-indigo-500/10",  border: "border-indigo-500/25" },
  operations: { label: "العمليات",         color: "text-orange-300",  bg: "bg-orange-500/10",  border: "border-orange-500/25" },
  strategy:   { label: "الاستراتيجية",    color: "text-fuchsia-300", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/25" },
};

function avgProgress(okrs: OKR[]): number {
  if (!okrs.length) return 0;
  const all: number[] = [];
  for (const o of okrs) {
    for (const k of o.keyResults) {
      all.push(Math.min(100, ((k.current || 0) / (k.target || 1)) * 100));
    }
  }
  if (!all.length) return 0;
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}

function KRBar({ kr }: { kr: KR }) {
  const pct = Math.min(100, ((kr.current || 0) / (kr.target || 1)) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-neutral-400">
        <span className="flex-1 leading-snug">{kr.description}</span>
        <span className="shrink-0 font-mono mr-3 text-white/70">
          {kr.current}/{kr.target} {kr.unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            pct >= 100 ? "bg-emerald-400" : pct >= 50 ? "bg-brand-cyan" : "bg-amber-400"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function OKRCard({ okr }: { okr: OKR }) {
  const [open, setOpen] = useState(true);
  const meta = DEPT_META[okr.department] ?? {
    label: okr.department, color: "text-neutral-300", bg: "bg-white/5", border: "border-white/10",
  };
  const progress = avgProgress([okr]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border p-5 space-y-4", meta.bg, meta.border)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold mb-2 px-2 py-0.5 rounded-full border", meta.bg, meta.border, meta.color)}>
            <BarChart3 className="w-3 h-3" />
            {meta.label}
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">{okr.objective}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={cn("text-lg font-black tabular", progress >= 100 ? "text-emerald-400" : progress >= 50 ? "text-cyan-400" : "text-amber-400")}>
            {progress}%
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-500 transition-colors"
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {okr.keyResults.map((k, i) => <KRBar key={i} kr={k} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OKRPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{ weekly: OKR[]; all: OKR[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/okr", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function generate() {
    setGenerating(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/okr", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("فشل التوليد");
      toast.success("تم توليد الأهداف بنجاح");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setGenerating(false);
    }
  }

  const weekly = data?.weekly || [];
  const grouped = weekly.reduce((acc: Record<string, OKR[]>, o) => {
    (acc[o.department] ||= []).push(o); return acc;
  }, {});

  const overallProgress = avgProgress(weekly);
  const deptCount = Object.keys(grouped).length;
  const completedOKRs = weekly.filter((o) => avgProgress([o]) >= 100).length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12" dir="rtl">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-1 text-[11px] text-emerald-200 mb-3">
              <Target className="w-3.5 h-3.5" /> أهداف الأسبوع · OKRs
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
              الأهداف والنتائج الرئيسية
            </h1>
            <p className="text-sm text-neutral-400">
              أهداف مُوّلدة بالذكاء الاصطناعي لكل قسم في فريقك الرقمي هذا الأسبوع.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}
              className="border-white/15 hover:border-white/30">
              <RefreshCw className={cn("w-3.5 h-3.5 ml-1.5", loading && "animate-spin")} />
              تحديث
            </Button>
            <Button onClick={generate} disabled={generating || loading}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:brightness-110">
              {generating ? (
                <><Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" /> جارٍ التوليد...</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5 ml-1.5" /> توليد أهداف الأسبوع</>
              )}
            </Button>
          </div>
        </div>

        {!loading && weekly.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: TrendingUp, label: "التقدم الإجمالي", value: `${overallProgress}%`, color: "text-cyan-400" },
              { icon: BarChart3,  label: "الأقسام النشطة",  value: String(deptCount),     color: "text-indigo-400" },
              { icon: Award,      label: "أهداف مكتملة",    value: String(completedOKRs), color: "text-emerald-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                <Icon className={cn("w-5 h-5 shrink-0", color)} />
                <div>
                  <div className="text-xs text-neutral-500">{label}</div>
                  <div className={cn("text-lg font-black", color)}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-6 text-center text-sm text-rose-300">
            {error}
          </div>
        )}

        {!loading && !error && weekly.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">لا توجد أهداف لهذا الأسبوع</h3>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                اضغط على «توليد أهداف الأسبوع» لينشئ فريقك الذكي أهدافاً مناسبة لكل قسم.
              </p>
            </div>
            <Button onClick={generate} disabled={generating}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
              {generating ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
              ابدأ توليد الأهداف الآن
            </Button>
          </motion.div>
        )}

        {!loading && weekly.length > 0 && (
          <div className="space-y-4">
            {Object.entries(grouped).map(([, okrs]) => (
              okrs.map((o) => <OKRCard key={o.id} okr={o} />)
            ))}

            <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> التقدم الكلي للأسبوع
                  </span>
                  <span className="font-mono text-white">{overallProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full",
                      overallProgress >= 100 ? "bg-emerald-400" :
                      overallProgress >= 60 ? "bg-brand-cyan" : "bg-amber-400"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              {overallProgress >= 100 && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
