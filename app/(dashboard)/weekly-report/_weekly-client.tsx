"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import Link from "next/link";
import {
  TrendingUp, Target, AlertTriangle, Zap, CheckCircle2,
  Clock, Loader2, RefreshCw, ArrowLeft, Flame, Bot,
  DollarSign, BarChart3, Lightbulb, ChevronRight,
  CalendarDays, Activity, Award, XCircle, Printer,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface ChartPoint { day: string; date: string; requests: number; costUsd: number; tokens: number }
interface OKRItem { title: string; status: string; targetValue: number | null; currentValue: number | null }
interface PendingTask { taskId: string; description: string; status: string }
interface Alert { severity: string; source: string; message: string; timestamp?: string }
interface Opportunity { id: string; title: string; type: string; organizer: string; amount: string; deadline: string; link: string }
interface Recommendation { icon: string; title: string; detail: string; href: string; priority: "high" | "medium" | "low" }
interface AgentRow { name: string; requests: number; costUsd: number }

interface WeeklyData {
  generatedAt: string;
  weekStart: string;
  company: { stage: string; name: string | null; industry: string | null };
  summary: {
    totalRequests: number; totalCredits: number; totalCostUsd: number;
    totalTokens: number; topAgent: { name: string; requests: number } | null;
    okrTotal: number; okrDone: number; okrCompletionRate: number;
    pendingTasksCount: number; criticalAlertsCount: number;
    agentCount: number; dailyCostUsd: number;
  };
  chartData: ChartPoint[];
  okrs: OKRItem[];
  pendingTasks: PendingTask[];
  alerts: Alert[];
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  agentBreakdown: AgentRow[];
}

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// ── Helpers ───────────────────────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  idea: "مرحلة الفكرة", validation: "مرحلة التحقق",
  foundation: "مرحلة التأسيس", growth: "مرحلة النمو", scaling: "مرحلة التوسع",
};
const OKR_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  done:      { label: "مكتمل",   color: "text-emerald-400", icon: <CheckCircle2 className="w-4 h-4" /> },
  completed: { label: "مكتمل",   color: "text-emerald-400", icon: <CheckCircle2 className="w-4 h-4" /> },
  in_progress:{ label: "جارٍ",   color: "text-cyan-400",    icon: <Activity className="w-4 h-4" /> },
  pending:   { label: "معلّق",   color: "text-amber-400",   icon: <Clock className="w-4 h-4" /> },
  cancelled: { label: "ملغي",    color: "text-rose-400",    icon: <XCircle className="w-4 h-4" /> },
};
const ALERT_COLOR: Record<string, string> = {
  critical: "border-rose-500/30 bg-rose-500/[0.06] text-rose-300",
  error:    "border-rose-500/20 bg-rose-500/[0.04] text-rose-400",
  warning:  "border-amber-500/20 bg-amber-500/[0.04] text-amber-300",
  info:     "border-cyan-500/20  bg-cyan-500/[0.04]  text-cyan-300",
};
const PRIORITY_RING: Record<string, string> = {
  high:   "ring-1 ring-rose-500/30",
  medium: "ring-1 ring-amber-500/20",
  low:    "ring-1 ring-white/[0.06]",
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ── Mini bar chart (pure CSS, no library) ───────────────────────────────────
function UsageBarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((d) => d.requests), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {data.map((d) => {
        const pct = Math.round((d.requests / max) * 100);
        return (
          <div key={d.date} className="flex flex-col items-center gap-1 flex-1 group">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 group-hover:from-cyan-400/80 group-hover:to-cyan-300/50 transition-all duration-300"
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              {d.requests > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {d.requests}
                </div>
              )}
            </div>
            <span className="text-[9px] text-white/35 truncate w-full text-center">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── OKR Progress ring ─────────────────────────────────────────────────────────
function OKRRing({ pct }: { pct: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const stroke = circ - (pct / 100) * circ;
  return (
    <svg width="80" height="80" className="rotate-[-90deg]">
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke={pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171"}
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={stroke}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WeeklyReportClient() {
  const { user } = useAuth();
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/weekly-report", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error(String(j["error"] || "فشل التحميل"));
      }
      setData(await res.json() as WeeklyData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const weekLabel = data
    ? new Date(data.weekStart).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const exportPdf = async () => {
    if (!user || !data) return;
    setPdfLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/weekly-report/export-pdf", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل إنشاء PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kalmeron-weekly-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                <Link href="/dashboard" className="hover:text-white/70 transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> لوحة القيادة
                </Link>
                <span>/</span>
                <span className="text-white/60">التقرير الأسبوعي</span>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/[0.08] flex items-center justify-center text-lg">
                  📊
                </span>
                التقرير الأسبوعي
              </h1>
              {data && (
                <p className="mt-1.5 text-sm text-white/40">
                  {data.company.name
                    ? <><span className="text-white/70">{data.company.name}</span> · </>
                    : null}
                  {STAGE_LABELS[data.company.stage] || data.company.stage}
                  {weekLabel ? <> · أسبوع {weekLabel}</> : null}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void exportPdf()}
                disabled={loading || !data || pdfLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white transition-all disabled:opacity-50 print:hidden"
              >
                {pdfLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Printer className="w-3.5 h-3.5" />}
                {pdfLoading ? "جارٍ..." : "PDF"}
              </button>
              <button
                onClick={() => void load()}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white transition-all disabled:opacity-50 print:hidden"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                تحديث
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Loading skeleton ────────────────────────────────────────────── */}
        {loading && !data && (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl border border-white/[0.04] bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.04] p-4 text-rose-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {data && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* ── KPI Cards row ─────────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: <Zap className="w-4 h-4 text-cyan-400" />,
                  label: "طلبات AI هذا الأسبوع",
                  value: data.summary.totalRequests.toLocaleString("ar-EG"),
                  sub: `${data.summary.agentCount} وكيل نشط`,
                  color: "from-cyan-500/10 to-transparent",
                },
                {
                  icon: <Target className="w-4 h-4 text-violet-400" />,
                  label: "إنجاز OKR",
                  value: `${data.summary.okrCompletionRate}%`,
                  sub: `${data.summary.okrDone} من ${data.summary.okrTotal}`,
                  color: "from-violet-500/10 to-transparent",
                },
                {
                  icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
                  label: "مهام معلّقة",
                  value: data.summary.pendingTasksCount.toLocaleString("ar-EG"),
                  sub: `${data.summary.criticalAlertsCount} تنبيه حرج`,
                  color: data.summary.pendingTasksCount > 0 ? "from-amber-500/10 to-transparent" : "from-white/[0.02] to-transparent",
                },
                {
                  icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
                  label: "توكنز مُستخدمة",
                  value: formatTokens(data.summary.totalTokens),
                  sub: `$${data.summary.totalCostUsd.toFixed(3)} تكلفة`,
                  color: "from-emerald-500/10 to-transparent",
                },
              ].map((kpi, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl border border-white/[0.08] bg-gradient-to-br p-4",
                    kpi.color
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center">{kpi.icon}</div>
                    <span className="text-[10px] text-white/40 leading-tight">{kpi.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white tabular-nums">{kpi.value}</div>
                  <div className="text-[11px] text-white/35 mt-0.5">{kpi.sub}</div>
                </div>
              ))}
            </motion.div>

            {/* ── AI Activity Chart ─────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">نشاط الذكاء الاصطناعي — آخر 7 أيام</span>
                </div>
                {data.summary.topAgent && (
                  <div className="flex items-center gap-1.5 text-xs text-white/40 bg-white/[0.04] rounded-lg px-2 py-1">
                    <Bot className="w-3 h-3 text-violet-400" />
                    <span>الأكثر استخداماً:</span>
                    <span className="text-violet-300 font-medium">{data.summary.topAgent.name}</span>
                    <span className="text-white/25">({data.summary.topAgent.requests} طلب)</span>
                  </div>
                )}
              </div>
              <UsageBarChart data={data.chartData} />

              {/* Agent breakdown */}
              {data.agentBreakdown.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <p className="text-[11px] text-white/35 mb-3">توزيع الوكلاء هذا الأسبوع</p>
                  <div className="flex flex-wrap gap-2">
                    {data.agentBreakdown.map((agent) => {
                      const pct = data.summary.totalRequests > 0
                        ? Math.round((agent.requests / data.summary.totalRequests) * 100)
                        : 0;
                      return (
                        <div key={agent.name} className="flex items-center gap-1.5 text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
                          <Bot className="w-3 h-3 text-violet-400/70" />
                          <span className="text-white/60 max-w-[90px] truncate">{agent.name}</span>
                          <span className="text-white/30">·</span>
                          <span className="text-white/50 font-medium">{agent.requests}</span>
                          <span className="text-white/25 text-[10px]">({pct}%)</span>
                        </div>
                      );
                    })}
                    {data.summary.totalRequests === 0 && (
                      <span className="text-xs text-white/30">لا يوجد نشاط مسجّل هذا الأسبوع</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── OKR Progress ───────────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-white">تقدم أهداف OKR</span>
                </div>
                <Link
                  href="/okr"
                  className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                >
                  إدارة OKR <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {data.okrs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-2xl">🎯</div>
                  <p className="text-sm text-white/40">لم تحدد أهداف هذا الأسبوع بعد</p>
                  <Link href="/okr" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    إضافة أهداف OKR ←
                  </Link>
                </div>
              ) : (
                <div className="flex gap-5 items-start">
                  {/* Ring */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="relative w-20 h-20">
                      <OKRRing pct={data.summary.okrCompletionRate} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white">{data.summary.okrCompletionRate}%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/35">الإنجاز الكلي</span>
                  </div>

                  {/* OKR list */}
                  <div className="flex-1 space-y-2">
                    {data.okrs.map((okr, i) => {
                      const st = OKR_STATUS[okr.status] || OKR_STATUS["pending"]!;
                      const progress = okr.targetValue && okr.currentValue != null
                        ? Math.min(Math.round((okr.currentValue / okr.targetValue) * 100), 100)
                        : null;
                      return (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className={cn("mt-0.5 flex-shrink-0", st.color)}>{st.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/80 truncate">{okr.title}</p>
                            {progress !== null && (
                              <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <span className={cn("text-[10px] font-medium flex-shrink-0", st.color)}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── Alerts & Pending Tasks ─────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Alerts */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">التنبيهات</span>
                  </div>
                  {data.summary.criticalAlertsCount > 0 && (
                    <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded-full px-2 py-0.5">
                      {data.summary.criticalAlertsCount} حرج
                    </span>
                  )}
                </div>
                {data.alerts.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4" />
                    لا توجد تنبيهات هذا الأسبوع
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.alerts.map((a, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-xl border p-2.5 text-xs",
                          ALERT_COLOR[a.severity] || ALERT_COLOR["info"]
                        )}
                      >
                        <div className="font-medium truncate">{a.message}</div>
                        <div className="mt-0.5 opacity-60">{a.source}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Tasks */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">مهام تنتظرك</span>
                  </div>
                  {data.pendingTasks.length > 0 && (
                    <Link href="/inbox" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
                      عرض الكل ←
                    </Link>
                  )}
                </div>
                {data.pendingTasks.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4" />
                    لا توجد مهام معلّقة
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.pendingTasks.map((t) => (
                      <div
                        key={t.taskId}
                        className="flex items-start gap-2 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-2.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-white/70 leading-relaxed line-clamp-2">{t.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Opportunities ─────────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white">فرص لا تفوّت</span>
                </div>
                <Link href="/opportunities" className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                  رادار الفرص <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.opportunities.map((opp) => (
                  <a
                    key={opp.id}
                    href={opp.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-amber-500/25 hover:bg-amber-500/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
                        opp.type === "grant" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.08]" :
                        opp.type === "accelerator" ? "text-violet-400 border-violet-500/20 bg-violet-500/[0.08]" :
                        "text-cyan-400 border-cyan-500/20 bg-cyan-500/[0.08]"
                      )}>
                        {opp.type === "grant" ? "منحة" : opp.type === "accelerator" ? "حاضنة" : "مسابقة"}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white/80 leading-relaxed group-hover:text-white transition-colors line-clamp-2">{opp.title}</p>
                    {opp.amount && (
                      <p className="mt-2 text-[11px] text-emerald-400 font-medium">{opp.amount}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {opp.deadline && (
                        <div className="flex items-center gap-1 text-[10px] text-white/30">
                          <CalendarDays className="w-3 h-3" />
                          {opp.deadline}
                        </div>
                      )}
                      <span className="text-[10px] text-white/25 group-hover:text-amber-400 transition-colors">تفاصيل →</span>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* ── Recommendations ───────────────────────────────────────────── */}
            {data.recommendations.length > 0 && (
              <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">توصيات للأسبوع القادم</span>
                </div>
                <div className="space-y-3">
                  {data.recommendations.map((rec, i) => (
                    <Link
                      key={i}
                      href={rec.href}
                      className={cn(
                        "flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all group",
                        PRIORITY_RING[rec.priority]
                      )}
                    >
                      <span className="text-xl flex-shrink-0 mt-0.5">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{rec.title}</p>
                        <p className="text-xs text-white/45 mt-0.5">{rec.detail}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors mt-0.5 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="flex items-center justify-between text-xs text-white/25 pt-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>تقرير آلي مولّد بواسطة Kalmeron AI</span>
              </div>
              {data.generatedAt && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {new Date(data.generatedAt).toLocaleString("ar-EG", {
                      weekday: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </motion.div>

          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
