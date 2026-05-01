"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Sparkles, Brain, Shield, Radar,
  Briefcase, Scale, FlaskConical, Bot,
  Check, CheckCircle2, XCircle,
  Star, Trophy, Users, TrendingUp, Clock, Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";

// ─── DEPARTMENTS DATA ────────────────────────────────────────────────────────

const DEPARTMENTS = [
  {
    icon: Brain,
    title: "الدماغ المشترك",
    subtitle: "Shared Brain",
    desc: "ذاكرة ذكية تتعلم من كل محادثة وتربط الأفكار ببيانات شركتك الحقيقية.",
    gradient: "from-cyan-500 to-indigo-500",
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    glowColor: "rgba(56,189,248,0.12)",
  },
  {
    icon: Bot,
    title: "١٦ مساعداً ذكياً",
    subtitle: "Your AI Team",
    desc: "فريق متكامل من المسوّقين والمحاسبين والمحامين والمحلّلين بدوام كامل.",
    gradient: "from-indigo-500 to-violet-500",
    border: "border-indigo-500/20 hover:border-indigo-400/50",
    glowColor: "rgba(99,102,241,0.12)",
  },
  {
    icon: FlaskConical,
    title: "مختبر السوق",
    subtitle: "Market Lab",
    desc: "اختبر فكرتك مع عملاء افتراضيين قبل أن تنفق أي ميزانية على الإطلاق.",
    gradient: "from-fuchsia-500 to-pink-500",
    border: "border-fuchsia-500/20 hover:border-fuchsia-400/50",
    glowColor: "rgba(217,70,239,0.12)",
  },
  {
    icon: Briefcase,
    title: "المدير المالي",
    subtitle: "CFO الذكي",
    desc: "نماذج مالية احترافية وتوقعات تدفق نقدي جاهزة للمستثمرين في دقائق.",
    gradient: "from-emerald-500 to-cyan-500",
    border: "border-emerald-500/20 hover:border-emerald-400/50",
    glowColor: "rgba(16,185,129,0.12)",
  },
  {
    icon: Scale,
    title: "الحارس القانوني",
    subtitle: "Legal Guard",
    desc: "عقود ونماذج متوافقة مع التشريعات الدولية ومعايير حماية البيانات العالمية.",
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-500/20 hover:border-amber-400/50",
    glowColor: "rgba(245,158,11,0.12)",
  },
  {
    icon: Shield,
    title: "حارس الأخطاء",
    subtitle: "Mistake Shield",
    desc: "يحذرك من الأخطاء القاتلة قبل وقوعها — مبني على تجارب مئات الشركات.",
    gradient: "from-violet-500 to-purple-500",
    border: "border-violet-500/20 hover:border-violet-400/50",
    glowColor: "rgba(139,92,246,0.12)",
  },
  {
    icon: Radar,
    title: "رادار الفرص",
    subtitle: "Opportunity Radar",
    desc: "تنبيهات لحظية بأحدث جولات التمويل والمسابقات والحاضنات المناسبة.",
    gradient: "from-rose-500 to-red-500",
    border: "border-rose-500/20 hover:border-rose-400/50",
    glowColor: "rgba(244,63,94,0.12)",
  },
];

// ─── COMPARISON DATA ─────────────────────────────────────────────────────────

const COMPARISON = [
  { feature: "متاح ٢٤/٧", kalmeron: true,   consultant: false,       tools: "جزئياً" },
  { feature: "يفهم سياق أعمالك وسوقك",  kalmeron: true,   consultant: "أحياناً", tools: false },
  { feature: "نمذجة مالية احترافية", kalmeron: true, consultant: true,  tools: false },
  { feature: "عقود قانونية جاهزة",  kalmeron: true,   consultant: true,      tools: false },
  { feature: "لغة عربية أصيلة",    kalmeron: true,   consultant: false,      tools: false },
  { feature: "يتعلم من بياناتك",    kalmeron: true,   consultant: false,      tools: false },
  { feature: "أسعار واضحة وثابتة",  kalmeron: true,   consultant: false,      tools: "بعضها" },
];

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "أحمد سامي",
    role: "مؤسّس SaaS للعقارات",
    avatar: "أ",
    color: "from-cyan-500 to-indigo-500",
    stars: 5,
    text: "كلميرون ساعدني أعمل خطة أعمال كاملة في ثلاث ساعات بدل ثلاثة أشهر. المستثمر انبهر بالنموذج المالي.",
    metric: "أغلق جولة تمويل ناجحة خلال ٣ أشهر",
  },
  {
    name: "مريم خالد",
    role: "صاحبة مشروع تجارة إلكترونية",
    avatar: "م",
    color: "from-fuchsia-500 to-pink-500",
    stars: 5,
    text: "المساعد القانوني وفّر عليّ ثمن محامٍ بالكامل. العقود جاهزة وقابلة للتخصيص في دقائق.",
    metric: "وفّرت أكثر من ٦٠٪ من تكاليف المستشارين",
  },
  {
    name: "كريم منصور",
    role: "مؤسّس شركة لوجستيك",
    avatar: "ك",
    color: "from-emerald-500 to-cyan-500",
    stars: 5,
    text: "رادار الفرص نبّهني بمسابقة ITIDA قبل الميعاد بأسبوعين — فزنا بالجائزة الثانية.",
    metric: "٣ جوائز في ٦ أشهر",
  },
];

// ─── COMPARISON CELL ─────────────────────────────────────────────────────────

function CompCell({ value, kalmeron = false }: { value: boolean | string; kalmeron?: boolean }) {
  if (value === true) return <CheckCircle2 className={`w-5 h-5 ${kalmeron ? "text-emerald-400" : "text-emerald-400/60"}`} />;
  if (value === false) return <XCircle className="w-5 h-5 text-rose-400/50" />;
  return <span className="text-xs text-neutral-400">{value as string}</span>;
}

// ─── STATS STRIP ─────────────────────────────────────────────────────────────

function StatsStrip() {
  const stats = [
    { icon: Users,      value: "٣٢٠٠+",   label: "مؤسّس نشط",       color: "text-cyan-400" },
    { icon: TrendingUp, value: "٧ أقسام", label: "تشغيلية كاملة",  color: "text-indigo-400" },
    { icon: Zap,        value: "١٦",       label: "مساعداً ذكياً",   color: "text-fuchsia-400" },
    { icon: Clock,      value: "٢٤/٧",     label: "متاح بلا انقطاع", color: "text-emerald-400" },
  ];

  return (
    <section
      className="px-4 py-10 md:py-14"
      style={{
        background: "rgba(255,255,255,0.018)",
        borderTop: "1px solid rgba(255,255,255,0.055)",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex flex-col items-center text-center gap-1"
            >
              <Icon className={`w-5 h-5 mb-1 ${s.color}`} />
              <div className="font-display font-black text-2xl md:text-3xl text-white">{s.value}</div>
              <div className="text-xs text-neutral-500">{s.label}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── DEPARTMENTS SECTION ─────────────────────────────────────────────────────

function DepartmentsSection() {
  return (
    <section id="departments" className="relative px-4 py-16 md:py-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] text-cyan-200 mb-5">
            <Sparkles className="w-3 h-3" /> أقسام متخصصة — كل قسم له فريقه من المساعدين
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            فريقك المؤسس الكامل
            <br />
            <span className="brand-gradient-text">بالعربية، ٢٤/٧</span>
          </h2>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            بدلاً من إنفاق الآلاف على مستشارين متفرقين — كل خبرة تحتاجها في مكان واحد.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {DEPARTMENTS.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <motion.div
                key={dept.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`group relative rounded-2xl border ${dept.border} transition-all duration-300 p-5 md:p-6 cursor-default overflow-hidden`}
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${dept.glowColor}, transparent 70%)` }}
                />

                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="mb-1.5">
                    <span className="font-display font-bold text-[15px] text-white">{dept.title}</span>
                    <span className="text-[10px] text-neutral-600 mr-2 font-mono">{dept.subtitle}</span>
                  </div>
                  <p className="text-[13px] text-neutral-400 leading-relaxed">{dept.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 btn-primary rounded-full px-7 py-3.5 text-sm font-bold"
          >
            ابدأ مجاناً الآن <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── COMPARISON SECTION ──────────────────────────────────────────────────────

function ComparisonSection() {
  return (
    <section id="compare" className="relative px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] text-amber-200 mb-5">
            <Trophy className="w-3 h-3" /> لماذا كلميرون؟
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
            بدل ما تدفع للجميع —
            <span className="brand-gradient-text"> كلميرون يكفيك</span>
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto text-sm md:text-base">
            المؤسسون يدفعون آلافاً شهرياً لمستشارين متفرقين. كلميرون يعمل كلهم بكسر التكلفة.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          {/* Header row */}
          <div
            className="grid grid-cols-4 border-b border-white/[0.07]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="col-span-1 p-4 text-xs font-medium text-neutral-500">الميزة</div>
            <div className="p-4 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-500/20 border border-indigo-500/30 rounded-full px-2.5 py-1">
                <Bot className="w-3 h-3" /> كلميرون
              </div>
            </div>
            <div className="p-4 text-center text-xs font-medium text-neutral-400">مستشارون</div>
            <div className="p-4 text-center text-xs font-medium text-neutral-400">أدوات مجانية</div>
          </div>

          {COMPARISON.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-4 border-b border-white/[0.05] last:border-0"
              style={{ background: i % 2 ? "rgba(255,255,255,0.01)" : undefined }}
            >
              <div className="col-span-1 p-4 text-sm text-neutral-300 flex items-center">{row.feature}</div>
              <div className="p-4 flex items-center justify-center"><CompCell value={row.kalmeron} kalmeron /></div>
              <div className="p-4 flex items-center justify-center"><CompCell value={row.consultant} /></div>
              <div className="p-4 flex items-center justify-center"><CompCell value={row.tools} /></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative px-4 py-16 md:py-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-violet-600/5 blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] text-violet-200 mb-5">
            <Star className="w-3 h-3 fill-violet-300 text-violet-300" /> آراء حقيقية
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            رواد أعمال <span className="brand-gradient-text">حققوا نتائج</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.07] p-6 hover:border-white/[0.14] transition-colors"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{t.role}</div>
                  <div className="flex gap-0.5 mt-1.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-emerald-400">{t.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ───────────────────────────────────────────────────────────────

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-indigo-600/7 blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/[0.06] text-xs text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> ابدأ مجاناً — بدون بطاقة ائتمان
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            فكرتك تستحق أكثر
            <br />
            <span className="brand-gradient-text">من مجرد فكرة</span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            انضم لآلاف رواد الأعمال الذين يبنون شركاتهم مع كلميرون كل يوم.
          </p>

          <form onSubmit={submit} className="relative max-w-xl mx-auto group mb-8">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40 blur-md opacity-60 group-focus-within:opacity-100 transition-opacity" />
            <div
              className="relative flex items-center rounded-3xl p-2 shadow-2xl"
              style={{ background: "rgba(11,16,32,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب فكرتك هنا…"
                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3.5 text-base placeholder-neutral-600"
              />
              <button type="submit" className="shrink-0 btn-primary rounded-2xl px-5 py-3.5 text-sm font-bold flex items-center gap-2">
                ابدأ <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> مجاني للبداية</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> بدون بطاقة ائتمان</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> آمن ومشفّر E2E</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function SiteFooter() {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: "المنصة",
      links: [
        { href: "#departments", label: "الأقسام" },
        { href: "/pricing", label: "الأسعار" },
        { href: "#compare", label: "المقارنة" },
        { href: "/auth/signup", label: "ابدأ مجاناً" },
      ],
    },
    {
      title: "الموارد",
      links: [
        { href: "/blog", label: "المدونة" },
        { href: "/changelog", label: "التحديثات" },
        { href: "/api-docs", label: "API للمطورين" },
      ],
    },
    {
      title: "الشركة",
      links: [
        { href: "/about", label: "من نحن" },
        { href: "/privacy", label: "الخصوصية" },
        { href: "/terms", label: "الشروط والأحكام" },
        { href: "/contact", label: "تواصل معنا" },
      ],
    },
  ];

  return (
    <footer
      className="px-4 py-12 md:py-16"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.3)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <BrandLogo size={36} iconOnly showWordmark={false} />
            <p className="mt-4 text-sm text-neutral-500 leading-relaxed max-w-[200px]">
              شريكك الذكي في بناء شركتك — بالعربية.
            </p>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-medium">جميع الأنظمة تعمل</span>
            </div>
          </div>

          {/* Link cols */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-600 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-neutral-500 hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-neutral-700">
            © {year} Kalmeron AI Studio · جميع الحقوق محفوظة
          </p>
          <p className="text-xs text-neutral-700">
            صُنع بـ ♥ في مصر 🇪🇬
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export default function HomeBelowFold() {
  return (
    <>
      <StatsStrip />
      <DepartmentsSection />
      <ComparisonSection />
      <TestimonialsSection />
      <FinalCTA />
      <SiteFooter />
    </>
  );
}
