'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  ArrowLeft, Brain, Target, Rocket, TrendingUp,
  CheckCircle2, Sparkles, ChevronRight,
} from 'lucide-react';

const STAGE_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  tip: string;
  tipHref: string;
  tipIcon: React.ComponentType<{ className?: string }>;
  cta: string;
  ctaHref: string;
  progress: number;
}> = {
  idea: {
    label: 'مرحلة الفكرة',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
    tip: 'ابدأ بتحليل فكرتك مع مختبر الأفكار',
    tipHref: '/ideas/analyze',
    tipIcon: Brain,
    cta: 'حلّل فكرتك الآن',
    ctaHref: '/ideas/analyze',
    progress: 10,
  },
  validation: {
    label: 'اختبار السوق',
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/25',
    tip: 'أجرِ اكتشاف العملاء قبل بناء أي شيء',
    tipHref: '/customer-discovery',
    tipIcon: Target,
    cta: 'اكتشف عملاءك',
    ctaHref: '/customer-discovery',
    progress: 25,
  },
  mvp: {
    label: 'بناء MVP',
    color: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    tip: 'بناء خطة إطلاق MVP مع منصة الإطلاق',
    tipHref: '/launchpad',
    tipIcon: Rocket,
    cta: 'خطة الإطلاق',
    ctaHref: '/launchpad',
    progress: 40,
  },
  foundation: {
    label: 'مرحلة التأسيس',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    tip: 'ضع أهدافك الفصلية مع نظام OKR',
    tipHref: '/okr',
    tipIcon: Target,
    cta: 'أنشئ أهدافك OKR',
    ctaHref: '/okr',
    progress: 55,
  },
  growth: {
    label: 'مرحلة النمو',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    tip: 'رصد المنافسين وتوسيع قاعدة العملاء',
    tipHref: '/competitor-watch',
    tipIcon: TrendingUp,
    cta: 'رصد المنافسين',
    ctaHref: '/competitor-watch',
    progress: 75,
  },
  scaling: {
    label: 'مرحلة التوسع',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    tip: 'ابنِ فريقاً قوياً مع مساعد الموارد البشرية',
    tipHref: '/hr-ai',
    tipIcon: TrendingUp,
    cta: 'بناء الفريق',
    ctaHref: '/hr-ai',
    progress: 90,
  },
};

const DEFAULT_CONFIG = STAGE_CONFIG.idea;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء النور';
  return 'أهلاً بعودتك';
}

export default function WelcomeCard() {
  const { user, dbUser } = useAuth();

  const fullName = dbUser?.name || user?.displayName || 'رائد الأعمال';
  const firstName = fullName.split(' ')[0];
  const stageKey = (dbUser as { startup_stage?: string } | null | undefined)?.startup_stage || 'idea';
  const cfg = STAGE_CONFIG[stageKey] ?? DEFAULT_CONFIG;
  const TipIcon = cfg.tipIcon;
  const companyName = (dbUser as { companyName?: string } | null | undefined)?.companyName;
  const greeting = getGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-6"
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.05) 100%)' }}
    >
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-600/8 blur-[60px] pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Left: greeting */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {cfg.label}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-0.5">
            {greeting}، {firstName} 👋
          </h2>
          {companyName && (
            <p className="text-sm text-neutral-400 mb-3">
              نعمل معك على <span className="text-white font-semibold">{companyName}</span>
            </p>
          )}
          {!companyName && (
            <p className="text-sm text-neutral-400 mb-3">فريقك الذكي جاهز للعمل معك اليوم</p>
          )}

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-neutral-500">تقدّم الرحلة</span>
              <span className={`text-[11px] font-bold ${cfg.color}`}>{cfg.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cfg.progress}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              />
            </div>
          </div>

          {/* Today's tip */}
          <Link
            href={cfg.tipHref}
            className={`group flex items-center gap-3 p-3 rounded-xl border ${cfg.border} ${cfg.bg} hover:bg-opacity-80 transition-all`}
          >
            <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
              <TipIcon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-neutral-500 mb-0.5">نصيحة اليوم</p>
              <p className={`text-sm font-semibold ${cfg.color} leading-snug`}>{cfg.tip}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white shrink-0 transition-colors" />
          </Link>
        </div>

        {/* Right: quick actions */}
        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
          <Link
            href="/chat"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white text-xs font-bold shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            اسأل كلميرون
          </Link>
          <Link
            href={cfg.ctaHref}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-300 text-xs font-semibold hover:border-white/20 hover:text-white transition-all whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {cfg.cta}
          </Link>
          <Link
            href="/opportunities"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-300 text-xs font-semibold hover:border-white/20 hover:text-white transition-all whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-violet-400" />
            الفرص المتاحة
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
