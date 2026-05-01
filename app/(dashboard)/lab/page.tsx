"use client";

import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FlaskConical, Radar, BarChart3, Calculator, Building2,
  ShieldAlert, Trophy, Layers, FileText, MessageSquare,
  Mic, BookOpen, Scale, AlertTriangle, Compass,
  ChefHat, ArrowLeft, Sparkles, TrendingUp,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Tool {
  href: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  category: string;
  badge?: string;
}

const q = (text: string) => `/chat?q=${encodeURIComponent(text)}`;

const TOOLS: Tool[] = [
  {
    href: "/ideas/analyze",
    label: "مختبر الأفكار",
    desc: "اختبر فرضياتك التجارية بإطار علمي قبل أي استثمار",
    icon: FlaskConical,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20 hover:border-violet-400/40",
    category: "أبحاث السوق",
    badge: "جديد",
  },
  {
    href: "/opportunities",
    label: "رادار الفرص",
    desc: "اكتشف فرص التمويل والمسابقات والحاضنات المتاحة لك الآن",
    icon: Radar,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-400/40",
    category: "أبحاث السوق",
  },
  {
    href: q("حلّل لي السوق المستهدف لشركتي وحدّد أكبر 5 فرص غير مستغلّة"),
    label: "تحليل السوق",
    desc: "دراسة عمق السوق والمنافسين وفرص الدخول",
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20 hover:border-violet-400/40",
    category: "أبحاث السوق",
  },
  {
    href: "/investor",
    label: "المدير المالي الذكي",
    desc: "تحليل مالي عميق، نمذجة التدفقات وUnit Economics",
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-400/40",
    category: "المالية",
  },
  {
    href: q("احسب لي ROI لقرار هذا الاستثمار واشرح هل يستحق"),
    label: "حاسبة ROI",
    desc: "احسب العائد على الاستثمار لأي قرار عمل",
    icon: Calculator,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-400/40",
    category: "المالية",
  },
  {
    href: "/investor",
    label: "تنبيه نزيف النقد",
    desc: "راقب السيولة النقدية واحصل على تنبيهات قبل نفاد التمويل",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40",
    category: "المالية",
  },
  {
    href: "/company-builder",
    label: "محاكي الشركات",
    desc: "ابنِ شركة افتراضية كاملة باستخدام الذكاء الاصطناعي",
    icon: Building2,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-400/40",
    category: "التخطيط",
  },
  {
    href: q("ساعدني في بناء Value Proposition Canvas لمنتجي وحدّد الميزة التنافسية الحقيقية"),
    label: "قماش عرض القيمة",
    desc: "صمّم وصقّل عرض القيمة لمنتجك أو خدمتك",
    icon: Compass,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-400/40",
    category: "التخطيط",
  },
  {
    href: "/plan",
    label: "الأهداف والخطة",
    desc: "ضع أهداف OKR احترافية وتتبّع التقدم خطوة بخطوة",
    icon: Layers,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-400/40",
    category: "التخطيط",
  },
  {
    href: q("اشرح لي خطوات تأسيس شركة ذات مسؤولية محدودة في مصر مع التكاليف والمتطلبات القانونية"),
    label: "تأسيس شركة في مصر",
    desc: "دليل شامل لتأسيس شركتك القانونية في مصر خطوة بخطوة",
    icon: Scale,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40",
    category: "قانوني",
  },
  {
    href: q("اعمل لي نموذج عقد خدمات احترافي متوافق مع القانون المصري"),
    label: "نماذج قانونية",
    desc: "عقود وامتثال قانوني جاهزة للسوق المصري والعربي",
    icon: FileText,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40",
    category: "قانوني",
  },
  {
    href: q("ساعدني في صياغة اتفاقية مؤسسين تحمي حقوق كل شريك وتحدد الصلاحيات والحصص"),
    label: "اتفاقية المؤسسين",
    desc: "احمِ شركتك بصياغة اتفاقية مؤسسين واضحة",
    icon: BookOpen,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40",
    category: "قانوني",
  },
  {
    href: q("ما أكثر الأخطاء القاتلة التي يقع فيها رواد الأعمال المصريون في مرحلة التأسيس وكيف أتجنبها؟"),
    label: "درع الأخطاء",
    desc: "تعلّم من أخطاء المؤسسين الآخرين قبل أن تقع فيها",
    icon: ShieldAlert,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20 hover:border-rose-400/40",
    category: "الحكمة المكتسبة",
  },
  {
    href: q("أعطني قصص نجاح مؤسسين عرب ومصريين مع أبرز الدروس المستفادة من تجربة كل منهم"),
    label: "قصص النجاح العربية",
    desc: "قصص نجاح مؤسسين عرب ومصريين تلهمك وتعلّمك",
    icon: Trophy,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20 hover:border-rose-400/40",
    category: "الحكمة المكتسبة",
  },
  {
    href: "/brand-voice",
    label: "صوت العلامة التجارية",
    desc: "عرّف شخصية علامتك التجارية وأسلوب تواصلها",
    icon: Mic,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20 hover:border-pink-400/40",
    category: "التسويق",
  },
  {
    href: q("ساعدني في كتابة استراتيجية تسويقية شاملة لإطلاق منتجي الجديد في السوق المصري"),
    label: "استراتيجية الإطلاق",
    desc: "خطة تسويقية متكاملة لدخول السوق بقوة",
    icon: Sparkles,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20 hover:border-sky-400/40",
    category: "التسويق",
  },
];

const CATEGORIES = [
  "أبحاث السوق",
  "المالية",
  "التخطيط",
  "قانوني",
  "الحكمة المكتسبة",
  "التسويق",
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "أبحاث السوق": FlaskConical,
  "المالية": BarChart3,
  "التخطيط": Building2,
  "قانوني": Scale,
  "الحكمة المكتسبة": Trophy,
  "التسويق": Mic,
};

export default function LabPage() {
  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan/70 uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>أدوات المؤسس</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
            مختبر الأعمال
          </h1>
          <p className="text-text-secondary text-sm md:text-base max-w-2xl leading-relaxed">
            كل الأدوات الاستراتيجية والمالية والقانونية في مكان واحد — من أبحاث السوق إلى التأسيس القانوني.
          </p>
        </motion.div>

        {/* Categories */}
        {CATEGORIES.map((category, ci) => {
          const tools = TOOLS.filter((t) => t.category === category);
          if (tools.length === 0) return null;
          const CatIcon = CATEGORY_ICONS[category];
          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: ci * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <CatIcon className="w-3.5 h-3.5 text-white/50" />
                </div>
                <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">{category}</h2>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isChatLink = tool.href.startsWith("/chat");
                  return (
                    <Link
                      key={`${tool.href}-${tool.label}`}
                      href={tool.href}
                      className={cn(
                        "group rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5",
                        tool.bg
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className={cn("w-4 h-4", tool.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm font-bold text-white leading-tight">{tool.label}</p>
                            {tool.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                {tool.badge}
                              </span>
                            )}
                            {isChatLink && (
                              <MessageSquare className="w-2.5 h-2.5 text-white/20 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{tool.desc}</p>
                        </div>
                        <ArrowLeft className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          );
        })}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-indigo/20 border border-brand-indigo/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-brand-cyan" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">لا تجد ما تبحث عنه؟</p>
            <p className="text-xs text-text-secondary mt-0.5">
              المساعد الذكي يمكنه مساعدتك في أي مهمة تجارية، حتى لو لم تكن مدرجة هنا.
            </p>
          </div>
          <Link
            href="/chat"
            className="shrink-0 flex items-center gap-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_4px_16px_-4px_rgba(79,70,229,0.6)]"
          >
            <span>اسأل المساعد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </div>
    </AppShell>
  );
}
