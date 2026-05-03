'use client';

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Bot, Store, ArrowLeft, Zap, Scale, TrendingUp, Users, BarChart3, ShoppingCart, Truck, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const AGENTS = [
  {
    id: "legal-advisor",
    title: "المستشار القانوني",
    role: "عقود، تأسيس، امتثال",
    tag: "قانوني",
    icon: Scale,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
    q: "أنا رائد أعمال مصري — راجع عقد شراكتي وأخبرني بأهم البنود التي يجب تعديلها قبل التوقيع",
  },
  {
    id: "growth-hacker",
    title: "خبير النمو",
    role: "استراتيجية، قنوات، احتفاظ",
    tag: "نمو",
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/30",
    q: "ساعدني في بناء استراتيجية نمو للسوق المصري بميزانية محدودة. منتجي:",
  },
  {
    id: "financial-advisor",
    title: "المدير المالي",
    role: "تدفق نقدي، Burn Rate، تقييم",
    tag: "مالي",
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    q: "حلّل وضع التدفق النقدي لشركتي الناشئة وأخبرني كيف أطيل الـ Runway",
  },
  {
    id: "hr-specialist",
    title: "مساعد الموارد البشرية",
    role: "توظيف، عقود، ثقافة مؤسسية",
    tag: "موارد بشرية",
    icon: Users,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    q: "ساعدني في كتابة توصيف وظيفي لمدير مبيعات في شركة ناشئة مصرية وحدد الراتب المناسب",
  },
  {
    id: "marketing-analyst",
    title: "محلل التسويق الرقمي",
    role: "إعلانات، محتوى، SEO",
    tag: "تسويق",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    q: "حلّل استراتيجية التسويق الرقمي لشركتي واقترح خطة محتوى للسوق المصري",
  },
  {
    id: "ecommerce-advisor",
    title: "مستشار التجارة الإلكترونية",
    role: "منصات، تحويل، تجربة مستخدم",
    tag: "تجارة إلكترونية",
    icon: ShoppingCart,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    q: "ساعدني في تحسين معدل التحويل في متجري الإلكتروني وتقليل معدل التخلي عن سلة الشراء",
  },
  {
    id: "supply-chain",
    title: "مستشار سلسلة الإمداد",
    role: "موردون، لوجستيات، مخزون",
    tag: "لوجستيات",
    icon: Truck,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    q: "ساعدني في تحسين سلسلة الإمداد لمنتجي وإيجاد موردين موثوقين في مصر والصين",
  },
  {
    id: "investor-relations",
    title: "مساعد علاقات المستثمرين",
    role: "عروض تقديمية، تفاوض، DD",
    tag: "استثمار",
    icon: Heart,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/30",
    q: "ساعدني في التحضير لاجتماع مع مستثمر في مرحلة Seed: ما الأسئلة المتوقعة وكيف أجيب عليها؟",
  },
];

const TAG_COLORS: Record<string, string> = {
  "قانوني": "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
  "نمو": "bg-violet-900/40 text-violet-300 border-violet-700/50",
  "مالي": "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  "موارد بشرية": "bg-rose-900/40 text-rose-300 border-rose-700/50",
  "تسويق": "bg-amber-900/40 text-amber-300 border-amber-700/50",
  "تجارة إلكترونية": "bg-blue-900/40 text-blue-300 border-blue-700/50",
  "لوجستيات": "bg-orange-900/40 text-orange-300 border-orange-700/50",
  "استثمار": "bg-pink-900/40 text-pink-300 border-pink-700/50",
};

export default function MarketplacePage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12 font-sans" dir="rtl">

        <header className="mb-10">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            لوحة التحكم
          </Link>
          <div className="flex items-center gap-3 text-blue-400 mb-3">
            <Store className="w-7 h-7" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">متجر الوكلاء الذكيين</h1>
          </div>
          <p className="text-neutral-400 max-w-2xl">
            وكلاء متخصصون في مجالات الأعمال المختلفة — اختر وكيلاً وابدأ محادثة فورية باللغة العربية.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {AGENTS.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`border rounded-2xl p-5 transition-all hover:scale-[1.02] group flex flex-col ${agent.bg}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.bg}`}>
                    <Icon className={`w-5 h-5 ${agent.color}`} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TAG_COLORS[agent.tag] ?? "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                    {agent.tag}
                  </span>
                </div>

                <h3 className={`text-base font-bold mb-1 group-hover:opacity-90 transition-opacity ${agent.color}`}>
                  {agent.title}
                </h3>
                <p className="text-neutral-500 text-xs flex-1 mb-5">{agent.role}</p>

                <Link
                  href={`/chat?q=${encodeURIComponent(agent.q)}`}
                  className="flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all w-full"
                >
                  <Bot className="w-4 h-4" />
                  ابدأ محادثة
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-sm mb-4">لا تجد الوكيل الذي تحتاجه؟</p>
          <Link
            href="/chat?q=أنصحني بأفضل وكيل ذكي يناسب مشروعي وأحتاجه الآن"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <Bot className="w-4 h-4" />
            اسأل كلميرون
          </Link>
        </div>

      </div>
    </AppShell>
  );
}
