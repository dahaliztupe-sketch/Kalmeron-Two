"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import {
  Activity, Bot, AlertTriangle, DollarSign, Target,
  Hourglass, Loader2, ArrowLeft, CheckCircle2, MapPin, LineChart,
} from "lucide-react";
import { KalmeronAreaChart } from "@/src/components/charts";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STAGE_LABELS: Record<string, string> = {
  idea: 'فكرة',
  validation: 'تحقق من السوق',
  foundation: 'تأسيس',
  growth: 'نمو',
  scaling: 'توسع',
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
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};
const containerV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function DashboardPage() {
  const { user, dbUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const token = user ? await user.getIdToken().catch(() => null) : null;
        const r = await fetch('/api/dashboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        if (!cancel) { setData(j); setError(null); }
      } catch (e: any) {
        if (!cancel) setError('تعذر تحميل البيانات.');
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 12000);
    return () => { cancel = true; clearInterval(id); };
  }, [user]);

  const stageIndex = data ? Math.max(0, data.progress.stages.indexOf(data.progress.stage)) : 0;
  const stageProgressPct = data ? ((stageIndex + 1) / data.progress.stages.length) * 100 : 0;
  const userName = dbUser?.name || user?.displayName || 'صديقي المؤسس';

  return (
    <AppShell>
      <div dir="rtl" className="max-w-7xl mx-auto">
        <h1 className="font-display text-4xl font-extrabold text-white mb-1">مركز القيادة</h1>
        <p className="text-text-secondary mb-8">نظرة شاملة على فريق وكلائك وحالة شركتك.</p>

        {loading ? (
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" /> جاري تحميل البيانات...
          </div>
        ) : error || !data ? (
          <div className="glass-panel p-6 rounded-2xl text-rose-300">{error || 'لا توجد بيانات.'}</div>
        ) : (
          <motion.div
            variants={containerV}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {/* Welcome (wide) */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6 md:col-span-3 lg:col-span-2 relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-gold/10 blur-3xl" />
              <div className="relative">
                <p className="text-text-secondary text-sm mb-2">مرحباً بعودتك،</p>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-4">
                  {userName}
                  {data.welcome.companyName && <span className="brand-gradient-text"> · {data.welcome.companyName}</span>}
                </h2>
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                  المرحلة الحالية: <span className="text-brand-gold font-bold">{STAGE_LABELS[data.welcome.stage] || data.welcome.stage}</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-brand-blue transition-all"
                    style={{ width: `${stageProgressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] mt-2 text-text-secondary uppercase tracking-wider">
                  {data.progress.stages.map((s, i) => (
                    <span key={s} className={cn(i <= stageIndex && "text-brand-gold")}>{STAGE_LABELS[s]}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Daily Cost */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-text-secondary uppercase tracking-wider">تكلفة اليوم</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">${data.metrics.dailyCostUsd.toFixed(2)}</div>
              <div className="text-xs text-text-secondary">من ${data.metrics.dailyLimit} يومياً</div>
            </motion.div>

            {/* Agents */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-brand-gold" />
                <span className="text-xs text-text-secondary uppercase tracking-wider">وكلاء نشطون</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{data.metrics.agentCount}</div>
              <div className="text-xs text-text-secondary">يعمل لصالحك الآن</div>
            </motion.div>

            {/* Team Activity (wide) */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6 md:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-base font-bold text-white">نشاط الفريق</h3>
                </div>
                <Link href="/roadmap" className="text-xs text-brand-gold flex items-center gap-1 hover:gap-2 transition-all">
                  عرض المخطط <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
              {data.teamActivity.length === 0 ? (
                <p className="text-text-secondary text-sm">لا توجد إجراءات بعد. ابدأ محادثة مع المساعد.</p>
              ) : (
                <ul className="space-y-3">
                  {data.teamActivity.slice(0, 3).map((t) => (
                    <li key={t.taskId} className="flex items-start gap-3 text-sm">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                        t.status === 'completed' ? 'bg-emerald-400' :
                        t.status === 'in_progress' ? 'bg-brand-blue animate-pulse' :
                        t.status === 'failed' ? 'bg-rose-400' : 'bg-text-secondary/40'
                      )} />
                      <span className="text-text-secondary leading-relaxed flex-1">{t.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Pending Tasks */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Hourglass className="w-4 h-4 text-brand-gold" />
                <h3 className="text-base font-bold text-white">بانتظار موافقتك</h3>
              </div>
              {data.pendingTasks.length === 0 ? (
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> لا توجد مهام تنتظر قراراً منك.
                </div>
              ) : (
                <ul className="space-y-3">
                  {data.pendingTasks.slice(0, 3).map((t) => (
                    <li key={t.taskId} className="text-sm text-text-secondary leading-relaxed border-r-2 border-brand-gold pr-3">
                      {t.description}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Alerts */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">التنبيهات</h3>
              </div>
              {data.alerts.length === 0 ? (
                <p className="text-text-secondary text-sm">كل الأنظمة سليمة.</p>
              ) : (
                <ul className="space-y-2">
                  {data.alerts.slice(0, 3).map((a, i) => (
                    <li key={i} className="text-sm text-text-secondary">
                      <span className="text-amber-300 font-mono text-xs ml-2">{a.source}</span>{a.message}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Cost Trend Chart */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">منحنى الاستهلاك (آخر 7 أيام)</h3>
              </div>
              <KalmeronAreaChart
                height={180}
                xKey="day"
                yKeys={["cost"]}
                labels={{ cost: "USD" }}
                data={(() => {
                  const today = +(data.metrics.dailyCostUsd || 0).toFixed(2);
                  const days = ["س", "أ", "ث", "ر", "خ", "ج", "اليوم"];
                  return days.map((d, i) => ({
                    day: d,
                    cost: i === days.length - 1 ? today : 0,
                  }));
                })()}
              />
              <p className="text-[10px] text-text-secondary/60 mt-2">
                تاريخ التكلفة اليومية يبدأ بالتراكم من اليوم.
              </p>
            </motion.div>

            {/* Nearest Opportunity */}
            <motion.div variants={itemV} className="glass-panel rounded-3xl p-6 md:col-span-1 lg:col-span-2 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-brand-blue/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-base font-bold text-white">رادار الفرص</h3>
                </div>
                {data.opportunity ? (
                  <>
                    <h4 className="text-white font-bold mb-2 leading-snug">{data.opportunity.title}</h4>
                    <div className="text-xs text-text-secondary mb-3 space-y-1">
                      {data.opportunity.organizer && <div>الجهة: <span className="text-white/80">{data.opportunity.organizer}</span></div>}
                      {data.opportunity.deadline && <div>الموعد النهائي: <span className="text-white/80">{data.opportunity.deadline}</span></div>}
                    </div>
                    <Link href={data.opportunity.link || '/opportunities'} className="inline-flex items-center gap-2 text-brand-gold text-sm font-bold hover:gap-3 transition-all">
                      التفاصيل <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                      لا توجد فرص محفوظة حالياً. افتح الرادار لاكتشاف أحدث الفرص.
                    </p>
                    <Link href="/opportunities" className="inline-flex items-center gap-2 text-brand-gold text-sm font-bold hover:gap-3 transition-all">
                      افتح رادار الفرص <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
