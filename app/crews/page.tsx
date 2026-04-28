import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowLeft, Calculator, PieChart, FileText, Users, TrendingUp } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "الفِرق الذكية (Crews) — كلميرون",
  description:
    "فِرق متخصصة من مساعدي كلميرون الأذكياء، جاهزة للعمل كقسم كامل في شركتك مقابل اشتراك شهري واحد.",
  alternates: { canonical: "/crews" },
};

const CREWS = [
  {
    href: "/crews/finance",
    title: "Finance Crew",
    titleAr: "الفريق المالي",
    price: "499$ / شهرياً",
    blurb:
      "خمسة مساعدين ماليين متخصصين (CFO، FP&A، ضرائب، Cap Table، حزمة المستثمر) يعملون كفريقك المالي الافتراضي.",
    available: true,
    icons: [Briefcase, Calculator, PieChart, FileText, TrendingUp],
  },
  {
    href: "#",
    title: "Marketing Crew",
    titleAr: "الفريق التسويقي",
    price: "قريباً",
    blurb: "محتوى، حملات، تحليل جمهور، وSEO — كلّها في فريق ذكي واحد.",
    available: false,
    icons: [Users, TrendingUp],
  },
  {
    href: "#",
    title: "Product Crew",
    titleAr: "فريق المنتج",
    price: "قريباً",
    blurb: "PM، UX، أبحاث مستخدمين، ومخطّط Roadmap كأعضاء فريق دائمين.",
    available: false,
    icons: [Briefcase, Users],
  },
];

export default function CrewsIndexPage() {
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4 icon-flip" />
          الرئيسية
        </Link>

        <header className="mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-6">
            <Briefcase className="w-3.5 h-3.5" />
            الفِرق الذكية — Crews
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            استأجر <span className="text-emerald-400">قسماً كاملاً</span> بدلاً من موظّف واحد
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            كلّ فريق يحتوي على عدّة مساعدين متخصّصين يتعاونون كفريق حقيقي — أرخص من راتب موظّف واحد، وأسرع من توظيف بشري.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CREWS.map((crew) => (
            <article
              key={crew.title}
              className={`relative rounded-2xl border p-6 transition-all ${
                crew.available
                  ? "border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]"
                  : "border-white/5 bg-white/[0.01] opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                {crew.icons.map((Icon, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <Icon className="w-4 h-4 text-emerald-300" />
                  </div>
                ))}
              </div>
              <h2 className="text-xl font-semibold mb-1">{crew.titleAr}</h2>
              <div className="text-sm text-neutral-500 mb-3">{crew.title}</div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-5 min-h-[3.5rem]">
                {crew.blurb}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    crew.available ? "text-emerald-300" : "text-neutral-500"
                  }`}
                >
                  {crew.price}
                </span>
                {crew.available ? (
                  <Link
                    href={crew.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
                  >
                    اعرف المزيد
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 text-neutral-500 text-xs">
                    قائمة الانتظار
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 p-6 md:p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent text-center">
          <h3 className="text-2xl font-semibold mb-3">تحتاج فريقاً مخصّصاً؟</h3>
          <p className="text-neutral-400 mb-6 max-w-xl mx-auto">
            نُصمِّم لك فريقاً من الوكلاء الأذكياء يناسب مجال عملك تحديداً — تواصل معنا لمناقشة احتياجاتك.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
          >
            تواصل معنا
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
