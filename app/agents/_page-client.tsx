"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Search, Sparkles, MessageSquare, Star, CheckCircle2,
  Brain, FlaskConical, Scale, Radar, Shield,
  TrendingUp, BarChart3, PieChart, Lightbulb, Target,
  Users, Globe2, FileText, Calculator, Rocket,
  Building2, Briefcase, Coins, Lock, Cpu, LineChart,
  Receipt, Banknote, ClipboardList, AlertTriangle,
  ChevronLeft, Layers, Zap, Crown, ArrowRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

type Stage = "all" | "idea" | "startup" | "growth" | "scale";

interface Agent {
  id: string;
  name: string;
  nameEn: string;
  stage: Stage;
  desc: string;
  capabilities: string[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
  popular?: boolean;
  isNew?: boolean;
  live?: boolean;
}

const STAGES: {
  id: Stage;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
  desc: string;
  question: string;
}[] = [
  {
    id: "idea",
    label: "الفكرة",
    labelEn: "Idea",
    icon: Lightbulb,
    color: "cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    desc: "اكتشف وتحقق من فكرتك",
    question: "هل فكرتي تستحق المتابعة؟",
  },
  {
    id: "startup",
    label: "الإطلاق",
    labelEn: "Startup",
    icon: Rocket,
    color: "violet",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-400",
    glow: "shadow-violet-500/20",
    desc: "ابنِ وأطلق شركتك",
    question: "كيف أبني شركتي وأسجّلها؟",
  },
  {
    id: "growth",
    label: "النمو",
    labelEn: "Growth",
    icon: TrendingUp,
    color: "emerald",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    desc: "كبّر إيراداتك وفريقك",
    question: "كيف أكبّر إيراداتي وأتوسع؟",
  },
  {
    id: "scale",
    label: "التوسع",
    labelEn: "Scale",
    icon: Crown,
    color: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    desc: "ابنِ إمبراطوريتك",
    question: "كيف أبني إمبراطوريتي؟",
  },
];

const AGENTS: Agent[] = [
  // ─── IDEA ───────────────────────────────────────────────────────────────
  {
    id: "idea-1", name: "مُحلّل الأفكار", nameEn: "Idea Validator", stage: "idea",
    icon: Star, popular: true, live: true,
    desc: "تقييم شامل لفكرتك مع تقرير SWOT وتحليل الجدوى لسوقك المستهدف.",
    capabilities: ["تقييم SWOT متكامل", "جدوى السوق المستهدف", "نقاط القوة والضعف", "توصيات التحسين"],
  },
  {
    id: "idea-2", name: "محلل المنافسين", nameEn: "Competitor Intel", stage: "idea",
    icon: Target, live: true,
    desc: "يحلل المنافسين ويكتشف الفجوات التي تستطيع استغلالها للتميز.",
    capabilities: ["تحليل المنافسين المباشرين", "اكتشاف الفجوات السوقية", "نقاط ضعف المنافسين", "اقتراح نقطة التميز"],
  },
  {
    id: "idea-3", name: "باحث السوق", nameEn: "Market Researcher", stage: "idea",
    icon: Globe2, live: true,
    desc: "يحلل حجم السوق (TAM/SAM/SOM) والاتجاهات والشرائح الأكثر نمواً.",
    capabilities: ["حساب TAM/SAM/SOM", "اتجاهات السوق العالمي", "الشرائح الأعلى قيمة", "توصيات دخول السوق"],
  },
  {
    id: "idea-4", name: "مُصمّم شخصيات العملاء", nameEn: "Persona Designer", stage: "idea",
    icon: Users, popular: true,
    desc: "يبني 5-20 شخصية عميل افتراضية واقعية تمثل شرائح السوق المختلفة.",
    capabilities: ["شخصيات عميل واقعية", "ديموغرافيات وسلوكيات", "محاكاة ردود الفعل", "مقارنة الشرائح"],
  },
  {
    id: "idea-5", name: "مُجري المقابلات الافتراضية", nameEn: "Virtual Interviewer", stage: "idea",
    icon: MessageSquare,
    desc: "يُجري مقابلات عمق مع عملاء افتراضيين يُجيبون كما لو أنهم حقيقيون.",
    capabilities: ["مقابلات عمق افتراضية", "أسئلة مخصصة لمنتجك", "ردود واقعية مفصلة", "استخلاص أنماط مشتركة"],
  },
  {
    id: "idea-6", name: "مُختبر الافتراضات", nameEn: "Assumption Tester", stage: "idea",
    icon: FlaskConical,
    desc: "يحدد افتراضاتك الخطيرة ويصمم أبسط تجربة لاختبارها قبل الاستثمار.",
    capabilities: ["تحديد الافتراضات الجوهرية", "تصميم تجارب الاختبار", "تفسير النتائج", "قرار المضي أو التوقف"],
  },
  {
    id: "idea-7", name: "مُصمّم النموذج التجاري", nameEn: "Business Model Designer", stage: "idea",
    icon: PieChart, isNew: true,
    desc: "يُساعدك في بناء Business Model Canvas تفاعلي ونموذج عمل مستدام.",
    capabilities: ["Business Model Canvas كامل", "مصادر الإيرادات", "الشركاء الرئيسيون", "قابلية التوسع"],
  },

  // ─── STARTUP ─────────────────────────────────────────────────────────────
  {
    id: "startup-1", name: "بنّاء خطة العمل", nameEn: "Plan Builder", stage: "startup",
    icon: FileText, popular: true, live: true,
    desc: "يبني خطة عمل تفصيلية ودراسة جدوى مع توقعات مالية واقعية.",
    capabilities: ["خطة عمل 30+ صفحة", "توقعات مالية 3 سنوات", "تحليل الجدوى", "ملحق للمستثمرين"],
  },
  {
    id: "startup-2", name: "المدير المالي", nameEn: "CFO Agent", stage: "startup",
    icon: BarChart3, popular: true, live: true,
    desc: "النمذجة المالية، تحليل السيناريوهات، التنبؤ بالتدفق النقدي، وتقييم الاستثمارات.",
    capabilities: ["نمذجة مالية تفصيلية", "توقع التدفق النقدي", "تحليل سيناريوهات", "تقييم الاستثمارات"],
  },
  {
    id: "startup-3", name: "المرشد القانوني", nameEn: "Legal Guide", stage: "startup",
    icon: Scale, popular: true, live: true,
    desc: "مرشد قانوني متخصص في التشريعات المصرية: تأسيس، عقود، ضرائب.",
    capabilities: ["اختيار الكيان القانوني", "خطوات التسجيل GAFI", "مراجعة العقود", "الالتزامات الضريبية"],
  },
  {
    id: "startup-4", name: "حارس الأخطاء", nameEn: "Mistake Shield", stage: "startup",
    icon: Shield, live: true,
    desc: "يحميك من الأخطاء عبر تحذيرات استباقية مبنية على السياق والمرحلة.",
    capabilities: ["تحذيرات استباقية", "أخطاء رواد الأعمال", "تحليل المخاطر", "خطة الوقاية"],
  },
  {
    id: "startup-5", name: "مستشار التوظيف", nameEn: "Hiring Advisor", stage: "startup",
    icon: Users, isNew: true, live: true,
    desc: "يساعدك على بناء فريقك الأول باختيار الأدوار المناسبة ورواتب وأسعار تنافسية.",
    capabilities: ["الوصف الوظيفي المناسب", "رواتب وأسعار تنافسية", "جذب أفضل المواهب", "بدائل اقتصادية"],
  },
  {
    id: "startup-6", name: "بنّاء العلامة التجارية", nameEn: "Brand Builder", stage: "startup",
    icon: Sparkles, isNew: true, live: true,
    desc: "يبني هوية علامة تجارية متماسكة: رسالة، قيم، شخصية، وموضع تنافسي.",
    capabilities: ["رسالة العلامة التجارية", "قيم وشخصية العلامة", "الموضع التنافسي", "أمثلة من السوق العربي"],
  },
  {
    id: "startup-7", name: "دليل التأسيس القانوني", nameEn: "Legal Formation", stage: "startup",
    icon: Building2,
    desc: "يُرشدك خطوة بخطوة لتأسيس شركتك في مصر مع الأوراق والتكاليف.",
    capabilities: ["نوع الكيان القانوني", "قائمة الأوراق المطلوبة", "تسجيل GAFI", "تقدير التكاليف"],
  },

  // ─── GROWTH ──────────────────────────────────────────────────────────────
  {
    id: "growth-1", name: "رادار الفرص", nameEn: "Opportunity Radar", stage: "growth",
    icon: Radar, popular: true, live: true,
    desc: "يبحث عن فرص تمويل، مسابقات، هاكاثونات، وحاضنات أعمال مناسبة لقطاعك.",
    capabilities: ["فرص تمويل مناسبة", "مسابقات وهاكاثونات", "حاضنات الأعمال", "خطة التقديم"],
  },
  {
    id: "growth-2", name: "مدرب المبيعات", nameEn: "Sales Coach", stage: "growth",
    icon: Briefcase, isNew: true, live: true,
    desc: "يصمم استراتيجية مبيعات فعّالة وسكريبت البيع وتقنيات إغلاق الصفقة.",
    capabilities: ["استراتيجية مبيعات", "سكريبت البيع بالعربي", "تقنيات إغلاق الصفقة", "KPIs المبيعات"],
  },
  {
    id: "growth-3", name: "استراتيجي التسويق", nameEn: "Marketing Strategist", stage: "growth",
    icon: TrendingUp, isNew: true, live: true,
    desc: "يضع خطة تسويق شاملة: قنوات، محتوى، ميزانية، وخطة 90 يوم لإطلاق ناجح.",
    capabilities: ["خطة تسويق 90 يوم", "توزيع الميزانية", "خطة محتوى عربي", "Facebook/TikTok/Instagram"],
  },
  {
    id: "growth-4", name: "مدير العمليات", nameEn: "Operations Manager", stage: "growth",
    icon: Layers, isNew: true, live: true,
    desc: "يشخّص التحديات التشغيلية ويقترح أنظمة وأدوات لتحسين الكفاءة وتقليل التكاليف.",
    capabilities: ["تشخيص التحديات التشغيلية", "أنظمة العمل SOPs", "أدوات اقتصادية", "مؤشرات الكفاءة KPIs"],
  },
  {
    id: "growth-5", name: "متحف النجاح", nameEn: "Success Museum", stage: "growth",
    icon: Lightbulb, live: true,
    desc: "يحلل قصص نجاح الشركات الناجحة حول العالم ويستخلص الدروس القابلة للتطبيق.",
    capabilities: ["قصص نجاح مشابهة", "دروس قابلة للتطبيق", "مقارنة مع حالتك", "استراتيجيات مجربة"],
  },
  {
    id: "growth-6", name: "ذاكرة المشروع", nameEn: "Project Memory", stage: "growth",
    icon: Brain, popular: true,
    desc: "يحفظ كل شيء عن مشروعك ويُذكّرك بالقرارات السابقة في كل محادثة جديدة.",
    capabilities: ["حفظ سياق المشروع", "ربط المحادثات السابقة", "استرجاع القرارات", "تتبع التطور"],
  },
  {
    id: "growth-7", name: "مُرتّب الأهداف OKR", nameEn: "OKR Builder", stage: "growth",
    icon: Target, isNew: true,
    desc: "يُساعدك في بناء OKRs واضحة وقابلة للقياس لربعك القادم.",
    capabilities: ["صياغة Objectives + Key Results", "مؤشرات الأداء", "ربط OKRs بالاستراتيجية", "متابعة شهرية"],
  },

  // ─── SCALE ───────────────────────────────────────────────────────────────
  {
    id: "scale-1", name: "مستشار الاستثمار", nameEn: "Investment Advisor", stage: "scale",
    icon: Coins, isNew: true, live: true,
    desc: "يقيّم شركتك ويصمم استراتيجية جذب المستثمرين مع فهم Term Sheets والتفاوض.",
    capabilities: ["تقييم الشركة بـ 3 طرق", "استراتيجية جذب مستثمرين", "فهم Term Sheets", "التفاوض على الحصص"],
  },
  {
    id: "scale-2", name: "مخطط التوسع", nameEn: "Expansion Planner", stage: "scale",
    icon: Globe2, isNew: true, live: true,
    desc: "يضع خطة توسع مدروسة لأسواق جديدة مع تحليل المخاطر واستراتيجية الدخول.",
    capabilities: ["تقييم جاهزية التوسع", "تحليل السوق الجديد", "استراتيجية الدخول", "متطلبات قانونية"],
  },
  {
    id: "scale-3", name: "مستشار مجلس الإدارة", nameEn: "Board Advisor", stage: "scale",
    icon: Crown, isNew: true, live: true,
    desc: "يقدم توجيهاً استراتيجياً رفيع المستوى لقرارات المصير: اندماج، تمويل، توسع.",
    capabilities: ["تحليل القرارات الاستراتيجية", "سيناريوهات وخيارات", "توصية واضحة", "خطوات تنفيذية"],
  },
  {
    id: "scale-4", name: "خبير العقارات", nameEn: "Real Estate Expert", stage: "scale",
    icon: Building2, live: true,
    desc: "خبير عقارات استثمارية مصرية: حساب ROI، تقييم الصفقات، تحليل أسواق المدن.",
    capabilities: ["حساب ROI العقاري", "تقييم الصفقات", "تحليل أسواق المدن", "مقارنة الاستثمارات"],
  },
  {
    id: "scale-5", name: "مُعد الملف المالي للمستثمر", nameEn: "Investor Financial Pack", stage: "scale",
    icon: Banknote, isNew: true,
    desc: "يُعد الملف المالي الكامل للمستثمر: P&L متوقع، ميزانية عمومية، وجدول cap table.",
    capabilities: ["P&L توقعي 3 سنوات", "ميزانية عمومية", "Cap Table", "نموذج Term Sheet"],
  },
  {
    id: "scale-6", name: "باحث الشركاء الاستراتيجيين", nameEn: "Partner Finder", stage: "scale",
    icon: Briefcase,
    desc: "يُحدد الشركاء الاستراتيجيين الأنسب لشركتك وكيف تصل إليهم بفعالية.",
    capabilities: ["تحديد الشركاء المحتملين", "استراتيجية التواصل", "نموذج الشراكة", "معايير التقييم"],
  },
];

const stageColorMap = {
  idea:    { text: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    badge: "bg-cyan-500/20 text-cyan-300",    dot: "bg-cyan-400" },
  startup: { text: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/30",  badge: "bg-violet-500/20 text-violet-300",  dot: "bg-violet-400" },
  growth:  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-400" },
  scale:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   badge: "bg-amber-500/20 text-amber-300",    dot: "bg-amber-400" },
  all:     { text: "text-white",       bg: "bg-white/5",        border: "border-white/10",       badge: "bg-white/10 text-white",            dot: "bg-white" },
};

export default function AgentsPage() {
  const [activeStage, setActiveStage] = useState<Stage>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return AGENTS.filter((a) => {
      const matchStage = activeStage === "all" || a.stage === activeStage;
      const matchSearch = !search ||
        a.name.includes(search) ||
        a.desc.includes(search) ||
        a.nameEn.toLowerCase().includes(search.toLowerCase());
      return matchStage && matchSearch;
    });
  }, [activeStage, search]);

  const stagesWithCounts = useMemo(() =>
    STAGES.map(s => ({ ...s, count: AGENTS.filter(a => a.stage === s.id).length })),
    []
  );

  const activeStageInfo = STAGES.find(s => s.id === activeStage);
  const colors = stageColorMap[activeStage];

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs text-brand-cyan font-medium uppercase tracking-widest">AI Agents</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
                وكلاء كلميرون الذكيون
              </h1>
              <p className="text-text-secondary max-w-2xl leading-relaxed">
                <span className="brand-gradient-text font-bold">{AGENTS.length}+ وكيل ذكي</span> منظّمون حسب رحلتك —
                من أول فكرة حتى بناء إمبراطوريتك.
              </p>
            </div>
            <Link
              href="/chat"
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              تحدث مع وكيل الآن
            </Link>
          </div>
        </motion.div>

        {/* Stage Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          {/* Pipeline connector line */}
          <div className="absolute top-8 right-[10%] left-[10%] h-0.5 bg-gradient-to-l from-amber-500/30 via-emerald-500/30 via-violet-500/30 to-cyan-500/30 hidden md:block" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stagesWithCounts.map((stage, i) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              return (
                <motion.button
                  key={stage.id}
                  onClick={() => setActiveStage(isActive ? "all" : stage.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center group cursor-pointer",
                    isActive
                      ? cn(stage.bg, stage.border, "shadow-lg", stage.glow)
                      : "bg-white/[0.03] border-white/8 hover:border-white/20 hover:bg-white/[0.05]"
                  )}
                >
                  {/* Stage number */}
                  <div className={cn(
                    "absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                    isActive ? cn(stage.bg, stage.text, "border", stage.border) : "bg-white/10 text-white/40"
                  )}>
                    {i + 1}
                  </div>

                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    isActive ? cn(stage.bg, "border", stage.border) : "bg-white/5"
                  )}>
                    <Icon className={cn("w-5 h-5", isActive ? stage.text : "text-neutral-500 group-hover:text-neutral-300")} />
                  </div>

                  <div>
                    <div className={cn("font-bold text-sm transition-colors", isActive ? stage.text : "text-white/70")}>
                      {stage.label}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{stage.labelEn}</div>
                  </div>

                  <div className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full border transition-all",
                    isActive ? cn(stageColorMap[stage.id].badge, stage.border) : "bg-white/5 border-white/10 text-neutral-500"
                  )}>
                    {stage.count} وكيل
                  </div>

                  <p className={cn(
                    "text-[11px] leading-tight transition-colors hidden md:block",
                    isActive ? "text-neutral-300" : "text-neutral-600"
                  )}>
                    {stage.question}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* "All" pill + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActiveStage("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all shrink-0",
              activeStage === "all"
                ? "bg-white/10 border-white/25 text-white"
                : "bg-white/[0.03] border-white/10 text-neutral-400 hover:border-white/20"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            جميع الوكلاء
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{AGENTS.length}</span>
          </button>

          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              aria-label="بحث في الوكلاء"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن وكيل بالاسم أو الوظيفة..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Active stage banner */}
        <AnimatePresence mode="wait">
          {activeStage !== "all" && activeStageInfo && (
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn("rounded-2xl border p-4 flex items-center gap-4", activeStageInfo.bg, activeStageInfo.border)}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", activeStageInfo.bg, "border", activeStageInfo.border)}>
                {(() => { const Icon = activeStageInfo.icon; return <Icon className={cn("w-5 h-5", activeStageInfo.text)} />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("font-bold text-sm", activeStageInfo.text)}>{activeStageInfo.label} — {activeStageInfo.labelEn}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{activeStageInfo.question}</div>
              </div>
              <div className={cn("text-xs px-3 py-1 rounded-full border", stageColorMap[activeStage].badge, activeStageInfo.border)}>
                {filtered.length} وكيل
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agents Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              عرض <span className="text-white font-bold">{filtered.length}</span> وكيل
              {search && <span className="text-neutral-500"> لـ &ldquo;{search}&rdquo;</span>}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((agent, i) => {
                const Icon = agent.icon;
                const sc = stageColorMap[agent.stage as keyof typeof stageColorMap];
                const stageInfo = STAGES.find(s => s.id === agent.stage);
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className={cn(
                      "group relative glass-panel rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.01]",
                      "hover:border-white/20 hover:shadow-lg"
                    )}
                  >
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {agent.popular && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20 font-medium">
                          شائع
                        </span>
                      )}
                      {agent.isNew && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">
                          جديد
                        </span>
                      )}
                      {agent.live && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          مُفعّل
                        </span>
                      )}
                    </div>

                    {/* Stage badge top-right */}
                    {activeStage === "all" && stageInfo && (
                      <div className="absolute top-3 right-3">
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-medium", sc.badge, sc.border)}>
                          {stageInfo.label}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-3 mt-5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                        sc.bg, sc.border, "group-hover:scale-110"
                      )}>
                        <Icon className={cn("w-5 h-5", sc.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm leading-tight">{agent.name}</h3>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{agent.nameEn}</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 mt-3 leading-relaxed line-clamp-2">{agent.desc}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-500 border border-white/8">
                          {cap}
                        </span>
                      ))}
                    </div>

                    <Link href="/chat"
                      className={cn(
                        "mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all",
                        "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
                        sc.bg, sc.border, sc.text,
                        "hover:brightness-110"
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      ابدأ محادثة
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-neutral-500">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>لم يُوجد وكيل يطابق بحثك</p>
            </div>
          )}
        </div>

        {/* Journey CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-violet-900/20 via-indigo-900/20 to-cyan-900/20 p-8"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs text-brand-cyan font-medium">رحلتك الريادية</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white mb-2">
              من فكرة إلى إمبراطورية — في 4 مراحل
            </h2>
            <p className="text-neutral-400 text-sm mb-6 max-w-xl">
              كلميرون معك في كل خطوة. ابدأ بتحليل فكرتك، وأطلق شركتك، وكبّر إيراداتك، وتوسّع في أسواق جديدة.
            </p>

            {/* Mini pipeline */}
            <div className="flex items-center gap-2 flex-wrap">
              {STAGES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveStage(s.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105",
                        s.bg, s.border, s.text
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {s.label}
                    </button>
                    {i < STAGES.length - 1 && (
                      <ChevronLeft className="w-3 h-3 text-neutral-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <Link href="/chat" className="mt-6 inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm font-bold">
              ابدأ رحلتك الآن
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* BG decoration */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-48 h-48 bg-cyan-600/5 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </AppShell>
  );
}
