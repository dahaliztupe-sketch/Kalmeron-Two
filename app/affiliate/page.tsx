import { PublicShell } from "@/components/layout/PublicShell";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "برنامج الشركاء | كلميرون AI",
  description:
    "اكسب 30% عمولة شهرية لمدة 12 شهراً عن كل عميل تجلبه إلى كلميرون. انضم إلى برنامج الشركاء الآن.",
  openGraph: {
    title: "برنامج الشركاء — كلميرون AI",
    description:
      "30% عمولة، حد أدنى 50$ للسحب، مدفوعات شهرية عبر Stripe.",
    locale: "ar_EG",
    type: "website",
  },
};

const benefits = [
  { value: "30%", label: "عمولة شهرية" },
  { value: "12", label: "شهراً متكررة" },
  { value: "50$", label: "أقل حد للسحب" },
  { value: "30", label: "يوم تتبّع الكوكيز" },
];

export default function AffiliatePage() {
  return (
    <PublicShell>
      <div className="max-w-5xl mx-auto py-14 px-6">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 border-r-4 border-[rgb(var(--azure))] pr-4">
            برنامج الشركاء
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            اربح دخلاً متكرراً عبر التوصية بأقوى منصة AI لرواد الأعمال العرب.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {benefits.map((b) => (
            <div
              key={b.label}
              className="glass rounded-2xl p-5 text-center border border-white/[0.06]"
            >
              <div className="text-3xl font-black text-[rgb(var(--brand-cyan))]">
                {b.value}
              </div>
              <div className="text-sm text-neutral-400 mt-1">{b.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-8 text-neutral-300 leading-relaxed text-lg">
          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">كيف يعمل البرنامج؟</h2>
            <ol className="list-decimal pr-6 space-y-3 marker:text-[rgb(var(--brand-cyan))]">
              <li>سجّل في برنامج الشركاء واحصل على رابطك الفريد.</li>
              <li>شارك الرابط في موقعك، قناتك، نشرتك، أو شبكتك المهنية.</li>
              <li>كل اشتراك يأتي عبر رابطك يُحسب لك تلقائياً.</li>
              <li>تتلقى 30% من قيمة الاشتراك شهرياً لمدة 12 شهراً.</li>
              <li>تُصرف العمولة عبر Stripe في بداية كل شهر بعد بلوغ 50$.</li>
            </ol>
          </section>

          <section className="glass p-8 rounded-3xl border-l-4 border-[rgb(var(--brand-cyan))]">
            <h2 className="text-2xl font-bold text-white mb-4">من يناسبه البرنامج؟</h2>
            <ul className="list-disc pr-6 space-y-2 marker:text-[rgb(var(--brand-cyan))]">
              <li>صنّاع المحتوى المتخصصون في ريادة الأعمال والـSaaS.</li>
              <li>مستشارو الشركات الناشئة ومسرّعات الأعمال.</li>
              <li>مديرو المجتمعات (تيليجرام، واتساب، لينكدإن).</li>
              <li>المدوّنون والكتاب في المجال التقني والإداري.</li>
              <li>وكالات التسويق والاستشارات.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">كم يمكنني أن أربح؟</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 font-bold text-white">العملاء</th>
                    <th className="py-3 px-4 font-bold text-white">الخطة</th>
                    <th className="py-3 px-4 font-bold text-white">العمولة الشهرية</th>
                    <th className="py-3 px-4 font-bold text-white">سنوياً</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">10</td>
                    <td className="py-3 px-4">Pro (49$)</td>
                    <td className="py-3 px-4 text-[rgb(var(--brand-cyan))]">147$</td>
                    <td className="py-3 px-4">1,764$</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">50</td>
                    <td className="py-3 px-4">Pro (49$)</td>
                    <td className="py-3 px-4 text-[rgb(var(--brand-cyan))]">735$</td>
                    <td className="py-3 px-4">8,820$</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">100</td>
                    <td className="py-3 px-4">Pro (49$)</td>
                    <td className="py-3 px-4 text-[rgb(var(--brand-cyan))]">1,470$</td>
                    <td className="py-3 px-4">17,640$</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-neutral-500 mt-4">
              * الأرقام تقديرية بافتراض احتفاظ كامل لمدة 12 شهراً.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border-r-4 border-[rgb(var(--azure))]">
            <h2 className="text-2xl font-bold text-white mb-4">جاهز للانطلاق؟</h2>
            <p className="mb-6">
              قدّم طلبك الآن. نراجع كل طلب يدوياً خلال 48 ساعة لضمان جودة
              البرنامج لكل الأطراف.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:partners@kalmeron.ai?subject=طلب%20الانضمام%20لبرنامج%20الشركاء"
                className="inline-block rounded-2xl bg-[rgb(var(--azure))] px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                قدّم طلبك
              </a>
              <Link
                href="/affiliate-terms"
                className="inline-block rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                اقرأ الشروط
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
