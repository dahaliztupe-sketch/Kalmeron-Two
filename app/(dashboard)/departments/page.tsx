"use client";

import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Megaphone, TrendingUp, Settings, Wallet, Users, Heart, Scale,
  Building2, ArrowLeft, MessageSquareText, Network,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const DEPARTMENTS = [
  {
    slug: "marketing",
    name: "التسويق",
    icon: Megaphone,
    color: "from-pink-500 to-rose-500",
    border: "border-pink-500/25 hover:border-pink-400/50",
    bg: "bg-pink-500/[0.06]",
    glow: "shadow-[0_8px_32px_-8px_rgba(236,72,153,0.25)]",
    description: "هوية العلامة، استراتيجية المحتوى، وجذب العملاء",
    agentCount: 6,
    tasks: ["تحليل السوق", "الحملات الإعلانية", "صناعة المحتوى"],
  },
  {
    slug: "sales",
    name: "المبيعات",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/25 hover:border-emerald-400/50",
    bg: "bg-emerald-500/[0.06]",
    glow: "shadow-[0_8px_32px_-8px_rgba(16,185,129,0.25)]",
    description: "تحويل العملاء المحتملين إلى عملاء يدفعون",
    agentCount: 5,
    tasks: ["قمع المبيعات", "تأهيل العملاء", "العروض البيعية"],
  },
  {
    slug: "operations",
    name: "العمليات",
    icon: Settings,
    color: "from-cyan-500 to-blue-500",
    border: "border-cyan-500/25 hover:border-cyan-400/50",
    bg: "bg-cyan-500/[0.06]",
    glow: "shadow-[0_8px_32px_-8px_rgba(6,182,212,0.25)]",
    description: "بناء المنتج وإدارة العمليات اليومية",
    agentCount: 6,
    tasks: ["إدارة المنتج", "التطوير التقني", "ضمان الجودة"],
  },
  {
    slug: "finance",
    name: "المالية",
    icon: Wallet,
    color: "from-amber-500 to-yellow-500",
    border: "border-amber-500/25 hover:border-amber-400/50",
    bg: "bg-amber-500/[0.06]",
    glow: "shadow-[0_8px_32px_-8px_rgba(245,158,11,0.25)]",
    description: "النمذجة المالية وإدارة علاقات المستثمرين",
    agentCount: 5,
    tasks: ["النماذج المالية", "تقييم الشركة", "هيكل الملكية"],
  },
  {
    slug: "hr",
    name: "الموارد البشرية",
    icon: Users,
    color: "from-indigo-500 to-violet-500",
    border: "border-indigo-500/25 hover:border-indigo-400/50",
    bg: "bg-indigo-500/[0.06]",
    glow: "shadow-[0_8px_32px_-8px_rgba(99,102,241,0.25)]",
    description: "بناء الفريق وتصميم ثقافة الشركة",
    agentCount: 5,
    tasks: ["التوصيفات الوظيفية", "الثقافة المؤسسية", "الهيكل التنظيمي"],
  },
  {
    slug: "support",
    name: "خدمة العملاء",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    border: "border-rose-500/25 hover:border-rose-400/50",
    bg: "bg-rose-500/[0.06]",
    glow: "shadow-[0_8px_32px_-8px_rgba(244,63,94,0.25)]",
    description: "رضا العملاء وبناء قاعدة المعرفة",
    agentCount: 4,
    tasks: ["قاعدة المعرفة", "تذاكر الدعم", "قياس CSAT"],
  },
  {
    slug: "legal",
    name: "القانونية",
    icon: Scale,
    color: "from-slate-400 to-slate-500",
    border: "border-slate-500/25 hover:border-slate-400/50",
    bg: "bg-slate-500/[0.06]",
    glow: "shadow-[0_8px_32px_-8px_rgba(100,116,139,0.25)]",
    description: "حماية الشركة والامتثال القانوني",
    agentCount: 5,
    tasks: ["العقود والاتفاقيات", "الملكية الفكرية", "الخصوصية"],
  },
];

export default function DepartmentsPage() {
  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan/70 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>هيكل الشركة</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
            أقسام شركتك
          </h1>
          <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed">
            فريقك الكامل من الوكلاء الذكيين موزّع على 7 أقسام متخصصة — كل قسم مجهّز بمساعدين أذكياء يعرفون السوق المصري والعربي.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "الأقسام", value: "7", icon: Building2 },
            { label: "الوكلاء", value: "36+", icon: MessageSquareText },
            { label: "مجالات التخصص", value: "150+", icon: Network },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-panel rounded-2xl p-4 text-center">
                <Icon className="w-4 h-4 text-brand-cyan/60 mx-auto mb-1.5" />
                <p className="font-display text-xl md:text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Departments grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <motion.div
                key={dept.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/departments/${dept.slug}`}
                  className={cn(
                    "group block rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1",
                    dept.bg,
                    dept.border,
                    "hover:" + dept.glow
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-text-secondary bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
                        {dept.agentCount} وكلاء
                      </span>
                    </div>
                  </div>

                  <h2 className="font-bold text-base text-white mb-1">{dept.name}</h2>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">{dept.description}</p>

                  <div className="space-y-1 mb-4">
                    {dept.tasks.map((task) => (
                      <div key={task} className="flex items-center gap-2 text-[11px] text-white/40">
                        <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/40 group-hover:text-white/70 transition-colors">
                    <span>فتح القسم</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Org chart link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between glass-panel rounded-2xl px-6 py-4"
        >
          <div className="flex items-center gap-3">
            <Network className="w-5 h-5 text-brand-indigo" />
            <div>
              <p className="text-sm font-bold text-white">الهيكل التنظيمي الكامل</p>
              <p className="text-xs text-text-secondary">عرض مرئي لجميع الوكلاء والعلاقات بينهم</p>
            </div>
          </div>
          <Link href="/org-chart" className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan hover:gap-2.5 transition-all">
            عرض المخطط <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </div>
    </AppShell>
  );
}
