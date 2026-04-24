"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { RoiCalculator } from "@/components/marketing/RoiCalculator";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useReducedMotion } from "motion/react";
import {
  ArrowLeft, Sparkles, LogIn, Brain, Shield, Radar,
  Briefcase, Scale, FlaskConical, Rocket, Check, Menu, X,
  Bot, Zap, ChevronDown, MessageSquareText, Trophy, UserPlus,
  TrendingUp, Globe2, ShieldCheck, Star, Play, ArrowRight,
  BarChart3, Clock, Users, DollarSign, Layers, Target,
  CheckCircle2, XCircle, Minus, ChevronRight, Cpu, Network,
  FileText, Lightbulb, PieChart, Building2, Coins, BookOpen,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AnimatedBrandMark } from "@/components/brand/AnimatedBrandMark";
import { useAuth } from "@/contexts/AuthContext";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const SUGGESTIONS = [
  "حلل فكرة منصة تعليمية للمستقلين",
  "ابني خطة عمل لمتجري الإلكتروني",
  "ما الفرص في قطاع الصحة الرقمية؟",
  "احسب التكاليف المبدئية لمطعم سحابي",
];

const DEPARTMENTS = [
  {
    icon: Brain,
    title: "الدماغ المشترك",
    subtitle: "Shared Brain",
    desc: "ذاكرة ذكية تتعلم من كل محادثة وتربط الأفكار ببيانات شركتك. تذكر كل قرار، كل رقم، كل سياق.",
    color: "cyan",
    gradient: "from-cyan-500 to-indigo-500",
    bg: "from-cyan-500/10 to-indigo-500/5",
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    features: ["ذاكرة طويلة الأمد", "ربط الأفكار تلقائياً", "تعلم مستمر من سياقك"],
    demo: "\"تذكر الفكرة اللي شرحتها الأسبوع الماضي عن المنتج الجديد...\"",
  },
  {
    icon: Bot,
    title: "16 مساعداً ذكياً",
    subtitle: "Your AI Team",
    desc: "فريق متكامل من المسوّقين والمحاسبين والمحامين والمحلّلين يعمل بدوام كامل لصالحك. كل واحد متخصّص في مجاله.",
    color: "indigo",
    gradient: "from-indigo-500 to-violet-500",
    bg: "from-indigo-500/10 to-violet-500/5",
    border: "border-indigo-500/20 hover:border-indigo-400/50",
    features: ["7 أقسام تشغيلية", "مساعدين متخصصون", "تنسيق تلقائي بينهم"],
    demo: "\"ابعت طلبك لمحلل الفكرة والـ CFO والمرشد القانوني في نفس الوقت\"",
  },
  {
    icon: FlaskConical,
    title: "مختبر السوق",
    subtitle: "Market Lab",
    desc: "اختبر فكرتك مع عملاء افتراضيين من سوقك المستهدف قبل أن تنفق جنيهاً واحداً، كأنك عقدت جلسة استماع حقيقية.",
    color: "fuchsia",
    gradient: "from-fuchsia-500 to-pink-500",
    bg: "from-fuchsia-500/10 to-pink-500/5",
    border: "border-fuchsia-500/20 hover:border-fuchsia-400/50",
    features: ["شخصيات افتراضية واقعية", "مقابلات محاكاة", "تقرير استنتاجات فوري"],
    demo: "\"شوفلي رأي 10 عملاء من الجيزة على فكرة تطبيق التوصيل\"",
  },
  {
    icon: Briefcase,
    title: "المدير المالي",
    subtitle: "المدير المالي الذكي",
    desc: "نماذج مالية احترافية وتوقعات تدفق نقدي وتحليل سيناريوهات في دقائق — جاهز للمستثمرين والبنوك.",
    color: "emerald",
    gradient: "from-emerald-500 to-cyan-500",
    bg: "from-emerald-500/10 to-cyan-500/5",
    border: "border-emerald-500/20 hover:border-emerald-400/50",
    features: ["نمذجة مالية تفصيلية", "اختبار السيناريوهات", "مخطط تدفق نقدي"],
    demo: "\"احسبلي نقطة التعادل المالي لو بدأنا بـ 500 ألف جنيه\"",
  },
  {
    icon: Scale,
    title: "الحارس القانوني",
    subtitle: "المرشد القانوني",
    desc: "عقود ونماذج متوافقة مع التشريعات المصرية وقانون GDPR. تأسيس، ضرائب، عقود موظفين — كل شيء مغطّى.",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    bg: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20 hover:border-amber-400/50",
    features: ["قانون 151 المصري", "عقود جاهزة للتخصيص", "نصائح ضريبية"],
    demo: "\"ابني عقد شراكة بين مؤسسين مع بند الخروج\"",
  },
  {
    icon: Radar,
    title: "رادار الفرص",
    subtitle: "Opportunity Radar",
    desc: "تنبيهات لحظية بأحدث جولات التمويل والمسابقات والهاكاثونات والفعاليات المناسبة لمرحلتك وقطاعك.",
    color: "rose",
    gradient: "from-rose-500 to-red-500",
    bg: "from-rose-500/10 to-red-500/5",
    border: "border-rose-500/20 hover:border-rose-400/50",
    features: ["تمويل مناسب لمرحلتك", "فعاليات ريادة الأعمال", "حاضنات ومسرّعات"],
    demo: "\"ابحثلي عن منح وفرص تمويل مناسبة للشركات التقنية في مراحلها الأولى\"",
  },
  {
    icon: Shield,
    title: "حارس الأخطاء",
    subtitle: "Mistake Shield",
    desc: "يحذرك من الأخطاء القاتلة قبل وقوعها بناءً على تجارب مئات الشركات الناشئة في مصر.",
    color: "violet",
    gradient: "from-violet-500 to-purple-500",
    bg: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20 hover:border-violet-400/50",
    features: ["تحذيرات استباقية", "قاعدة بيانات الفشل", "خريطة المخاطر"],
    demo: "\"فحص مشروعي قبل ما نطلق — أي مخاطر مخفية؟\"",
  },
];

const LIVE_DEMO_CONVERSATIONS = [
  {
    user: "عندي فكرة تطبيق للتوصيل للعيادات والمستشفيات في مصر",
    agent: "مُحلّل الأفكار",
    response: "فكرة ممتازة! السوق الطبي في مصر ينمو بـ 15% سنوياً. الفرصة حقيقية لكن في 3 تحديات رئيسية:\n\n**1. التنافسية:** Vezeeta وClinic Finder موجودة لكن تركّزت على الحجز — التوصيل فرصة مختلفة تماماً\n\n**2. الامتثال التنظيمي:** هتحتاج ترخيص من هيئة الرعاية الصحية الأولية\n\n**3. فرصة بين الشركات:** استهداف المستشفيات الخاصة أسرع وأربح من البيع للأفراد مباشرة في البداية\n\nتبي أبدأ بتحليل نقاط القوة والضعف وتقييم الجدوى المالية؟",
    color: "cyan",
    icon: Brain,
  },
  {
    user: "احسبلي تكاليف التأسيس ومتى هوصل لنقطة التعادل المالي",
    agent: "المدير المالي",
    response: "بناءً على سوق التوصيل الطبي في مصر:\n\n**تكاليف التأسيس التقديرية:**\n• التطوير التقني: 250,000 - 400,000 ج.م\n• الترخيص والتأسيس القانوني: 15,000 ج.م\n• التسويق الأولي: 80,000 ج.م\n• **الإجمالي: ~550,000 ج.م**\n\n**نقطة التعادل المالي تقديرياً:** شهر 14-18 بافتراض:\n- 200 طلب/يوم في نهاية الشهر الأول\n- عمولة 12% لكل طلب\n- متوسط فاتورة 180 ج.م\n\nتبي أشوفلك سيناريوهات متعددة مع خطة التمويل؟",
    color: "emerald",
    icon: Briefcase,
  },
  {
    user: "ما الوثائق القانونية اللي محتاجها للتأسيس؟",
    agent: "المرشد القانوني",
    response: "للتأسيس كشركة توصيل متخصصة في مصر، ستحتاج:\n\n**أولاً: التأسيس (الجدول الزمني: 3-4 أسابيع)**\n✓ عقد تأسيس الشركة ذات المسؤولية المحدودة\n✓ نموذج 1 و4 من السجل التجاري\n✓ الحصول على البطاقة الضريبية\n\n**ثانياً: التراخيص الخاصة**\n✓ ترخيص النشاط من المحافظة\n✓ تسجيل في منظومة الفاتورة الإلكترونية (إلزامي)\n\n**ثالثاً: العقود الأساسية**\n✓ عقد شراكة مع العيادات\n✓ عقود العمال والسائقين\n\nأنشئ لك النماذج جاهزة للتوقيع؟",
    color: "amber",
    icon: Scale,
  },
];

const COMPARISON_DATA = [
  { feature: "تحليل السوق", kalmeron: true, consultant: "بآلاف الجنيهات", tools: "يدوي" },
  { feature: "خطة عمل كاملة", kalmeron: true, consultant: "أسابيع", tools: "يدوي" },
  { feature: "نمذجة مالية", kalmeron: true, consultant: "5,000-20,000 ج.م", tools: "جزئي" },
  { feature: "عقود قانونية", kalmeron: true, consultant: "3,000-10,000 ج.م", tools: false },
  { feature: "فحص أخطاء المشروع", kalmeron: true, consultant: false, tools: false },
  { feature: "رادار الفرص والتمويل", kalmeron: true, consultant: false, tools: false },
  { feature: "مختبر السوق الافتراضي", kalmeron: true, consultant: false, tools: false },
  { feature: "متاح 24/7 بدون انتظار", kalmeron: true, consultant: false, tools: "جزئي" },
  { feature: "عربي بالكامل (مصري)", kalmeron: true, consultant: "جزئي", tools: false },
  { feature: "يتعلم من سياق شركتك", kalmeron: true, consultant: "جزئي", tools: false },
];

const TESTIMONIALS = [
  {
    name: "أحمد محمود",
    role: "مؤسس Foodly",
    avatar: "أ",
    color: "from-cyan-500 to-indigo-500",
    text: "اختصرنا 3 شهور كاملة في التأسيس. الحارس القانوني نبّهني لمشكلة في عقد الشراكة قبل ما تتسبب في كارثة، والـ CFO بنى لنا نموذج مالي بعثناه للمستثمر وضمنّا التمويل.",
    metric: "3 أشهر وفّرناها",
    stars: 5,
  },
  {
    name: "نورا فؤاد",
    role: "شريكة مؤسِّسة، تطبيق مكتبة",
    avatar: "ن",
    color: "from-fuchsia-500 to-pink-500",
    text: "مختبر السوق كان مذهلاً. اتكلمنا مع 20 \"عميل افتراضي\" قبل الإطلاق وغيّرنا نموذج الأعمال بالكامل بناءً على الاستنتاجات. وفّرنا ميزانية تسويق ضخمة كنا هنصرفها على الفكرة الغلط.",
    metric: "غيّرنا المسار قبل الإطلاق",
    stars: 5,
  },
  {
    name: "كريم السيد",
    role: "الرئيس التنفيذي، GreenLogix",
    avatar: "ك",
    color: "from-emerald-500 to-cyan-500",
    text: "فريق مساعدين أذكياء بدوام كامل بسعر اشتراك واحد. كنت بادفع 15,000 ج.م شهرياً لمستشار مالي ومحامي ومحلل سوق. دلوقتي كلميرون بيعمل نفس الشغل وأكثر بجزء من التكلفة.",
    metric: "وفّر أكثر من 15K شهرياً",
    stars: 5,
  },
  {
    name: "سارة إبراهيم",
    role: "مؤسِّسة، HealthTech Egypt",
    avatar: "س",
    color: "from-violet-500 to-purple-500",
    text: "رادار الفرص وجدلي منحة تمويلية من ITIDA ما كنتش عارفاها. قدّمنا وكسبنا 500,000 ج.م. كلميرون بيتابع الفرص الجديدة باستمرار وبينبّهني تلقائياً.",
    metric: "500,000 ج.م تمويل من ITIDA",
    stars: 5,
  },
  {
    name: "محمد العمري",
    role: "المدير التقني، شركة ناشئة في القطاع المالي",
    avatar: "م",
    color: "from-amber-500 to-orange-500",
    text: "ما توقعتش إن مساعد ذكي هيفهم السوق المصري بالشكل ده. مش بس بيترجم، بيفهم العقلية والبيروقراطية والقوانين المحلية. شريك حقيقي.",
    metric: "خبرة محلية عميقة",
    stars: 5,
  },
];

const STATS = [
  { value: 16, suffix: "", label: "مساعد ذكي متخصص", icon: Bot },
  { value: 7, suffix: "", label: "أقسام تشغيلية", icon: Layers },
  { value: 1000, suffix: "+", label: "رائد أعمال يثق بنا", icon: Users },
  { value: 3, suffix: "x", label: "أسرع في التأسيس", icon: Zap },
];

const IMPACT_NUMBERS = [
  { number: "73%", label: "من المستخدمين يغيّرون قراراً مهماً بعد اكتشاف مشكلة لم يروها" },
  { number: "14 يوم", label: "متوسط الوقت للحصول على أول خطة عمل احترافية جاهزة للمستثمر" },
  { number: "82%", label: "توفير في تكاليف الاستشارات القانونية والمالية" },
  { number: "3x", label: "أسرع في التأسيس مقارنة بالطريقة التقليدية" },
];

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

function useCountUp(target: number, duration: number = 2000, isInView: boolean = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!isInView || started) return;
    setStarted(true);
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, duration, started]);

  return count;
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    const colors = ["56,189,248", "79,70,229", "139,92,246", "192,38,211"];
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(79,70,229,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="absolute top-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 z-[60]"
    />
  );
}

function TopNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#departments", label: "الأقسام" },
    { href: "#demo", label: "تجربة حية" },
    { href: "#compare", label: "لماذا كلميرون؟" },
    { href: "/pricing", label: "الأسعار" },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-2xl bg-[#05070D]/80 border-b border-white/[0.06]" : "bg-transparent"}`}>
      <ScrollProgress />
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <BrandLogo size={38} glow iconOnly />
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-neutral-300 hover:text-white transition-colors relative group">
              {l.label}
              <span className="absolute -bottom-1 right-0 left-auto h-px w-0 bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2">
              <Rocket className="w-4 h-4" /> لوحة التحكم
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-neutral-300 hover:text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2">
                <LogIn className="w-4 h-4" /> دخول
              </Link>
              <Link href="/auth/signup" className="text-sm font-bold text-white btn-primary px-5 py-2.5 rounded-full flex items-center gap-2">
                ابدأ مجاناً <ArrowLeft className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 active:scale-95" aria-label="فتح القائمة">
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute top-0 inset-x-0 bg-[#0B1020] border-b border-white/10 p-6 rounded-b-3xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <BrandLogo size={38} iconOnly />
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 mb-4">
                {links.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base text-neutral-200 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors">
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link href="/auth/login" className="text-center text-base text-white px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5">تسجيل الدخول</Link>
                <Link href="/auth/signup" className="btn-primary text-center text-base font-bold px-5 py-3 rounded-xl">ابدأ مجاناً</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────

function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // Skip parallax y-translate when prefers-reduced-motion is set; keep gentle opacity fade.
  const heroY = useTransform(scrollY, [0, 700], reduce ? [0, 0] : [0, 140]);
  const heroOpacity = useTransform(scrollY, [0, 500], reduce ? [1, 1] : [1, 0.3]);
  const [suggestionIdx, setSuggestionIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSuggestionIdx((i) => (i + 1) % SUGGESTIONS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <motion.section style={{ y: heroY, opacity: heroOpacity }} className="relative min-h-screen flex flex-col justify-center pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleField />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,229,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(56,189,248,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(192,38,211,0.10),transparent)]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, ease: "circOut" }}
          className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-10"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/50 via-indigo-500/50 to-fuchsia-500/50 blur-3xl logo-halo" />
          <div className="relative w-full h-full rounded-3xl border border-white/10 shadow-2xl bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center subtle-float overflow-hidden gradient-border gradient-border-animate">
            <AnimatedBrandMark size={120} halo={false} glow />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(56,189,248,0.10),rgba(56,189,248,0.03))] backdrop-blur-md text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200 mb-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-12px_rgba(56,189,248,0.4)]"
        >
          <span className="live-dot" />
          <Sparkles className="w-3 h-3 text-cyan-300" />
          <span>كلميرون · مقرّ عمليات شركتك الذكي</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-extrabold tracking-tight leading-[1.08] mb-6"
          style={{ fontSize: "clamp(2.5rem, 1.8rem + 4.2vw, 5.5rem)" }}
        >
          <span className="block text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.08)]">فريقك المؤسس</span>
          <span className="block brand-gradient-text pb-2">يعمل ٢٤/٧ لصالحك</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-[15px] sm:text-[17px] md:text-xl text-neutral-300/95 max-w-3xl mx-auto mb-5 leading-[1.85]"
        >
          بدل ما تدفع آلاف الجنيهات لمستشار مالي ومحامي ومحلل سوق ومسوق —<br className="hidden md:block" />
          <span className="text-white font-bold">١٦ مساعداً ذكياً</span> متخصّصاً يعمل كفريقك كاملاً في منصّة واحدة، بالعربية الأصيلة.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-medium text-neutral-400 mb-10"
        >
          <span className="flex items-center gap-1.5 transition-colors hover:text-emerald-300"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> متوافق مع قانون ١٥١</span>
          <span className="w-1 h-1 rounded-full bg-white/15" />
          <span className="flex items-center gap-1.5 transition-colors hover:text-cyan-300"><Globe2 className="w-3.5 h-3.5 text-cyan-400" /> عربي مصري أصيل</span>
          <span className="w-1 h-1 rounded-full bg-white/15" />
          <span className="flex items-center gap-1.5 transition-colors hover:text-fuchsia-300"><TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" /> +١٠٠٠ رائد أعمال</span>
          <span className="w-1 h-1 rounded-full bg-white/15" />
          <span className="flex items-center gap-1.5 transition-colors hover:text-amber-300"><Zap className="w-3.5 h-3.5 text-amber-400" /> مجاناً للبداية</span>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.45, ease: "easeOut" }}
          onSubmit={submit} className="relative max-w-2xl mx-auto group mb-6"
        >
          <div className="absolute -inset-[1.5px] rounded-3xl bg-gradient-to-r from-cyan-500/60 via-indigo-500/60 to-fuchsia-500/60 opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-500" />
          <div className="relative flex items-center bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,12,28,0.96))] backdrop-blur-xl border border-white/[0.10] rounded-3xl p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)] focus-within:border-white/25 transition-all duration-300">
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="بم تفكر اليوم؟ احكي فكرتك بالعامية…"
              className="flex-1 bg-transparent border-none outline-none text-white px-5 py-4 text-base md:text-lg placeholder:text-neutral-500"
            />
            <button type="submit" disabled={!query.trim()}
              className="shrink-0 btn-primary rounded-2xl px-5 py-3.5 md:px-7 md:py-4 disabled:opacity-40 disabled:hover:translate-y-0 text-sm font-bold gap-2"
            >
              <span className="hidden sm:inline">ابدأ الآن</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto"
        >
          {SUGGESTIONS.map((t, i) => (
            <button key={t} onClick={() => setQuery(t)}
              className={`text-xs md:text-sm border text-neutral-200 px-3.5 py-2 rounded-full transition-all duration-300 ${i === suggestionIdx ? "bg-indigo-500/20 border-indigo-400/40 text-white" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/30"}`}
            >
              {t}
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
        >
          <Link href="/auth/signup" className="btn-primary flex items-center gap-2 text-base font-bold px-8 py-4 rounded-full">
            ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5" />
          </Link>
          <a href="#demo" className="btn-ghost flex items-center gap-2 text-base px-8 py-4 rounded-full">
            <Play className="w-4 h-4 text-cyan-400" /> شوف تجربة حية
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          className="flex justify-center mt-16"
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-neutral-500 text-xs cursor-pointer"
          >
            <span>اكتشف المزيد</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────

function StatCard({ stat, delay }: { stat: typeof STATS[0]; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useCountUp(stat.value, 1800, isInView);
  const Icon = stat.icon;
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay }} whileHover={{ y: -4, scale: 1.02 }}
      className="relative group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-6 py-7 text-center hover:border-indigo-400/30 transition-all overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-cyan-500/0 group-hover:from-indigo-500/5 group-hover:to-cyan-500/5 transition-all" />
      <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
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

// ─────────────────────────────────────────────
// DEPARTMENTS SHOWCASE
// ─────────────────────────────────────────────

function DepartmentsSection() {
  const [active, setActive] = useState(0);
  const ActiveIcon = DEPARTMENTS[active].icon;

  return (
    <section id="departments" className="relative px-4 py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-cyan-200 mb-4">
            <Network className="w-3.5 h-3.5" /> 7 أقسام تشغيلية
          </div>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
            فريق متكامل في <span className="brand-gradient-text">منصة واحدة</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            من تحليل الفكرة وحتى التوسع. لكل قسم مساعدين متخصصون يعملون معاً تلقائياً.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-2 flex flex-col gap-2 md:gap-3">
            {DEPARTMENTS.map((d, i) => {
              const Icon = d.icon;
              const isActive = active === i;
              return (
                <motion.button key={d.title} onClick={() => setActive(i)}
                  whileHover={{ x: -4 }} whileTap={{ scale: 0.98 }}
                  className={`w-full text-right flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${isActive ? `bg-gradient-to-r ${d.bg} ${d.border} border shadow-lg` : "bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]"}`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${d.gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className={`font-bold text-sm ${isActive ? "text-white" : "text-neutral-200"}`}>{d.title}</div>
                    <div className="text-xs text-neutral-500">{d.subtitle}</div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 rotate-180" />}
                </motion.button>
              );
            })}
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-3xl border ${DEPARTMENTS[active].border} bg-gradient-to-br ${DEPARTMENTS[active].bg} p-6 md:p-8 backdrop-blur-md`}
              >
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

                <div className={`rounded-2xl bg-black/30 border border-white/10 p-4`}>
                  <p className="text-xs text-neutral-500 mb-2 font-medium">مثال حقيقي</p>
                  <p className="text-sm text-neutral-200 font-medium leading-relaxed" dir="rtl">
                    {DEPARTMENTS[active].demo}
                  </p>
                </div>

                <Link href="/auth/signup"
                  className="mt-5 inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-sm font-bold"
                >
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

// ─────────────────────────────────────────────
// LIVE DEMO
// ─────────────────────────────────────────────

function LiveDemoSection() {
  const [activeConv, setActiveConv] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const conv = LIVE_DEMO_CONVERSATIONS[activeConv];

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    setShowFull(false);
    let i = 0;
    const fullText = conv.response;
    const speed = 12;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        setShowFull(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [activeConv, conv.response]);

  const Icon = conv.icon;

  return (
    <section id="demo" className="relative px-4 py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/8 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-fuchsia-200 mb-4">
            <Play className="w-3.5 h-3.5" /> تجربة حية
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">
            شوف كيف يعمل <span className="brand-gradient-text">كلميرون</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">تجربة حقيقية مع مساعدين كلميرون — اختار السيناريو اللي يناسبك</p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {LIVE_DEMO_CONVERSATIONS.map((c, i) => {
            const CIcon = c.icon;
            return (
              <button key={i} onClick={() => setActiveConv(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeConv === i ? "bg-indigo-500/20 border-indigo-400/50 text-white" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/25"}`}
              >
                <CIcon className="w-3.5 h-3.5" />
                {c.agent}
              </button>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-[#0B1020]/80 backdrop-blur-xl overflow-hidden shadow-2xl"
        >
          <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex-1 text-center min-w-0">
              <span className="text-[11px] sm:text-xs text-neutral-500 truncate block">kalmeron.app/chat</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              مباشر
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-8 space-y-5">
            <div className="flex gap-2 sm:gap-3 items-end justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">أ</div>
              <div className="min-w-0 max-w-[85%] sm:max-w-[80%] bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-br-md px-3 sm:px-4 py-3 text-sm text-white break-words">
                {conv.user}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 items-start justify-end flex-row-reverse">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${conv.color === "cyan" ? "from-cyan-500 to-indigo-500" : conv.color === "emerald" ? "from-emerald-500 to-cyan-500" : "from-amber-500 to-orange-500"} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 max-w-[85%] sm:max-w-[80%] bg-white/[0.04] border border-white/10 rounded-2xl rounded-bl-md px-3 sm:px-4 py-4">
                <div className="text-xs text-neutral-500 mb-2 font-medium">🤖 {conv.agent}</div>
                <div className="text-sm text-neutral-100 leading-relaxed whitespace-pre-line break-words">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-flex gap-1 mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <span className="text-neutral-500 text-sm flex-1">اسأل كلميرون أي شيء…</span>
              <Link href="/auth/signup" className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5">
                ابدأ الآن <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// COMPARISON
// ─────────────────────────────────────────────

function ComparisonCell({ value, kalmeron = false }: { value: boolean | string; kalmeron?: boolean }) {
  if (value === true) return <CheckCircle2 className={`${kalmeron ? "w-5 h-5" : "w-4 h-4"} text-emerald-400 mx-auto`} />;
  if (value === false) return <XCircle className={`${kalmeron ? "w-5 h-5" : "w-4 h-4"} text-red-400/60 mx-auto`} />;
  if (value === "جزئي") return <Minus className="w-4 h-4 text-amber-400 mx-auto" />;
  return <span className="text-[10px] text-center text-red-300 font-medium leading-tight block break-words">{value}</span>;
}

function ComparisonSection() {
  return (
    <section id="compare" className="relative px-4 py-20 md:py-32">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-amber-200 mb-4">
            <Target className="w-3.5 h-3.5" /> لماذا كلميرون؟
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">
            بدل ما تدفع للجميع —<br />
            <span className="brand-gradient-text">كلميرون يكفيك</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base">
            المؤسسون يدفعون 15,000+ ج.م شهرياً لمستشارين متفرقين. كلميرون يعمل كلهم بكسر التكلفة.
          </p>
        </motion.div>

        {/* Mobile: stacked card list (no horizontal squeeze) */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="md:hidden rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/[0.06]"
        >
          <div className="p-4 bg-white/[0.03] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm truncate">كلميرون</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">أفضل قيمة</span>
          </div>
          {COMPARISON_DATA.map((row, i) => (
            <div key={row.feature} className={`p-4 ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}>
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
          <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/5">
            <div className="text-sm font-bold text-white mb-3">التكلفة الشهرية</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-2 px-1">
                <span className="text-emerald-400 font-extrabold text-xs sm:text-sm break-words">من 0 ج.م</span>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 py-2 px-1">
                <span className="text-red-400 font-bold text-xs break-words">+15,000 ج.م</span>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 py-2 px-1">
                <span className="text-amber-400 font-bold text-xs">وقت كثير</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tablet & desktop: full grid table */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="hidden md:block rounded-3xl border border-white/10 overflow-hidden"
        >
          <div className="grid grid-cols-4 bg-white/[0.03] border-b border-white/10">
            <div className="col-span-1 p-4 md:p-5 text-xs md:text-sm font-medium text-neutral-400">الميزة</div>
            <div className="p-4 md:p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-white text-xs md:text-sm">كلميرون</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">أفضل قيمة</span>
            </div>
            <div className="p-4 md:p-5 text-center">
              <div className="text-xs md:text-sm font-medium text-neutral-300">مستشارون<br />متفرقون</div>
            </div>
            <div className="p-4 md:p-5 text-center">
              <div className="text-xs md:text-sm font-medium text-neutral-300">أدوات<br />مجانية</div>
            </div>
          </div>

          {COMPARISON_DATA.map((row, i) => (
            <motion.div key={row.feature} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className={`grid grid-cols-4 border-b border-white/[0.05] ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"} hover:bg-white/[0.03] transition-colors`}
            >
              <div className="col-span-1 p-3 md:p-4 text-xs md:text-sm text-neutral-300 flex items-center">{row.feature}</div>
              <div className="p-3 md:p-4 flex items-center justify-center">
                <ComparisonCell value={row.kalmeron} kalmeron />
              </div>
              <div className="p-3 md:p-4 flex items-center justify-center">
                <ComparisonCell value={row.consultant} />
              </div>
              <div className="p-3 md:p-4 flex items-center justify-center">
                <ComparisonCell value={row.tools} />
              </div>
            </motion.div>
          ))}

          <div className="grid grid-cols-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/5 p-4 md:p-5 border-t border-indigo-500/20">
            <div className="col-span-1 flex items-center text-sm font-bold text-white">التكلفة الشهرية</div>
            <div className="flex items-center justify-center">
              <span className="text-emerald-400 font-extrabold text-sm md:text-base">من 0 ج.م</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-red-400 font-bold text-xs md:text-sm">+15,000 ج.م</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-amber-400 font-bold text-xs md:text-sm">وقت كثير</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          {IMPACT_NUMBERS.map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center hover:border-indigo-400/30 transition-all">
              <div className="font-display text-2xl md:text-3xl font-extrabold brand-gradient-text mb-2">{item.number}</div>
              <div className="text-xs text-neutral-400 leading-relaxed">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="testimonials" className="relative px-4 py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/8 to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-violet-200 mb-4">
            <Trophy className="w-3.5 h-3.5" /> آراء حقيقية
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">
            رواد أعمال <span className="brand-gradient-text">حققوا نتائج حقيقية</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-indigo-500/0 group-hover:to-indigo-500/3 transition-all" />
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

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {TESTIMONIALS.slice(3).map((t, i) => (
            <div key={t.name} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition-all">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold shrink-0`}>
                  {t.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm truncate">{t.name}</div>
                  <div className="text-xs text-neutral-400 truncate">{t.role}</div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full max-w-full break-words">
                  <CheckCircle2 className="w-3 h-3 shrink-0" /> <span className="break-words">{t.metric}</span>
                </div>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────

const STEPS = [
  { n: "01", icon: MessageSquareText, title: "احكي فكرتك", desc: "بالعامية أو الفصحى. كلميرون يفهمك ويطرح الأسئلة الصح.", color: "cyan" },
  { n: "02", icon: Cpu, title: "المساعدين يتحركون", desc: "7 أقسام تعمل بالتوازي — تحليل، مالية، قانون، سوق — كلها في نفس الوقت.", color: "indigo" },
  { n: "03", icon: FileText, title: "تحصل على النتائج", desc: "خطة عمل، نمذجة مالية، تحذيرات، فرص — كلها جاهزة في دقائق.", color: "fuchsia" },
];

function HowItWorks() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-cyan-200 mb-4">
            <Rocket className="w-3.5 h-3.5" /> 3 خطوات فقط
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">
            من الفكرة إلى التشغيل في <span className="brand-gradient-text">دقائق</span>
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="hidden md:block absolute top-10 right-[16%] left-[16%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 }} whileHover={{ y: -6 }}
                className="relative text-center flex flex-col items-center"
              >
                <div className={`relative w-20 h-20 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center mb-5 shadow-xl`}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10" />
                  <Icon className="w-8 h-8 text-white relative" />
                  <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-extrabold">
                    {s.n}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-[220px]">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────

function RoiSection() {
  return (
    <section className="relative px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            احسب توفيرك خلال 30 ثانية
          </h2>
          <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">
            معظم المؤسسين بيوفروا أكثر من 5,000 ج.م شهرياً مقارنة بالاستعانة بمستشارين تقليديين.
          </p>
        </div>
        <RoiCalculator variant="full" />
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
    <section className="relative px-4 py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "circOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> ابدأ مجاناً — بدون بطاقة ائتمان
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            ابدأ رحلتك<br /><span className="brand-gradient-text">الآن</span>
          </h2>

          <p className="text-neutral-300 text-base sm:text-lg mb-10 leading-relaxed">
            +1000 رائد أعمال بدأوا بنفس السؤال اللي في دماغك الآن.<br className="hidden sm:block" />
            كلميرون جاهز يساعدك تحوّله لشركة حقيقية.
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
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> بالعربي الكامل</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> آمن ومشفّر</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const cols = [
    { title: "المنصة", links: [{ href: "#departments", label: "الأقسام" }, { href: "/pricing", label: "الأسعار" }, { href: "/compare", label: "المقارنة" }, { href: "/auth/signup", label: "ابدأ مجاناً" }] },
    { title: "الموارد", links: [{ href: "/blog", label: "المدونة" }, { href: "/use-cases", label: "حالات الاستخدام" }, { href: "/industries", label: "القطاعات" }, { href: "/ai-experts", label: "خبراء الذكاء الاصطناعي" }] },
    { title: "الشركة", links: [{ href: "/privacy", label: "الخصوصية" }, { href: "/terms", label: "الشروط" }, { href: "/compliance", label: "الامتثال" }] },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#05070D] px-4 pt-12 pb-8">
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

// ─────────────────────────────────────────────
// TRUST MARQUEE
// ─────────────────────────────────────────────

const TRUST_LOGOS = ["Foodly", "MaktabaApp", "GreenLogix", "Egypt Innovate", "Flat6Labs", "AUC Ventures", "RiseUp", "Falak Startups", "Cairo Angels", "ITIDA", "Techne Summit"];

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

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070D] text-white overflow-x-hidden" dir="rtl">
      <TopNav />
      <Hero />
      <TrustMarquee />
      <StatsStrip />
      <DepartmentsSection />
      <LiveDemoSection />
      <ComparisonSection />
      <HowItWorks />
      <RoiSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
