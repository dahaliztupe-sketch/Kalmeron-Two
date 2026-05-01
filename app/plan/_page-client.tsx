"use client";

import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ScrollText, Target, Route, Lightbulb, ChevronLeft,
  TrendingUp, BarChart2, Compass, Brain, ArrowLeft,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const HUBS = [
  {
    href: "/okr",
    label: "الأهداف والمؤشرات",
    sublabel: "OKRs",
    desc: "حدّد أهداف ربع السنة وراقب تقدّم فريقك باستخدام إطار OKR المُعدَّل للشركات الناشئة.",
    icon: Target,
    gradient: "from-brand-indigo to-brand-violet",
    border: "border-brand-indigo/30 hover:border-brand-indigo/60",
    bg: "bg-brand-indigo/[0.06]",
    tags: ["أهداف", "KPIs", "متابعة الأداء"],
  },
  {
    href: "/roadmap",
    label: "خارطة الطريق",
    sublabel: "Roadmap",
    desc: "ابنِ خارطة الطريق المرئية لمنتجك أو شركتك — من الأولويات إلى المعالم الزمنية.",
    icon: Route,
    gradient: "from-cyan-500 to-blue-500",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    bg: "bg-cyan-500/[0.06]",
    tags: ["مخطط زمني", "أولويات", "مراحل التطوير"],
  },
  {
    href: "/ideas",
    label: "قاعدة الأفكار",
    sublabel: "Ideas",
    desc: "التقط أفكارك قبل أن تضيع — نظّمها وقيّمها وحوّل الجيد منها إلى مهام قابلة للتنفيذ.",
    icon: Lightbulb,
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-500/30 hover:border-amber-400/60",
    bg: "bg-amber-500/[0.06]",
    tags: ["أفكار المنتج", "التقييم", "تحويل لمهام"],
  },
  {
    href: "/brain",
    label: "ذاكرة الشركة",
    sublabel: "Company Brain",
    desc: "مستودع المعرفة المؤسسية — القرارات، الدروس المستفادة، وسياق عملك كله في مكان واحد.",
    icon: Brain,
    gradient: "from-violet-500 to-purple-500",
    border: "border-violet-500/30 hover:border-violet-400/60",
    bg: "bg-violet-500/[0.06]",
    tags: ["المعرفة", "القرارات", "السياق"],
  },
];

const QUICK_STATS = [
  { label: "OKRs نشطة", value: "—", icon: Target, color: "text-brand-indigo" },
  { label: "مهام مكتملة", value: "—", icon: TrendingUp, color: "text-emerald-400" },
  { label: "أفكار محفوظة", value: "—", icon: Lightbulb, color: "text-amber-400" },
  { label: "معالم الطريق", value: "—", icon: BarChart2, color: "text-cyan-400" },
];

export default function PlanPageClient() {
  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan/70 uppercase tracking-wider">
            <ScrollText className="w-3.5 h-3.5" />
            <span>التخطيط الاستراتيجي</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
            الخطة والأهداف
          </h1>
          <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed">
            كل ما تحتاجه لتخطيط شركتك في مكان واحد — من الأهداف الربعية إلى خارطة الطريق وقاعدة الأفكار.
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {QUICK_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center">
                <Icon className={cn("w-4 h-4 mb-2", stat.color)} />
                <p className="font-display text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Hub cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HUBS.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={hub.href}
                  className={cn(
                    "group block rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5",
                    hub.bg, hub.border
                  )}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${hub.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowLeft className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:-translate-x-0.5 transition-all mt-1" />
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{hub.sublabel}</span>
                    <h2 className="font-bold text-lg text-white leading-tight mt-0.5">{hub.label}</h2>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed mb-4">{hub.desc}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {hub.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold text-white/30 bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* AI Strategy help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo/20 border border-brand-indigo/30 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-brand-cyan" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">ساعدني في رسم الاستراتيجية</p>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                احصل على مساعدة فورية من المساعد الذكي في صياغة OKRs أو بناء خارطة الطريق لشركتك.
              </p>
            </div>
            <Link
              href="/chat?prompt=%D8%B3%D8%A7%D8%B9%D8%AF%D9%86%D9%8A+%D9%81%D9%8A+%D8%A8%D9%86%D8%A7%D8%A1+%D8%A7%D8%B3%D8%AA%D8%B1%D8%A7%D8%AA%D9%8A%D8%AC%D9%8A%D8%A9+%D9%88%D8%A7%D8%B6%D8%AD%D8%A9+%D9%88%D8%AE%D8%A7%D8%B1%D8%B7%D8%A9+%D8%B7%D8%B1%D9%8A%D9%82+%D9%84%D8%B4%D8%B1%D9%83%D8%AA%D9%8A"
              className="shrink-0 flex items-center gap-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_4px_16px_-4px_rgba(79,70,229,0.6)]"
            >
              <span>ابدأ الآن</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>
    </AppShell>
  );
}
