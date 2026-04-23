"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Sparkles, LogIn, UserPlus, Brain, Shield, Radar,
  Briefcase, Scale, FlaskConical, Rocket, Star, Check, Menu, X,
  Bot, Zap, ChevronDown, MessageSquareText, Trophy,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";

// ───────────────────────────────────────────────────────────────────────────
// Data
// ───────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "حلل فكرة منصة تعليمية للمستقلين",
  "ابني خطة عمل لمتجري الإلكتروني",
  "ما الفرص في قطاع الصحة الرقمية؟",
  "احسب التكاليف المبدئية لمطعم سحابي",
];

const FEATURES = [
  {
    icon: Brain,
    title: "الدماغ المشترك",
    desc: "ذاكرة ذكية تتعلم من كل محادثة وتربط الأفكار ببيانات شركتك.",
    accent: "from-indigo-500/20 to-purple-500/10",
    iconColor: "text-indigo-300",
  },
  {
    icon: Bot,
    title: "+50 وكيل ذكي",
    desc: "فريق متكامل من المسوقين والمحاسبين والمحامين يعمل بدوام كامل لصالحك.",
    accent: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-300",
  },
  {
    icon: FlaskConical,
    title: "مختبر السوق",
    desc: "اختبر فكرتك مع مستهلكين تركيبيين قبل أن تنفق جنيهاً واحداً.",
    accent: "from-fuchsia-500/20 to-pink-500/10",
    iconColor: "text-fuchsia-300",
  },
  {
    icon: Briefcase,
    title: "المدير المالي (CFO)",
    desc: "نماذج مالية وتوقعات سيولة جاهزة للمستثمرين.",
    accent: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-300",
  },
  {
    icon: Scale,
    title: "الحارس القانوني",
    desc: "عقود ونماذج متوافقة مع قانون 151 المصري وLawAct GDPR.",
    accent: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-300",
  },
  {
    icon: Radar,
    title: "رادار الفرص",
    desc: "تنبيهات لحظية بأحدث جولات التمويل والمسابقات والفعاليات.",
    accent: "from-rose-500/20 to-red-500/10",
    iconColor: "text-rose-300",
  },
];

const STATS = [
  { value: "50+", label: "وكيل ذكي متخصص" },
  { value: "7", label: "أقسام تشغيلية" },
  { value: "24/7", label: "متاح بلا توقف" },
  { value: "AR", label: "عربي بالكامل" },
];

const STEPS = [
  { n: "01", title: "احكي فكرتك", desc: "بالعامية أو الفصحى. اشرح ما تريد بناءه." },
  { n: "02", title: "نُحلّلها لك", desc: "السوق، التكلفة، المخاطر القانونية، فرص النمو." },
  { n: "03", title: "ننفّذ معك", desc: "خطة عمل، نماذج مالية، عقود، حملات تسويق جاهزة." },
];

const TESTIMONIALS = [
  { name: "أحمد محمود", role: "مؤسس Foodly", text: "اختصرنا 3 شهور في تأسيس الشركة بفضل الحارس القانوني والـ CFO." },
  { name: "نورا فؤاد", role: "Co-founder, MaktabaApp", text: "مختبر السوق وفّر علينا ميزانية تسويق ضخمة قبل الإطلاق." },
  { name: "كريم السيد", role: "CEO, GreenLogix", text: "فريق وكلاء بدوام كامل بسعر اشتراك واحد. تجربة غير عادية." },
];

// ───────────────────────────────────────────────────────────────────────────
// Aurora background
// ───────────────────────────────────────────────────────────────────────────

function Aurora() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.18),transparent_55%)]" />
      <motion.div
        animate={{ x: [0, 60, -40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-indigo-600/25 blur-[140px]"
      />
      <motion.div
        animate={{ x: [0, -50, 30, 0], y: [0, -30, 50, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[140px]"
      />
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[35%] left-[40%] w-[35vw] h-[35vw] rounded-full bg-fuchsia-600/15 blur-[120px]"
      />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Top Navigation (desktop + mobile)
// ───────────────────────────────────────────────────────────────────────────

function TopNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: "المميزات" },
    { href: "#how", label: "كيف يعمل" },
    { href: "#testimonials", label: "آراء" },
    { href: "/pricing", label: "الأسعار" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[#080C14]/70 border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <BrandLogo size={36} glow />

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-neutral-300 hover:text-white transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 right-0 left-auto h-px w-0 bg-gradient-to-r from-indigo-400 to-blue-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/auth/login"
            className="text-sm text-neutral-300 hover:text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" /> دخول
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold text-black bg-white hover:bg-neutral-200 px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-white/10"
          >
            ابدأ مجاناً
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 active:scale-95"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Mobile slide-over */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute top-0 inset-x-0 bg-[#0B1020] border-b border-white/10 p-6 rounded-b-3xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <BrandLogo size={36} />
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 mb-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-base text-neutral-200 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link
                  href="/auth/login"
                  className="text-center text-base text-white px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-center text-base font-bold text-black bg-white px-5 py-3 rounded-xl"
                >
                  ابدأ مجاناً
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Hero
// ───────────────────────────────────────────────────────────────────────────

function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <motion.section
      style={{ y: heroY, opacity: heroOpacity }}
      className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Floating logo halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-8"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/40 via-blue-500/30 to-purple-500/40 blur-3xl animate-pulse" />
          <div className="relative w-full h-full">
            <BrandLogo size={144} showWordmark={false} href={null} className="w-full h-full" glow />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs md:text-sm text-indigo-200 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kalmeron AI · نظام تشغيل رواد الأعمال</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
        >
          <span className="block text-white">حوّل فكرتك</span>
          <span className="block bg-gradient-to-r from-indigo-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
            إلى شركة ناجحة
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          فريق من <span className="text-white font-bold">+50 وكيلاً ذكياً</span> يعمل لصالحك:
          تحليل سوق، خطة عمل، نماذج مالية، عقود قانونية — كله في منصة واحدة بالعربي.
        </motion.p>

        {/* Prompt bar */}
        <motion.form
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, ease: "easeOut" }}
          onSubmit={submit}
          className="relative max-w-2xl mx-auto group"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-indigo-500/40 via-blue-500/40 to-purple-500/40 opacity-0 group-focus-within:opacity-100 blur-md transition-opacity" />
          <div className="relative flex items-center bg-[#0B1020]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] focus-within:border-white/30">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بم تفكر اليوم؟ احكي فكرتك بالعامية…"
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 text-base md:text-lg placeholder-neutral-500"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="shrink-0 flex items-center gap-2 bg-white text-black font-semibold rounded-2xl px-4 py-3 md:px-5 md:py-3 disabled:opacity-40 hover:scale-[1.03] active:scale-95 transition-transform"
            >
              <span className="hidden sm:inline">ابدأ الآن</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </motion.form>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-3xl mx-auto"
        >
          {SUGGESTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setQuery(t)}
              className="text-xs md:text-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-neutral-200 px-3.5 py-2 rounded-full transition-all"
            >
              {t}
            </button>
          ))}
        </motion.div>

        {/* CTA Buttons (mobile under search) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="md:hidden flex flex-col gap-3 mt-8 max-w-sm mx-auto"
        >
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-2 text-base font-bold bg-white text-black px-6 py-3.5 rounded-full"
          >
            ابدأ مجاناً <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-base text-white border border-white/15 px-6 py-3.5 rounded-full bg-white/5"
          >
            <LogIn className="w-4 h-4" /> تسجيل الدخول
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="hidden md:flex justify-center mt-16"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-neutral-500 text-xs"
          >
            <span>اكتشف المزيد</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Stats strip
// ───────────────────────────────────────────────────────────────────────────

function StatsStrip() {
  return (
    <section className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 py-5 md:p-6 text-center"
            >
              <div className="font-display text-3xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-neutral-400 mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Features grid
// ───────────────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="relative px-4 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-indigo-200 mb-4">
            <Zap className="w-3 h-3" /> فريق متكامل
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">
            كل ما تحتاجه شركتك في <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">مكان واحد</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            من تحليل الفكرة وحتى التوسع. لكل قسم وكلاء متخصصون بدوام كامل.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 md:p-8 transition-colors hover:border-white/25"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// How it works
// ───────────────────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="how" className="relative px-4 py-20 md:py-28 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-indigo-200 mb-4">
            <Rocket className="w-3 h-3" /> 3 خطوات فقط
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">
            من الفكرة إلى التشغيل في <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">دقائق</span>
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 right-[16%] left-[16%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center p-6 rounded-3xl border border-white/10 bg-[#0B1020]/60 backdrop-blur-md"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-white/10 flex items-center justify-center mb-5 relative">
                <span className="font-display text-3xl font-extrabold bg-gradient-to-br from-indigo-300 to-blue-300 bg-clip-text text-transparent">
                  {s.n}
                </span>
                <span className="absolute inset-0 rounded-full ring-1 ring-indigo-500/30 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Testimonials
// ───────────────────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-indigo-200 mb-4">
            <Trophy className="w-3 h-3" /> رواد الأعمال يثقون بنا
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white">
            قصص <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">نجاح حقيقية</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 hover:border-white/20 transition-colors"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-neutral-200 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-neutral-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Final CTA
// ───────────────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="px-4 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative max-w-5xl mx-auto rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-900/40 via-blue-900/20 to-purple-900/30 backdrop-blur-xl p-8 md:p-16 text-center overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-500/30 blur-3xl" />

        <div className="relative">
          <BrandLogo size={64} showWordmark={false} href={null} className="mx-auto mb-6" glow />
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            ابدأ شركتك اليوم<br />
            <span className="bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
              بدون مخاطر، بدون التزام
            </span>
          </h2>
          <p className="text-neutral-300 max-w-xl mx-auto mb-8">
            انضم لآلاف رواد الأعمال الذين يبنون مستقبلهم مع كلميرون. مجاناً للأبد للأفكار الأولى.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 text-base font-bold bg-white text-black px-7 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-indigo-500/20"
            >
              <UserPlus className="w-5 h-5" /> أنشئ حسابك الآن
            </Link>
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 text-base text-white border border-white/15 bg-white/5 backdrop-blur-md px-7 py-4 rounded-full hover:bg-white/10 transition-colors"
            >
              <MessageSquareText className="w-5 h-5" /> جرّب المساعد
            </Link>
          </div>
          <p className="text-xs text-neutral-500 mt-6 flex items-center justify-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> بدون بطاقة ائتمان
            <span className="mx-2">·</span>
            <Check className="w-3.5 h-3.5 text-emerald-400" /> ابدأ خلال دقيقتين
          </p>
        </div>
      </motion.div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Footer
// ───────────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-10 md:py-14">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <BrandLogo size={36} />
          <p className="text-xs text-neutral-500 max-w-sm">
            نظام تشغيل لرواد الأعمال — بُنيت في مصر للعالم العربي.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
          <Link href="/pricing" className="hover:text-white transition-colors">الأسعار</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">الخصوصية</Link>
          <Link href="/terms" className="hover:text-white transition-colors">الشروط</Link>
          <Link href="/compliance" className="hover:text-white transition-colors">الامتثال</Link>
        </div>
        <div className="text-xs text-neutral-600">
          © {new Date().getFullYear()} Kalmeron AI
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard / onboarding
  useEffect(() => {
    if (!loading && user) {
      if (!dbUser?.profile_completed) router.replace("/onboarding");
      else router.replace("/dashboard");
    }
  }, [user, dbUser, loading, router]);

  return (
    <div dir="rtl" className="relative min-h-screen bg-[#070912] text-white overflow-x-hidden font-arabic">
      <Aurora />
      <TopNav />
      <main>
        <Hero />
        <StatsStrip />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
