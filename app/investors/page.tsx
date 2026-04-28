import { PublicShell } from "@/components/layout/PublicShell";
import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  Globe2,
  Cpu,
  ShieldCheck,
  Rocket,
  Users,
  LineChart,
  Bot,
} from "lucide-react";

export const metadata: Metadata = {
  title: "للمستثمرين | كلميرون AI — نظام تشغيل الشركات الناشئة العربية",
  description:
    "كلميرون AI — منصة SaaS عربية تضم 16 وكيلاً ذكياً لرواد الأعمال في مصر والسعودية والإمارات. نبحث عن شركاء استثماريين لجولة Seed.",
  openGraph: {
    title: "كلميرون AI للمستثمرين",
    description:
      "سوق +15 مليار دولار، 16 وكيل AI، تقنية متقدمة، متوافق قانونياً.",
    siteName: "كلميرون AI",
    locale: "ar_EG",
    type: "website",
  },
};

const marketStats = [
  { label: "حجم السوق (TAM)", value: "+15 مليار $", icon: Globe2 },
  { label: "المستهدفون", value: "+500,000 شركة", icon: Users },
  { label: "السعر يبدأ من", value: "199 جنيه/شهر", icon: TrendingUp },
  { label: "قاعدة تقنية", value: "Next.js 16 + Gemini 2.5", icon: Cpu },
];

const techHighlights = [
  "Next.js 16 + React 19 (Turbopack) — تحميل تحت الثانية",
  "Firebase Auth + Firestore + App Check — أمان من الدرجة الأولى",
  "Google Gemini 2.5 Pro + LangGraph — تنسيق متعدد الوكلاء",
  "4 خدمات Python مستقلة (PDF, Egypt-Calc, LLM-Judge, Embeddings)",
  "0 أخطاء TypeScript — جودة كود صارمة",
  "متوافق قانون 151 المصري + PDPL السعودي + GDPR الأوروبي",
];

const roadmap = [
  { quarter: "Q2 2026", title: "إطلاق MVP", body: "16 وكيل + Stripe + Fawry" },
  { quarter: "Q3 2026", title: "تطبيق موبايل + WhatsApp", body: "iOS, Android, واتساب أعمال" },
  { quarter: "Q4 2026", title: "Teams & Workspaces", body: "تعاون داخل الشركة + RBAC" },
  { quarter: "Q1 2027", title: "API للمطورين", body: "Webhooks + Marketplace" },
];

export default function InvestorsPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="px-6 py-16 md:py-24 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--brand-cyan))]/30 bg-[rgb(var(--brand-cyan))]/10 px-4 py-1.5 text-[rgb(var(--brand-cyan))] text-xs font-semibold mb-6">
            <Rocket className="w-3.5 h-3.5" /> جولة Seed مفتوحة الآن
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            نظام تشغيل الشركات الناشئة العربية
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-3xl mx-auto mb-10">
            16 مساعداً ذكياً يعملون يومياً مع رواد الأعمال في مصر، السعودية،
            والإمارات — بأقل من 5% من تكلفة المستشارين التقليديين.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:invest@kalmeron.ai?subject=طلب%20جلسة%20تعريفية%20—%20جولة%20Seed"
              className="inline-flex items-center gap-2 rounded-2xl bg-[rgb(var(--azure))] px-8 py-4 font-bold text-white hover:opacity-90 transition-opacity"
            >
              احجز جلسة تعريفية
            </a>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-bold text-white hover:bg-white/10 transition-colors"
            >
              شاهد العرض الحي
            </Link>
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="px-6 py-16 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-10 text-center">
            السوق
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketStats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="glass rounded-3xl p-6 text-center border border-white/[0.06]"
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-[rgb(var(--brand-cyan))]" />
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-sm text-neutral-400 mt-1">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="px-6 py-16 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="glass rounded-3xl p-8 border-r-4 border-red-500/40">
            <h3 className="text-2xl font-bold text-white mb-4">المشكلة</h3>
            <p className="text-neutral-300 leading-relaxed text-lg">
              رائد الأعمال المصري يدفع{" "}
              <strong className="text-white">5,000 إلى 50,000 جنيه شهرياً</strong>{" "}
              على مستشارين متفرقين في المالية، القانون، التسويق، والعمليات —
              ومع ذلك يبقى وحيداً أمام أصعب القرارات، بدون أدوات بالعربية،
              وبدون فهم للسياق المحلي والقوانين.
            </p>
          </div>
          <div className="glass rounded-3xl p-8 border-l-4 border-[rgb(var(--brand-cyan))]/60">
            <h3 className="text-2xl font-bold text-white mb-4">الحل</h3>
            <p className="text-neutral-300 leading-relaxed text-lg">
              <strong className="text-white">16 مساعداً ذكياً متخصصاً</strong>{" "}
              يعملون 24/7 بالعربية الفصحى، بدءاً من{" "}
              <strong className="text-white">199 جنيهاً شهرياً</strong> — مع
              فهم كامل لقانون 151، التأمينات الاجتماعية، ضرائب الدخل، وتفاصيل
              الترخيص في كل من مصر، السعودية، والإمارات.
            </p>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="px-6 py-16 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Cpu className="w-7 h-7 text-[rgb(var(--brand-cyan))]" />
            <h2 className="text-3xl md:text-4xl font-black text-white">
              التقنية
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {techHighlights.map((t) => (
              <div
                key={t}
                className="glass rounded-2xl p-4 border border-white/[0.06] flex items-start gap-3"
              >
                <ShieldCheck className="w-5 h-5 text-[rgb(var(--brand-cyan))] flex-shrink-0 mt-0.5" />
                <span className="text-neutral-200">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-6 py-16 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <LineChart className="w-7 h-7 text-[rgb(var(--brand-cyan))]" />
            <h2 className="text-3xl md:text-4xl font-black text-white">
              خارطة الطريق
            </h2>
          </div>
          <div className="space-y-4">
            {roadmap.map((r, i) => (
              <div
                key={r.quarter}
                className="glass rounded-2xl p-5 border border-white/[0.06] flex items-center gap-5"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[rgb(var(--azure))]/15 border border-[rgb(var(--azure))]/30 flex items-center justify-center font-black text-[rgb(var(--brand-cyan))]">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-sm font-mono text-[rgb(var(--brand-cyan))]">
                      {r.quarter}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {r.title}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-sm mt-1">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traction snapshot */}
      <section className="px-6 py-16 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Bot className="w-7 h-7 text-[rgb(var(--brand-cyan))]" />
            <h2 className="text-3xl md:text-4xl font-black text-white">
              ما بُني حتى الآن
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat value="107" label="صفحة" />
            <Stat value="92" label="API route" />
            <Stat value="16" label="وكيل AI" />
            <Stat value="4" label="خدمة Python مستقلة" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-10 border border-[rgb(var(--brand-cyan))]/20">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            هل تشاركنا الرؤية؟
          </h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            نحن نبحث عن شركاء استثماريين يفهمون السوق العربي ويؤمنون بإمكانياته.
            احجز جلسة 30 دقيقة لنعرض عليك المنصة، الأرقام، وخطة الاستخدام
            للأموال.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:invest@kalmeron.ai?subject=جلسة%20تعريفية%20—%20جولة%20Seed"
              className="inline-block rounded-2xl bg-[rgb(var(--azure))] px-8 py-4 font-bold text-white hover:opacity-90"
            >
              راسلنا: invest@kalmeron.ai
            </a>
            <Link
              href="/auth/signup"
              className="inline-block rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-bold text-white hover:bg-white/10"
            >
              جرّب المنصة مجاناً
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-3xl p-6 text-center border border-white/[0.06]">
      <div className="text-4xl font-black text-[rgb(var(--brand-cyan))]">
        {value}
      </div>
      <div className="text-sm text-neutral-400 mt-2">{label}</div>
    </div>
  );
}
