"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity, Bot, AlertTriangle, DollarSign, Target,
  Hourglass, Loader2, ArrowLeft, CheckCircle2, MapPin,
  LineChart, Zap, MessageSquare, Brain, Scale, Briefcase,
  FlaskConical, Shield, Radar, Sparkles, LayoutTemplate,
  Flame, Mic,
} from "lucide-react";
import { NotificationPermissionBanner } from "@/components/ui/NotificationPermissionBanner";
import { KalmeronAreaChart } from "@/src/components/charts";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

const STAGE_LABELS: Record<string, string> = {
  idea: "فكرة",
  validation: "تحقق من السوق",
  foundation: "تأسيس",
  growth: "نمو",
  scaling: "توسع",
};

interface DashboardData {
  welcome: { stage: string; companyName: string | null; industry: string | null };
  teamActivity: Array<{ taskId: string; description: string; status: string; updatedAt?: any }>;
  pendingTasks: Array<{ taskId: string; description: string; status: string }>;
  alerts: Array<{ severity: string; source: string; message: string; timestamp?: string }>;
  metrics: { dailyCostUsd: number; dailyLimit: number; agentCount: number };
  progress: { stage: string; stages: string[] };
  opportunity?: { id: string; title: string; type?: string; organizer?: string | null; deadline?: string | null; link?: string | null } | null;
}

import type { Variants } from "motion/react";

const itemV: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const containerV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
// Reduced-motion fallback — fade only, no transform, no stagger.
const itemVReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } },
};
const containerVReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } },
};

const QUICK_ACTIONS = [
  { icon: Brain, label: "محلل الأفكار", desc: "حلّل فكرتك الجديدة", href: "/chat?q=حلل فكرتي الجديدة", color: "from-cyan-500 to-indigo-500", bg: "bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-400/40" },
  { icon: Briefcase, label: "المدير المالي", desc: "نمذجة مالية فورية", href: "/chat?q=احسب لي نموذج مالي أولي", color: "from-emerald-500 to-cyan-500", bg: "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-400/40" },
  { icon: Scale, label: "المرشد القانوني", desc: "عقود وتأسيس قانوني", href: "/chat?q=ما الوثائق القانونية اللازمة للتأسيس؟", color: "from-amber-500 to-orange-500", bg: "bg-amber-500/5 border-amber-500/20 hover:border-amber-400/40" },
  { icon: FlaskConical, label: "مختبر السوق", desc: "اختبر فكرتك مع عملاء", href: "/market-lab", color: "from-fuchsia-500 to-pink-500", bg: "bg-fuchsia-500/5 border-fuchsia-500/20 hover:border-fuchsia-400/40" },
  { icon: Shield, label: "حارس الأخطاء", desc: "فحص مخاطر مشروعك", href: "/chat?q=ما الأخطاء القاتلة التي يجب تجنبها؟", color: "from-rose-500 to-red-500", bg: "bg-rose-500/5 border-rose-500/20 hover:border-rose-400/40" },
  { icon: Radar, label: "رادار الفرص", desc: "فرص التمويل والفعاليات", href: "/opportunities", color: "from-violet-500 to-purple-500", bg: "bg-violet-500/5 border-violet-500/20 hover:border-violet-400/40" },
];

export default function DashboardPage() {
  const { user, dbUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const token = user ? await user.getIdToken().catch(() => null) : null;
        const r = await fetch("/api/dashboard", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        if (!cancel) { setData(j); setError(null); }
      } catch (e: any) {
        if (!cancel) setError("تعذّر تحميل البيانات.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    // Poll every 30s, but skip while tab is hidden — saves battery + Firestore reads.
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      load();
    }, 30000);
    const onVis = () => { if (document.visibilityState === "visible") load(); };
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVis);
    return () => {
      cancel = true;
      clearInterval(id);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVis);
    };
  }, [user]);

  const stageIndex = data ? Math.max(0, data.progress.stages.indexOf(data.progress.stage)) : 0;
  const stageProgressPct = data ? ((stageIndex + 1) / data.progress.stages.length) * 100 : 0;
  const userName = dbUser?.name || user?.displayName || "صديقي المؤسس";
  const firstName = userName.split(" ")[0];

  return (
    <AppShell>
      <div dir="rtl" className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium uppercase tracking-wide">مركز القيادة</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
              أهلاً، <span className="brand-gradient-text">{firstName}</span> 👋
            </h1>
            <p className="text-text-secondary text-sm mt-1">فريقك الذكي جاهز ويعمل من أجلك.</p>
          </div>
          <Link href="/chat"
            className="hidden md:flex btn-primary items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl"
          >
            <MessageSquare className="w-4 h-4" /> محادثة جديدة
          </Link>
        </div>

        {/* Notification Banner */}
        <NotificationPermissionBanner userId={user?.uid} className="mb-5" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-text-secondary text-sm">جاري تحميل بيانات شركتك…</p>
          </div>
        ) : error || !data ? (
          <div className="glass-panel p-6 rounded-2xl text-rose-300 text-sm">{error || "لا توجد بيانات."}</div>
        ) : (
          <motion.div variants={reduce ? containerVReduced : containerV} initial="hidden" animate="show" className="space-y-4 md:space-y-5">

            {/* Welcome + Progress */}
            <motion.div variants={reduce ? itemVReduced : itemV} className="glass-panel rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-cyan-600/8 blur-3xl pointer-events-none" />
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-text-secondary text-sm mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-cyan" />
                    مرحلة شركتك الحالية
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display text-2xl font-extrabold brand-gradient-text">
                      {STAGE_LABELS[data.welcome.stage] || data.welcome.stage}
                    </span>
                    {data.welcome.companyName && (
                      <span className="text-sm text-neutral-400">· {data.welcome.companyName}</span>
                    )}
                  </div>
                  <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${stageProgressPct}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-secondary uppercase tracking-wider">
                    {data.progress.stages.map((s, i) => (
                      <span key={s} className={cn(i <= stageIndex && "text-brand-cyan font-semibold")}>
                        {STAGE_LABELS[s]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 text-center">
                    <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                    <div className="text-2xl font-extrabold text-white">${data.metrics.dailyCostUsd.toFixed(2)}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">تكلفة اليوم</div>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 text-center">
                    <Bot className="w-4 h-4 text-brand-cyan mx-auto mb-1.5" />
                    <div className="text-2xl font-extrabold text-white">{data.metrics.agentCount}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">مساعد نشط</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={reduce ? itemVReduced : itemV}>
              <h2 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> إجراءات سريعة
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href}
                      className={cn(
                        "group rounded-2xl border p-3 md:p-4 text-center transition-all card-lift",
                        action.bg
                      )}
                    >
                      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2.5 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="font-bold text-white text-xs md:text-sm leading-tight">{action.label}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight hidden md:block">{action.desc}</div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {/* Team Activity */}
              <motion.div variants={reduce ? itemVReduced : itemV} className="glass-panel rounded-3xl p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-blue" />
                    <h3 className="text-base font-bold text-white">نشاط الفريق</h3>
                  </div>
                  <Link href="/roadmap" className="text-xs text-brand-cyan flex items-center gap-1 hover:gap-2 transition-all">
                    عرض المخطط <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
                {data.teamActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-text-secondary text-sm">لا توجد إجراءات بعد.</p>
                    <Link href="/chat" className="text-xs text-brand-cyan mt-2 hover:underline">ابدأ محادثة مع الفريق</Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {data.teamActivity.slice(0, 4).map((t) => (
                      <li key={t.taskId} className="flex items-start gap-3 text-sm group">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 shrink-0 transition-transform group-hover:scale-125",
                          t.status === "completed" ? "bg-emerald-400" :
                          t.status === "in_progress" ? "bg-brand-blue animate-pulse" :
                          t.status === "failed" ? "bg-rose-400" : "bg-text-secondary/40"
                        )} />
                        <span className="text-text-secondary leading-relaxed flex-1">{t.description}</span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full shrink-0",
                          t.status === "completed" ? "bg-emerald-400/10 text-emerald-400" :
                          t.status === "in_progress" ? "bg-blue-400/10 text-blue-400" :
                          "bg-white/5 text-neutral-500"
                        )}>
                          {t.status === "completed" ? "مكتمل" : t.status === "in_progress" ? "جارٍ" : "منتظر"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* Alerts + Pending */}
              <motion.div variants={reduce ? itemVReduced : itemV} className="space-y-4">
                {/* Pending Tasks */}
                <div className="glass-panel rounded-3xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Hourglass className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">بانتظار موافقتك</h3>
                  </div>
                  {data.pendingTasks.length === 0 ? (
                    <div className="flex items-center gap-2 text-text-secondary text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      لا توجد مهام تنتظر قراراً.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {data.pendingTasks.slice(0, 3).map((t) => (
                        <li key={t.taskId} className="text-xs text-text-secondary leading-relaxed border-r-2 border-amber-400/60 pr-3">
                          {t.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Alerts */}
                <div className="glass-panel rounded-3xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">التنبيهات</h3>
                  </div>
                  {data.alerts.length === 0 ? (
                    <div className="flex items-center gap-2 text-text-secondary text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      كل الأنظمة سليمة ✓
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {data.alerts.slice(0, 3).map((a, i) => (
                        <li key={i} className="text-xs text-text-secondary">
                          <span className="text-amber-300 font-mono text-[10px] ml-1">{a.source}</span>
                          {a.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Bottom Row: Chart + Opportunity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Cost Chart */}
              <motion.div variants={reduce ? itemVReduced : itemV} className="glass-panel rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LineChart className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">منحنى الاستهلاك (آخر 7 أيام)</h3>
                </div>
                <KalmeronAreaChart
                  height={160}
                  xKey="day"
                  yKeys={["cost"]}
                  labels={{ cost: "USD" }}
                  data={(() => {
                    const today = +(data.metrics.dailyCostUsd || 0).toFixed(2);
                    const days = ["س", "أ", "ث", "ر", "خ", "ج", "اليوم"];
                    return days.map((d, i) => ({ day: d, cost: i === days.length - 1 ? today : 0 }));
                  })()}
                />
                <p className="text-[10px] text-text-secondary/60 mt-2">تاريخ التكلفة اليومية يبدأ بالتراكم من اليوم.</p>
              </motion.div>

              {/* Opportunity */}
              <motion.div variants={reduce ? itemVReduced : itemV} className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-brand-blue" />
                    <h3 className="text-base font-bold text-white">رادار الفرص</h3>
                    <div className="mr-auto flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      مباشر
                    </div>
                  </div>
                  {data.opportunity ? (
                    <>
                      <h4 className="text-white font-bold mb-2 leading-snug">{data.opportunity.title}</h4>
                      <div className="text-xs text-text-secondary mb-3 space-y-1">
                        {data.opportunity.organizer && (
                          <div>الجهة: <span className="text-white/80">{data.opportunity.organizer}</span></div>
                        )}
                        {data.opportunity.deadline && (
                          <div>الموعد النهائي: <span className="text-amber-400 font-medium">{data.opportunity.deadline}</span></div>
                        )}
                      </div>
                      <Link href={data.opportunity.link || "/opportunities"} className="inline-flex items-center gap-2 text-brand-cyan text-sm font-bold hover:gap-3 transition-all">
                        التفاصيل <ArrowLeft className="w-4 h-4" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                        لا توجد فرص محفوظة حالياً. افتح الرادار لاكتشاف أحدث الفرص.
                      </p>
                      <Link href="/opportunities" className="inline-flex items-center gap-2 text-brand-cyan text-sm font-bold hover:gap-3 transition-all">
                        افتح رادار الفرص <ArrowLeft className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Discover Row */}
            <motion.div variants={reduce ? itemVReduced : itemV}>
              <h2 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" /> اكتشف المزيد
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/templates" className="group glass-panel rounded-2xl p-5 hover:border-amber-500/30 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                    <LayoutTemplate className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">مكتبة القوالب</div>
                    <div className="text-xs text-neutral-500 mt-0.5">25+ قالب جاهز للاستخدام الفوري</div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors flex-shrink-0" />
                </Link>
                <Link href="/trending-tools" className="group glass-panel rounded-2xl p-5 hover:border-rose-500/30 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">أدوات AI الرائجة</div>
                    <div className="text-xs text-neutral-500 mt-0.5">أفضل 16 أداة للمؤسسين في 2025</div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors flex-shrink-0" />
                </Link>
                <Link href="/brand-voice" className="group glass-panel rounded-2xl p-5 hover:border-pink-500/30 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">صوت العلامة التجارية</div>
                    <div className="text-xs text-neutral-500 mt-0.5">عرّف هويتك مرة وطبّقها في كل مكان</div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors flex-shrink-0" />
                </Link>
              </div>
            </motion.div>

          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
