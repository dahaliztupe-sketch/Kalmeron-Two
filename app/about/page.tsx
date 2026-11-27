import { PublicShell } from "@/components/layout/PublicShell";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Target, Eye, Heart, Shield, Zap, Globe2,
  Users, Bot, ArrowLeft, MapPin, Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "من نحن | كلميرون AI Studio",
  description:
    "كلميرون مشروع تجريبي بُني بمساعدة الذكاء الاصطناعي، يقدّم مساعدين لأدوار الشركة للمؤسس العربي. حالته الآن: تجريبي، متوقف مؤقتاً.",
  openGraph: {
    title: "من نحن | كلميرون AI Studio",
    description: "مشروع تجريبي: مساعدون بالذكاء الاصطناعي لأدوار الشركة. المخرجات مسودات غير مراجعة بشرياً.",
    locale: "ar_EG",
    type: "website",
  },
};

const VALUES = [
  {
    icon: Globe2,
    title: "عمق السياق",
    desc: "نكتب بالعربية ونوجّه المساعدين لسياق السوق المصري. لم يراجع خبير بشري المخرجات بعد، وتحتاج التشريعات والأرقام إلى تحقق.",
    gradient: "from-cyan-500 to-indigo-500",
  },
  {
    icon: Shield,
    title: "الامتثال القانوني",
    desc: "نعمل على مواءمة ممارساتنا مع قانون 151 المصري. لم يُجرَ تدقيق امتثال مستقل بعد.",
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    icon: Heart,
    title: "الشفافية الكاملة",
    desc: "نقول ما هو تجريبي وما لم يُتحقق منه. لم تُحدَّد أسعار بعد، ولن يُطلب منك أي مبلغ قبل إعلانها.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "التكلفة",
    desc: "السعر لم يُحدَّد بعد. المساعدون لا يغنون عن مستشار مهني عند القرارات المهمة.",
    gradient: "from-amber-500 to-orange-500",
  },
];

const STATS = [
  { value: "مجاناً", label: "ابدأ بدون بطاقة ائتمان", icon: Users },
  { value: "١٠", label: "أدوار تشغيلية (تجريبي)", icon: Bot },
  { value: "٧", label: "أقسام تشغيلية", icon: Target },
  { value: "مسودات", label: "غير مراجعة بشرياً", icon: Zap },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-5xl mx-auto py-14 px-4 md:px-6">

        {/* ── Hero ── */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] text-cyan-200 mb-6">
            <MapPin className="w-3 h-3" /> صُنع في مصر 🇪🇬 — مشروع تجريبي
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            من نحن
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            نجرّب <span className="text-white font-semibold">مساعدين بالذكاء الاصطناعي</span> يجهّزون مسودات لأدوار الشركة للمؤسس العربي الجديد.
          </p>
        </div>

        {/* ── Stats ── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 p-6 md:p-8 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <Icon className="w-5 h-5 text-brand-cyan mx-auto mb-2" />
                <div className="font-display font-black text-2xl md:text-3xl text-white mb-1">{s.value}</div>
                <div className="text-xs text-neutral-400">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Story ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div
            className="rounded-3xl p-8"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center mb-5">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-4">قصتنا</h2>
            <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
              بدأت كلميرون كمشروع تجريبي بمساعدة الذكاء الاصطناعي: فكرة أن المؤسس الجديد يحتاج مسودات منظّمة لأدوار الشركة (تسويق، مبيعات، مالية، وغيرها) يراجعها بنفسه قبل أي قرار. المشروع متوقف مؤقتاً، ولا شيء هنا يغني عن مستشار مهني.
            </p>
          </div>

          <div
            className="rounded-3xl p-8"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center mb-5">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-4">رؤيتنا</h2>
            <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
              أن تساعد <strong className="text-white">مسودات واضحة وموثّقة بمصادرها</strong> المؤسس العربي الجديد على اتخاذ قراراته بنفسه، مع بقاء المراجعة والقرار له. هذا هدف لم يتحقق بعد.
            </p>
          </div>
        </div>

        {/* ── Mission full width ── */}
        <div
          className="rounded-3xl p-8 md:p-10 mb-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.07) 0%, rgba(99,102,241,0.07) 50%, rgba(139,92,246,0.07) 100%)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-indigo-600/8 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-5">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-4">مهمّتنا</h2>
            <p className="text-neutral-300 leading-relaxed text-base md:text-lg max-w-3xl">
              مساعدة المؤسس الجديد على تنظيم فكرته وخطواته الأولى بمسودات يراجعها بنفسه. لا نعد بقرارات أفضل أو أسرع قبل أن نقيس ذلك.
            </p>
          </div>
        </div>

        {/* ── Values ── */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">قيَمنا</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-2xl p-6 flex gap-4"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{v.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Team ── */}
        <div
          className="rounded-3xl p-8 mb-12"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="font-display text-xl font-bold text-white mb-4">الفريق</h2>
          <p className="text-neutral-400 leading-relaxed">
            مشروع تجريبي بُني بمساعدة أدوات الذكاء الاصطناعي. لا يوجد فريق أو شبكة مستشارين خلفه حالياً.
          </p>
        </div>

        {/* ── CTA ── */}
        <div
          className="rounded-3xl p-8 md:p-10 text-center"
          style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.06) 0%, rgba(139,92,246,0.06) 100%)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <h2 className="font-display text-2xl font-bold text-white mb-3">تواصل معنا</h2>
          <p className="text-neutral-400 mb-8 text-sm md:text-base">
            للشراكات، الاستثمار، أو أسئلة عامة — نحن هنا.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 btn-primary rounded-full px-6 py-3 text-sm font-bold"
            >
              جرّب المنصة مجاناً <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white border border-white/15 hover:bg-white/[0.05] transition-colors"
            >
              تواصل معنا
            </Link>
          </div>
        </div>

      </div>
    </PublicShell>
  );
}
