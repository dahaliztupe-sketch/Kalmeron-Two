/**
 * /crews/finance — Departmental Crew product page (Finance).
 *
 * P2-1 from Virtual Boardroom 201 (Reid Hoffman + Tobi Lütke seats).
 *
 * Markets the existing Finance department in `src/ai/organization/departments/finance/`
 * as a standalone $499/mo SKU: "Finance Crew on demand".
 * Includes: CFO, FP&A, Tax/Accounting, Cap Table, Investor Pack agents.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowLeft, Check, Calculator, PieChart, FileText, Users, TrendingUp, Shield } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "Finance Crew — فريق مالي ذكي تحت الطلب | كلميرون",
  description:
    "خمسة وكلاء ماليين متخصصين (CFO، FP&A، ضرائب، Cap Table، حزمة المستثمر) يعملون كفريقك المالي الافتراضي مقابل 499$/شهر — أرخص من راتب محاسب واحد.",
  alternates: { canonical: "/crews/finance" },
};

const AGENTS = [
  {
    name: "CFO Agent",
    role: "المدير المالي",
    icon: Briefcase,
    bullets: [
      "تخطيط مالي ربع‑سنوي وميزانيات سيناريو متعددة",
      "مراجعة شهرية لقائمة التدفقات النقدية",
      "إنذار مبكر للعجز الموسمي قبله بـ 90 يوماً",
    ],
  },
  {
    name: "FP&A Analyst",
    role: "تخطيط وتحليل مالي",
    icon: PieChart,
    bullets: [
      "نمذجة أسعار، خصم، LTV/CAC بسيناريوهات",
      "Dashboard أسبوعي للـunit economics",
      "تحليل المنافسين بأسعار حقيقية من السوق المصري",
    ],
  },
  {
    name: "Tax & Accounting",
    role: "محاسبة وضرائب",
    icon: Calculator,
    bullets: [
      "احتساب ضريبة القيمة المضافة شهرياً وفق قانون 67",
      "تحضير الإقرار الضريبي السنوي",
      "تنبيهات مهلة الدفع قبلها بـ 14 يوماً",
    ],
  },
  {
    name: "Cap Table Manager",
    role: "هيكل الملكية",
    icon: Users,
    bullets: [
      "بناء وتحديث Cap Table مع كل جولة",
      "محاكاة dilution لكل سيناريو تمويل",
      "تقارير ESOP وVesting Schedules",
    ],
  },
  {
    name: "Investor Pack",
    role: "حزمة المستثمر",
    icon: FileText,
    bullets: [
      "تحضير Data Room كامل (مالي، قانوني، تشغيلي)",
      "Pitch Deck ذو 12 شريحة بأرقامك الحقيقية",
      "ردود تلقائية على أسئلة Due Diligence الشائعة",
    ],
  },
];

export default function FinanceCrewPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#05070D] text-white">
      <header className="border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-300 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> الرئيسية
          </Link>
          <BrandLogo size={32} iconOnly />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Hero */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-emerald-300 text-xs font-semibold mb-6">
            <Briefcase className="w-3.5 h-3.5" /> Crew #1 — مفتوح الآن
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-l from-emerald-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Finance Crew
            </span>
            <br />
            خمسة عقول مالية تشتغل لك ٢٤/٧
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            مدير مالي + محلل تخطيط + ضرائب + Cap Table + حزمة مستثمر — كل ده بـ
            <span className="text-white font-semibold"> 499$/شهر</span>
            {" "}بدلاً من +5,000$ لمحاسب واحد بدوام كامل.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mt-8">
            <Link
              href="/auth/signup?plan=finance-crew"
              className="rounded-full bg-gradient-to-l from-emerald-500 to-cyan-500 px-8 py-4 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-emerald-500/20"
            >
              ابدأ تجربة 14 يوم مجاناً
            </Link>
            <Link
              href="/contact?intent=crew-finance"
              className="rounded-full border border-white/[0.1] px-8 py-4 text-white font-medium hover:bg-white/[0.04] transition"
            >
              تحدّث مع الفريق
            </Link>
          </div>
        </section>

        {/* The 5 agents */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6 text-center">من في الفريق؟</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.name}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-emerald-500/30 transition"
                >
                  <Icon className="w-7 h-7 text-emerald-300 mb-4" />
                  <h3 className="font-bold text-lg text-white">{a.name}</h3>
                  <p className="text-neutral-500 text-xs mt-1 mb-3">{a.role}</p>
                  <ul className="space-y-2">
                    {a.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-neutral-300 text-sm">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROI */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6 text-center">حسبة بسيطة</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <TrendingUp className="w-6 h-6 text-red-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-red-300">5,000$+</div>
              <div className="text-neutral-400 text-sm mt-2">راتب محاسب واحد بدوام كامل</div>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <Shield className="w-6 h-6 text-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-amber-300">2,000$+</div>
              <div className="text-neutral-400 text-sm mt-2">جلسة استشارية مع CFO خارجي</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <Briefcase className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-emerald-300">499$</div>
              <div className="text-neutral-400 text-sm mt-2">Finance Crew كاملاً — كل شهر</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-10">
          <h2 className="text-3xl font-bold mb-3">جاهز تستأجر فريقك المالي؟</h2>
          <p className="text-neutral-400 mb-6">14 يوم تجربة. لا بطاقة ائتمان. ألغ في أي وقت.</p>
          <Link
            href="/auth/signup?plan=finance-crew"
            className="inline-flex rounded-full bg-gradient-to-l from-emerald-500 to-cyan-500 px-10 py-4 text-white font-semibold hover:opacity-90 transition shadow-xl shadow-emerald-500/20"
          >
            ابدأ تجربة Finance Crew
          </Link>
        </section>
      </main>
    </div>
  );
}
