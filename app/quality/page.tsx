import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Beaker, Eye, ArrowLeft } from "lucide-react";
import { getEvalSummary } from "@/src/lib/eval/summary";

export const metadata: Metadata = {
  title: "الجودة والتقييم — كيف نقيس أداء كلميرون",
  description:
    "نُجري تقييماً مستمرّاً على مجموعة بيانات ذهبية تضمّ +50 حالة (Router، أمان، حماية بيانات). نسبة النجاح والمنهجيّة عامّة وقابلة للتحقّق.",
  alternates: { canonical: "/quality" },
};

export const revalidate = 3600; // 1 hour

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export default async function QualityPage() {
  const summary = await getEvalSummary();

  return (
    <div className="min-h-screen bg-[#04060B] text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070D]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl border border-white/10 bg-[#070A18]/70 flex items-center justify-center">
              <img
                src="/brand/kalmeron-mark.svg"
                alt="Kalmeron"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-display text-lg font-extrabold text-white">
              Kalmeron
            </span>
          </Link>
          <Link
            href="/demo"
            className="text-sm text-text-secondary hover:text-white transition"
          >
            جرّب المنصّة →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-14">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[11px] uppercase tracking-[0.2em] text-emerald-200 font-bold mb-5">
            تقييم مستمرّ — شفّاف
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            كيف نقيس <span className="brand-gradient-text">جودة كلميرون</span>
          </h1>
          <p className="text-neutral-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            بدلاً من ادّعاءات تسويقيّة، نُجري تقييماً منتظماً على مجموعة بيانات
            ذهبيّة (Golden Dataset) تضمّ {summary.totalCases} حالة اختبار حقيقيّة
            بالعربيّة المصريّة، وننشر النتائج هنا.
          </p>
        </div>

        {/* Big number */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-500/[0.06] to-transparent backdrop-blur-2xl p-8 md:p-10 mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200/80 font-bold mb-3">
            نسبة النجاح الإجماليّة
          </p>
          <div className="font-display text-7xl md:text-8xl font-extrabold brand-gradient-text mb-3 tabular-nums">
            {formatPercent(summary.overallPassRate)}
          </div>
          <p className="text-sm text-neutral-400">
            مقاسة على {summary.totalCases} حالة • نسخة المجموعة:{" "}
            <span className="font-mono">{summary.version}</span>
            {summary.source === "baseline" && (
              <>
                {" "}
                • <span className="text-amber-300">خط أساس مُعلَن (سيُحدَّث بقياس CI)</span>
              </>
            )}
          </p>
        </section>

        {/* Per category */}
        <section className="grid md:grid-cols-3 gap-4 mb-12">
          {summary.categories.map((cat) => {
            const Icon =
              cat.id === "safety"
                ? ShieldCheck
                : cat.id === "pii"
                  ? Eye
                  : Beaker;
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <h3 className="font-display text-sm font-extrabold text-white">
                    {cat.labelAr}
                  </h3>
                </div>
                <div className="font-display text-3xl font-extrabold text-white tabular-nums mb-1">
                  {formatPercent(cat.passRate)}
                </div>
                <p className="text-[12px] text-text-secondary">
                  {cat.total} حالة •{" "}
                  {cat.source === "measured" ? "مقاسة" : "خط أساس"}
                </p>
              </div>
            );
          })}
        </section>

        {/* Methodology */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-7 md:p-9 mb-10">
          <h2 className="font-display text-2xl font-extrabold text-white mb-5">
            المنهجيّة باختصار
          </h2>
          <div className="space-y-5 text-neutral-300 leading-relaxed text-[15px]">
            <div>
              <h3 className="font-bold text-white mb-1">1) المجموعة الذهبيّة</h3>
              <p>
                مجموعة بيانات مكتوبة يدوياً بالعربيّة المصريّة تغطّي 3 محاور:
                توجيه الرسائل للوكيل الصحيح (Router)، رفض هجمات الحقن والاحتيال
                (Safety)، وإخفاء البيانات الشخصيّة قبل الوصول للنموذج (PII).
                المجموعة مفتوحة في
                {" "}
                <code className="text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">
                  test/eval/golden-dataset.json
                </code>
                {" "}داخل المستودع.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">2) آليّة التقييم</h3>
              <p>
                يُشغَّل التقييم مع كل تغيير على
                {" "}
                <code className="text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">
                  main
                </code>
                {" "}عبر سير عمل GitHub Actions. تُسجَّل النتيجة، وتُرفض
                التغييرات التي تُخفّض النسبة عن الحدّ الأدنى المعلَن.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">3) ماذا تعني نسبة النجاح؟</h3>
              <p>
                لكل حالة اختبار قاعدة قبول واضحة (intent متوقَّع، حظر مطلوب،
                حقول يجب إخفاؤها). نسبة النجاح هي نسبة الحالات التي يُحقّق فيها
                النظام جميع الشروط بدون استثناء.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">4) لماذا 100% غير واقعيّة؟</h3>
              <p>
                نماذج اللغة احتماليّة بطبيعتها. أيّ مزوّد يدّعي 100% إمّا يُغطّي
                على أخطائه، أو لا يقيس فعلاً. نلتزم بنشر الأرقام كما هي،
                ونستهدف رفعها مع كل إصدار.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-3.5 text-sm font-bold hover:bg-neutral-100 transition"
          >
            شوف المنصّة شغّالة
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
