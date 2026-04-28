"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  ArrowLeft, Sparkles, Brain, Shield, Radar,
  Briefcase, Scale, FlaskConical, Rocket, Check,
  Bot, Zap, MessageSquareText, Trophy,
  Star, Play, Users, Layers, Target,
  CheckCircle2, XCircle, Minus, ChevronRight, Cpu, Network,
  FileText, Flame, TrendingUp, Clock, ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoiCalculator } from "@/components/marketing/RoiCalculator";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SocialProofLine } from "@/components/landing/SocialProofLine";

// ─── DATA ───────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { icon: Brain, title: "الدماغ المشترك", subtitle: "Shared Brain",
    desc: "ذاكرة ذكية تتعلم من كل محادثة وتربط الأفكار ببيانات شركتك.",
    gradient: "from-cyan-500 to-indigo-500", bg: "from-cyan-500/10 to-indigo-500/5",
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    features: ["ذاكرة طويلة الأمد", "ربط الأفكار تلقائياً", "تعلم مستمر من سياقك"],
    demo: "\"تذكر الفكرة اللي شرحتها الأسبوع الماضي عن المنتج الجديد...\"" },
  { icon: Bot, title: "16 مساعداً ذكياً", subtitle: "Your AI Team",
    desc: "فريق متكامل من المسوّقين والمحاسبين والمحامين والمحلّلين بدوام كامل.",
    gradient: "from-indigo-500 to-violet-500", bg: "from-indigo-500/10 to-violet-500/5",
    border: "border-indigo-500/20 hover:border-indigo-400/50",
    features: ["7 أقسام تشغيلية", "مساعدين متخصصون", "تنسيق تلقائي بينهم"],
    demo: "\"ابعت طلبك لمحلل الفكرة والـ CFO والمرشد القانوني في نفس الوقت\"" },
  { icon: FlaskConical, title: "مختبر السوق", subtitle: "Market Lab",
    desc: "اختبر فكرتك مع عملاء افتراضيين قبل أن تنفق جنيهاً واحداً.",
    gradient: "from-fuchsia-500 to-pink-500", bg: "from-fuchsia-500/10 to-pink-500/5",
    border: "border-fuchsia-500/20 hover:border-fuchsia-400/50",
    features: ["شخصيات افتراضية واقعية", "مقابلات محاكاة", "تقرير استنتاجات فوري"],
    demo: "\"شوفلي رأي 10 عملاء من الجيزة على فكرة تطبيق التوصيل\"" },
  { icon: Briefcase, title: "المدير المالي", subtitle: "CFO الذكي",
    desc: "نماذج مالية احترافية وتوقعات تدفق نقدي جاهزة للمستثمرين.",
    gradient: "from-emerald-500 to-cyan-500", bg: "from-emerald-500/10 to-cyan-500/5",
    border: "border-emerald-500/20 hover:border-emerald-400/50",
    features: ["نمذجة مالية تفصيلية", "اختبار السيناريوهات", "مخطط تدفق نقدي"],
    demo: "\"احسبلي نقطة التعادل المالي لو بدأنا بـ 500 ألف جنيه\"" },
  { icon: Scale, title: "الحارس القانوني", subtitle: "Legal Guard",
    desc: "عقود ونماذج متوافقة مع التشريعات المصرية وقانون GDPR.",
    gradient: "from-amber-500 to-orange-500", bg: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20 hover:border-amber-400/50",
    features: ["قانون 151 المصري", "عقود جاهزة للتخصيص", "نصائح ضريبية"],
    demo: "\"ابني عقد شراكة بين مؤسسين مع بند الخروج\"" },
  { icon: Radar, title: "رادار الفرص", subtitle: "Opportunity Radar",
    desc: "تنبيهات لحظية بأحدث جولات التمويل والمسابقات والفعاليات.",
    gradient: "from-rose-500 to-red-500", bg: "from-rose-500/10 to-red-500/5",
    border: "border-rose-500/20 hover:border-rose-400/50",
    features: ["تمويل مناسب لمرحلتك", "فعاليات ريادة الأعمال", "حاضنات ومسرّعات"],
    demo: "\"ابحثلي عن منح وفرص تمويل مناسبة للشركات التقنية\"" },
  { icon: Shield, title: "حارس الأخطاء", subtitle: "Mistake Shield",
    desc: "يحذرك من الأخطاء القاتلة قبل وقوعها بناءً على تجارب مئات الشركات الناشئة.",
    gradient: "from-violet-500 to-purple-500", bg: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20 hover:border-violet-400/50",
    features: ["تحذيرات استباقية", "قاعدة بيانات الفشل", "خريطة المخاطر"],
    demo: "\"فحص مشروعي قبل ما نطلق — أي مخاطر مخفية؟\"" },
];

const TRENDING_TOOLS = [
  {
    emoji: "📊",
    title: "خطة أعمال كاملة",
    desc: "من الفكرة للخطة في دقائق",
    badge: "🔥 رائج",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    time: "٣ دقائق",
    gradient: "from-indigo-500/20 to-cyan-500/10",
    border: "border-indigo-500/25 hover:border-indigo-400/50",
    query: "ابني خطة أعمال كاملة لمشروعي خطوة بخطوة",
  },
  {
    emoji: "💰",
    title: "نمذجة مالية",
    desc: "توقعات وتدفق نقدي احترافي",
    badge: "جديد",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    time: "٢ دقيقة",
    gradient: "from-emerald-500/20 to-cyan-500/10",
    border: "border-emerald-500/25 hover:border-emerald-400/50",
    query: "احسب لي نموذج مالي أولي لمشروعي مع نقطة التعادل",
  },
  {
    emoji: "⚖️",
    title: "عقد شراكة",
    desc: "متوافق مع القانون المصري",
    badge: null,
    badgeClass: "",
    time: "٩٠ ثانية",
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/25 hover:border-amber-400/50",
    query: "ابني عقد شراكة بين مؤسسين مع بند الخروج والحقوق",
  },
  {
    emoji: "🔍",
    title: "تحليل منافسين",
    desc: "خريطة تنافسية شاملة",
    badge: "🔥 رائج",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    time: "٢ دقيقة",
    gradient: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/25 hover:border-rose-400/50",
    query: "حلل المنافسين الرئيسيين لمشروعي وأعطني مزايا تنافسية",
  },
  {
    emoji: "🎤",
    title: "مقابلة عملاء",
    desc: "١٠ عملاء افتراضيين فوراً",
    badge: null,
    badgeClass: "",
    time: "٥ دقائق",
    gradient: "from-fuchsia-500/20 to-violet-500/10",
    border: "border-fuchsia-500/25 hover:border-fuchsia-400/50",
    query: "أجر مقابلة مع ١٠ عملاء افتراضيين لاختبار فكرتي",
  },
  {
    emoji: "📈",
    title: "Pitch Deck للمستثمر",
    desc: "شرائح احترافية جاهزة",
    badge: null,
    badgeClass: "",
    time: "٤ دقائق",
    gradient: "from-violet-500/20 to-indigo-500/10",
    border: "border-violet-500/25 hover:border-violet-400/50",
    query: "أعد pitch deck احترافي لمشروعي للمستثمرين",
  },
  {
    emoji: "🏛️",
    title: "ضرائب ٢٠٢٤",
    desc: "حسابات دقيقة من القانون المصري",
    badge: "محدَّث ٢٠٢٤",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    time: "٦٠ ثانية",
    gradient: "from-teal-500/20 to-emerald-500/10",
    border: "border-teal-500/25 hover:border-teal-400/50",
    query: "احسب الضرائب والتأمينات المصرية لشركتي بقانون ٢٠٢٤",
  },
  {
    emoji: "🛡️",
    title: "فحص مخاطر",
    desc: "تحذيرات قبل الإطلاق",
    badge: null,
    badgeClass: "",
    time: "٣ دقائق",
    gradient: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/25 hover:border-purple-400/50",
    query: "افحص المخاطر القاتلة في مشروعي قبل الإطلاق",
  },
];

const LIVE_DEMO_CONVERSATIONS = [
  { user: "عندي فكرة تطبيق توصيل للعيادات والمستشفيات في مصر",
    agent: "مُحلّل الأفكار",
    response: "فكرة ممتازة! السوق الطبي في مصر ينمو بـ 15% سنوياً. الفرصة حقيقية لكن في 3 تحديات:\n\n**1. التنافسية:** Vezeeta وClinic Finder موجودة لكن تركّزت على الحجز\n\n**2. الامتثال التنظيمي:** هتحتاج ترخيص من هيئة الرعاية الصحية\n\n**3. فرصة B2B:** استهداف المستشفيات الخاصة أسرع وأربح\n\nتبي أبدأ بتحليل نقاط القوة والضعف؟",
    color: "cyan", icon: Brain },
  { user: "احسبلي تكاليف التأسيس ومتى هوصل لنقطة التعادل",
    agent: "المدير المالي",
    response: "بناءً على سوق التوصيل الطبي في مصر:\n\n**تكاليف التأسيس:**\n• التطوير التقني: 250-400 ألف ج.م\n• الترخيص والتأسيس: 15 ألف ج.م\n• التسويق الأولي: 80 ألف ج.م\n• **الإجمالي: ~550 ألف ج.م**\n\n**نقطة التعادل:** شهر 14-18 بافتراض 200 طلب/يوم\n\nتبي سيناريوهات متعددة؟",
    color: "emerald", icon: Briefcase },
  { user: "ما الوثائق القانونية للتأسيس؟",
    agent: "المرشد القانوني",
    response: "للتأسيس كشركة توصيل في مصر:\n\n**أولاً: التأسيس (3-4 أسابيع)**\n✓ عقد تأسيس LLC\n✓ نموذج 1 و4 من السجل التجاري\n✓ البطاقة الضريبية\n\n**ثانياً: التراخيص**\n✓ ترخيص النشاط من المحافظة\n✓ منظومة الفاتورة الإلكترونية\n\n**ثالثاً: العقود**\n✓ شراكة مع العيادات\n✓ عقود السائقين\n\nأنشئ النماذج جاهزة للتوقيع؟",
    color: "amber", icon: Scale },
];

const COMPARISON_DATA = [
  { feature: "تحليل السوق", kalmeron: true, consultant: "بآلاف الجنيهات", tools: "يدوي" },
  { feature: "خطة عمل كاملة", kalmeron: true, consultant: "أسابيع", tools: "يدوي" },
  { feature: "نمذجة مالية", kalmeron: true, consultant: "5,000-20,000 ج.م", tools: "جزئي" },
  { feature: "عقود قانونية", kalmeron: true, consultant: "3,000-10,000 ج.م", tools: false },
  { feature: "فحص أخطاء المشروع", kalmeron: true, consultant: false, tools: false },
  { feature: "رادار الفرص والتمويل", kalmeron: true, consultant: false, tools: false },
  { feature: "متاح 24/7", kalmeron: true, consultant: false, tools: "جزئي" },
  { feature: "عربي مصري أصيل", kalmeron: true, consultant: "جزئي", tools: false },
];

const TESTIMONIALS = [
  { name: "أحمد محمود", role: "مؤسس Foodly", avatar: "أ", color: "from-cyan-500 to-indigo-500",
    text: "اختصرنا 3 شهور كاملة في التأسيس. الحارس القانوني نبّهني لمشكلة في عقد الشراكة، والـ CFO بنى نموذج مالي ضمنّا بيه التمويل.",
    metric: "3 أشهر وفّرناها", stars: 5 },
  { name: "نورا فؤاد", role: "شريكة مؤسِّسة، تطبيق مكتبة", avatar: "ن", color: "from-fuchsia-500 to-pink-500",
    text: "مختبر السوق كان مذهلاً. اتكلمنا مع 20 عميل افتراضي قبل الإطلاق وغيّرنا نموذج الأعمال بالكامل.",
    metric: "غيّرنا المسار قبل الإطلاق", stars: 5 },
  { name: "كريم السيد", role: "الرئيس التنفيذي، GreenLogix", avatar: "ك", color: "from-emerald-500 to-cyan-500",
    text: "كنت بادفع 15 ألف ج.م شهرياً لمستشار مالي ومحامي ومحلل سوق. دلوقتي كلميرون بيعمل نفس الشغل بجزء من التكلفة.",
    metric: "وفّر 15K+ شهرياً", stars: 5 },
];

const STATS = [
  { value: 16, suffix: "", label: "مساعد ذكي متخصص", icon: Bot },
  { value: 7, suffix: "", label: "أقسام تشغيلية", icon: Layers },
  { value: 1000, suffix: "+", label: "رائد أعمال", icon: Users },
  { value: 3, suffix: "x", label: "أسرع في التأسيس", icon: Zap },
];

const STEPS = [
  { n: "01", icon: MessageSquareText, title: "احكي فكرتك", desc: "بالعامية أو الفصحى. كلميرون يفهمك ويسأل الأسئلة الصح." },
  { n: "02", icon: Cpu, title: "المساعدين يتحركون", desc: "7 أقسام تعمل بالتوازي — تحليل، مالية، قانون، سوق." },
  { n: "03", icon: FileText, title: "تحصل على النتائج", desc: "خطة عمل، نمذجة مالية، تحذيرات، فرص — جاهزة في دقائق." },
];

const TRUST_LOGOS = ["Foodly", "MaktabaApp", "GreenLogix", "Egypt Innovate", "Flat6Labs", "AUC Ventures", "RiseUp", "Falak Startups", "Cairo Angels", "ITIDA"];

// ─── HOOKS ───────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number, isInView: boolean) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (!isInView || startedRef.current) return;
    startedRef.current = true;
    const startTime = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, duration]);
  return count;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────

function TrustMarquee() {
  return (
    <section className="px-4 py-6 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-[0.3em] text-neutral-600 mb-5">موثوق به من قِبل رواد الأعمال في مصر والمنطقة</p>
      <div className="relative max-w-6xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="marquee flex w-max gap-10">
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((name, i) => (
            <span key={i} className="font-display font-bold text-base md:text-lg text-neutral-600 hover:text-neutral-300 transition-colors whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, delay }: { stat: typeof STATS[0]; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useCountUp(stat.value, 1800, isInView);
  const Icon = stat.icon;
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-6 py-7 text-center hover:border-indigo-400/30 transition-colors"
    >
      <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-3 opacity-60" />
      <div className="font-display text-4xl md:text-5xl font-extrabold brand-gradient-text tabular-nums">
        {count}{stat.suffix}
      </div>
      <div className="text-xs md:text-sm text-neutral-400 mt-2">{stat.label}</div>
    </motion.div>
  );
}

function StatsStrip() {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} stat={s} delay={i * 0.08} />)}
      </div>
    </section>
  );
}

// ─── NEW: TRENDING TOOLS SECTION ─────────────────────────────────────

function TrendingToolsSection() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "right" | "left") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? -260 : 260, behavior: "smooth" });
  };

  return (
    <section className="relative px-4 py-12 md:py-16 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300/80">الأكثر استخداماً</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
              ابدأ في ثوانٍ — <span className="brand-gradient-text">اختر مهمتك</span>
            </h2>
          </div>
          {/* Scroll arrows — desktop only */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
            <button onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TRENDING_TOOLS.map((tool, i) => (
            <motion.button
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/auth/signup?q=${encodeURIComponent(tool.query)}`)}
              className={`snap-start shrink-0 w-[200px] sm:w-[220px] rounded-2xl border bg-gradient-to-br ${tool.gradient} ${tool.border} p-4 text-right flex flex-col gap-3 hover:-translate-y-1 transition-all duration-200 active:scale-95 group`}
            >
              {/* Top: emoji + badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl leading-none">{tool.emoji}</span>
                {tool.badge && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeClass} shrink-0`}>
                    {tool.badge}
                  </span>
                )}
              </div>

              {/* Title + desc */}
              <div className="flex-1">
                <div className="font-bold text-sm text-white leading-snug mb-1">{tool.title}</div>
                <div className="text-xs text-neutral-400 leading-snug">{tool.desc}</div>
              </div>

              {/* Bottom: time + arrow */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <Clock className="w-3 h-3 shrink-0" />
                  {tool.time}
                </div>
                <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-indigo-500/40 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-3 h-3 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <p className="md:hidden text-center text-[11px] text-neutral-600 mt-3">← اسحب للمزيد</p>
      </div>
    </section>
  );
}

// ─── DEPARTMENTS SECTION ─────────────────────────────────────────────

function DepartmentsSection() {
  const [active, setActive] = useState(0);
  const ActiveIcon = DEPARTMENTS[active].icon;
  return (
    <section id="departments" className="relative px-4 py-16 md:py-28">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-cyan-200 mb-4">
            <Network className="w-3.5 h-3.5" /> 7 أقسام تشغيلية
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-4">
            فريق متكامل في <span className="brand-gradient-text">منصة واحدة</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-lg">
            استراتيجية · تمويل · قانوني · تسويق · وأكثر. لكل قسم مساعدين متخصصون يعملون معاً تلقائياً.
          </p>
        </motion.div>

        {/* ── Mobile: horizontal scrolling cards ── */}
        <div className="lg:hidden">
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: "none" }}>
            {DEPARTMENTS.map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={`snap-start shrink-0 w-[280px] sm:w-[300px] rounded-2xl border ${d.border} bg-gradient-to-br ${d.bg} p-5 flex flex-col gap-3`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${d.gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">{d.title}</div>
                    <div className="text-xs text-neutral-500 mb-2">{d.subtitle}</div>
                    <p className="text-sm text-neutral-300 leading-relaxed">{d.desc}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {d.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/auth/signup"
                    className="mt-auto inline-flex items-center gap-1.5 btn-primary px-4 py-2.5 rounded-xl text-xs font-bold w-full justify-center">
                    جرّب الآن <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-[11px] text-neutral-600 mt-3">← اسحب للمزيد</p>
        </div>

        {/* ── Desktop: interactive tab layout ── */}
        <div className="hidden lg:grid grid-cols-5 gap-6">
          <div className="col-span-2 flex flex-col gap-2">
            {DEPARTMENTS.map((d, i) => {
              const Icon = d.icon;
              const isActive = active === i;
              return (
                <button key={d.title} onClick={() => setActive(i)}
                  className={`w-full text-right flex items-center gap-3 p-4 rounded-2xl border transition-colors duration-200 ${isActive ? `bg-gradient-to-r ${d.bg} ${d.border} border shadow-lg` : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"}`}>
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${d.gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className={`font-bold text-sm ${isActive ? "text-white" : "text-neutral-200"}`}>{d.title}</div>
                    <div className="text-xs text-neutral-500">{d.subtitle}</div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 rotate-180" />}
                </button>
              );
            })}
          </div>
          <div className="col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className={`h-full rounded-3xl border ${DEPARTMENTS[active].border} bg-gradient-to-br ${DEPARTMENTS[active].bg} p-6 md:p-8 backdrop-blur-md`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${DEPARTMENTS[active].gradient} flex items-center justify-center mb-5 shadow-xl`}>
                  <ActiveIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">{DEPARTMENTS[active].title}</h3>
                <p className="text-sm md:text-base text-neutral-300 leading-relaxed mb-6">{DEPARTMENTS[active].desc}</p>
                <div className="flex flex-col gap-2 mb-6">
                  {DEPARTMENTS[active].features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-neutral-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-black/30 border border-white/10 p-4 mb-5">
                  <p className="text-xs text-neutral-500 mb-2 font-medium">مثال حقيقي</p>
                  <p className="text-sm text-neutral-200 font-medium leading-relaxed" dir="rtl">{DEPARTMENTS[active].demo}</p>
                </div>
                <Link href="/auth/signup" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">
                  جرّب {DEPARTMENTS[active].title} <ArrowLeft className="w-4 h-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveDemoSection() {
  const [activeConv, setActiveConv] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const conv = LIVE_DEMO_CONVERSATIONS[activeConv];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const fullText = conv.response;
    const step = 4; // slightly faster
    const interval = setInterval(() => {
      if (i < fullText.length) {
        i = Math.min(i + step, fullText.length);
        setDisplayedText(fullText.slice(0, i));
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [activeConv, conv.response]);

  const Icon = conv.icon;
  return (
    <section id="demo" className="relative px-4 py-16 md:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-fuchsia-200 mb-4">
            <Play className="w-3.5 h-3.5" /> تجربة حية
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-3">
            شوف كيف يعمل <span className="brand-gradient-text">كلميرون</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base">اختر السيناريو وشاهد المساعد يجيب فوراً</p>
        </motion.div>

        {/* Scenario selector — horizontal scroll on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar" style={{ scrollbarWidth: "none" }}>
          {LIVE_DEMO_CONVERSATIONS.map((c, i) => {
            const CIcon = c.icon;
            return (
              <button key={i} onClick={() => setActiveConv(i)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeConv === i ? "bg-indigo-500/20 border-indigo-400/50 text-white" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/25"}`}>
                <CIcon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{c.agent}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0B1020]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex-1 text-center min-w-0">
              <span className="text-[11px] text-neutral-500 truncate block">kalmeron.app/chat</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> مباشر
            </div>
          </div>

          {/* Chat body */}
          <div className="p-4 sm:p-5 md:p-8 space-y-5">
            {/* User message */}
            <div className="flex gap-2 sm:gap-3 items-end">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">أ</div>
              <div className="min-w-0 max-w-[85%] bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-br-md px-3 sm:px-4 py-3 text-sm text-white break-words">
                {conv.user}
              </div>
            </div>

            {/* Agent response */}
            <div className="flex gap-2 sm:gap-3 items-start flex-row-reverse">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${conv.color === "cyan" ? "from-cyan-500 to-indigo-500" : conv.color === "emerald" ? "from-emerald-500 to-cyan-500" : "from-amber-500 to-orange-500"} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 max-w-[85%] bg-white/[0.04] border border-white/10 rounded-2xl rounded-bl-md px-3 sm:px-4 py-4">
                <div className="text-xs text-neutral-500 mb-2 font-medium">🤖 {conv.agent}</div>
                <div className="text-sm text-neutral-100 leading-relaxed whitespace-pre-line break-words">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-flex gap-1 mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="p-3 sm:p-4 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <span className="text-neutral-500 text-sm flex-1 text-right">اسأل كلميرون أي شيء…</span>
              <Link href="/auth/signup" className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0">
                ابدأ الآن <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonCell({ value, kalmeron = false }: { value: boolean | string; kalmeron?: boolean }) {
  if (value === true) return <CheckCircle2 className={`${kalmeron ? "w-5 h-5" : "w-4 h-4"} text-emerald-400 mx-auto`} />;
  if (value === false) return <XCircle className={`${kalmeron ? "w-5 h-5" : "w-4 h-4"} text-red-400/60 mx-auto`} />;
  if (value === "جزئي") return <Minus className="w-4 h-4 text-amber-400 mx-auto" />;
  return <span className="text-[10px] text-center text-red-300 font-medium leading-tight block break-words">{value}</span>;
}

function ComparisonSection() {
  return (
    <section id="compare" className="relative px-4 py-16 md:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-amber-200 mb-4">
            <Target className="w-3.5 h-3.5" /> لماذا كلميرون؟
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-3">
            بدل ما تدفع للجميع — <span className="brand-gradient-text">كلميرون يكفيك</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base">
            المؤسسون يدفعون 15,000+ ج.م شهرياً لمستشارين متفرقين. كلميرون يعمل كلهم بكسر التكلفة.
          </p>
        </motion.div>

        {/* Mobile */}
        <div className="md:hidden rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/[0.06]">
          <div className="p-4 bg-white/[0.03] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">كلميرون</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">أفضل قيمة</span>
          </div>
          {COMPARISON_DATA.map((row, i) => (
            <div key={row.feature} className={`p-4 ${i % 2 ? "bg-white/[0.015]" : ""}`}>
              <div className="text-sm text-neutral-200 font-medium mb-3">{row.feature}</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 px-2 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-neutral-500">كلميرون</span>
                  <ComparisonCell value={row.kalmeron} kalmeron />
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 px-2 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-neutral-500">مستشارون</span>
                  <ComparisonCell value={row.consultant} />
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 px-2 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-neutral-500">أدوات</span>
                  <ComparisonCell value={row.tools} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-4 bg-white/[0.03] border-b border-white/10">
            <div className="col-span-1 p-5 text-sm font-medium text-neutral-400">الميزة</div>
            <div className="p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-white text-sm">كلميرون</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">أفضل قيمة</span>
            </div>
            <div className="p-5 text-center text-sm font-medium text-neutral-300">مستشارون<br />متفرقون</div>
            <div className="p-5 text-center text-sm font-medium text-neutral-300">أدوات<br />مجانية</div>
          </div>
          {COMPARISON_DATA.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-4 border-b border-white/[0.05] ${i % 2 ? "bg-white/[0.015]" : ""}`}>
              <div className="col-span-1 p-4 text-sm text-neutral-300 flex items-center">{row.feature}</div>
              <div className="p-4 flex items-center justify-center"><ComparisonCell value={row.kalmeron} kalmeron /></div>
              <div className="p-4 flex items-center justify-center"><ComparisonCell value={row.consultant} /></div>
              <div className="p-4 flex items-center justify-center"><ComparisonCell value={row.tools} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative px-4 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-cyan-200 mb-4">
            <Rocket className="w-3.5 h-3.5" /> 3 خطوات فقط
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-white">
            من الفكرة إلى التشغيل في <span className="brand-gradient-text">دقائق</span>
          </h2>
        </motion.div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          <div className="hidden md:block absolute top-10 right-[16%] left-[16%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start md:flex-col md:items-center gap-4 md:gap-0 md:text-center p-4 md:p-0">
                {/* Mobile: horizontal layout */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center md:mb-5 shadow-xl shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10" />
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white relative" />
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-extrabold">
                    {s.n}
                  </div>
                </div>
                <div className="flex-1 md:flex-none">
                  <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">{s.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed md:max-w-[220px]">{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RoiSection() {
  return (
    <section className="relative px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            احسب توفيرك في 30 ثانية
          </h2>
          <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">
            معظم المؤسسين يوفّرون 5,000+ ج.م شهرياً مقارنة بالاستعانة بمستشارين تقليديين.
          </p>
        </div>
        <RoiCalculator variant="full" />
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative px-4 py-16 md:py-28">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-violet-200 mb-4">
            <Trophy className="w-3.5 h-3.5" /> آراء حقيقية
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-white">
            رواد أعمال <span className="brand-gradient-text">حققوا نتائج</span>
          </h2>
        </motion.div>

        {/* Mobile: horizontal scroll */}
        <div className="lg:hidden flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: "none" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className="snap-start shrink-0 w-[280px] rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold shrink-0`}>
                  {t.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm truncate">{t.name}</div>
                  <div className="text-xs text-neutral-400">{t.role}</div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-1.5 pt-3 border-t border-white/[0.06]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-emerald-400">{t.metric}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="lg:hidden text-center text-[11px] text-neutral-600 mt-2">← اسحب للمزيد</p>

        {/* Desktop: grid */}
        <div className="hidden lg:grid grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-colors">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {t.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm truncate">{t.name}</div>
                  <div className="text-xs text-neutral-400 break-words">{t.role}</div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-emerald-400">{t.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query)}`);
    else router.push("/auth/signup");
  };
  return (
    <section className="relative px-4 py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[80px]" />
      </div>
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> ابدأ مجاناً — بدون بطاقة ائتمان
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            ابدأ رحلتك<br /><span className="brand-gradient-text">الآن</span>
          </h2>
          <p className="text-neutral-300 text-base sm:text-lg mb-8 leading-relaxed">
            <SocialProofLine />
            <br className="hidden sm:block" />
            كلميرون جاهز يساعدك تحوّل فكرتك لشركة حقيقية.
          </p>
          <form onSubmit={submit} className="relative max-w-xl mx-auto group mb-6">
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500/60 via-indigo-500/60 to-fuchsia-500/60 blur-md opacity-70 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-[#0B1020]/90 backdrop-blur-xl border border-white/15 rounded-3xl p-2 shadow-2xl">
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="ابدأ بفكرتك الآن…"
                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3.5 text-base placeholder-neutral-500"
              />
              <button type="submit" className="shrink-0 btn-primary rounded-2xl px-5 py-3.5 text-sm font-bold flex items-center gap-2">
                ابدأ <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> مجاني للبداية</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> بدون بطاقة</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> آمن ومشفّر</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const cols = [
    { title: "المنصة", links: [{ href: "#departments", label: "الأقسام" }, { href: "/pricing", label: "الأسعار" }, { href: "/compare", label: "المقارنة" }, { href: "/auth/signup", label: "ابدأ مجاناً" }] },
    { title: "الموارد", links: [{ href: "/blog", label: "المدونة" }, { href: "/use-cases", label: "حالات الاستخدام" }, { href: "/industries", label: "القطاعات" }] },
    { title: "الشركة", links: [{ href: "/privacy", label: "الخصوصية" }, { href: "/terms", label: "الشروط" }, { href: "/compliance", label: "الامتثال" }] },
  ];
  return (
    <footer className="border-t border-white/[0.06] bg-[#05070D] px-4 pt-10 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <BrandLogo size={36} glow iconOnly />
            <p className="text-sm text-neutral-500 mt-3 leading-relaxed max-w-xs">
              مقرّ عمليات شركتك الذكي. 16 مساعداً ذكياً يعملون كفريقك المؤسّس.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-neutral-200 mb-3">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-neutral-500 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>© {year} Kalmeron AI. جميع الحقوق محفوظة.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            جميع الأنظمة تعمل بكفاءة
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Sticky mobile CTA (only shows after scrolling 600px) ─────────────

function MobileFloatingCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="fixed bottom-5 inset-x-4 z-50 md:hidden"
        >
          <Link
            href="/auth/signup"
            className="btn-primary flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-base font-bold shadow-[0_8px_32px_-8px_rgba(79,70,229,0.7)] border border-indigo-400/30"
          >
            <Sparkles className="w-4 h-4" />
            ابدأ مجاناً الآن
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── DEFAULT EXPORT ──────────────────────────────────────────────────

export default function HomeBelowFold() {
  return (
    <>
      <TrustMarquee />
      <StatsStrip />
      <TrendingToolsSection />
      <DepartmentsSection />
      <LiveDemoSection />
      <ComparisonSection />
      <HowItWorks />
      <RoiSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
      <MobileFloatingCTA />
    </>
  );
}
