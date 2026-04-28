import { PublicShell } from "@/components/layout/PublicShell";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "شروط برنامج الشركاء | كلميرون AI",
  description:
    "الشروط والأحكام المنظِّمة لبرنامج الشركاء (Affiliate) في كلميرون AI: العمولات، الدفع، السلوك المحظور، والقانون الحاكم.",
};

export default function AffiliateTermsPage() {
  return (
    <PublicShell>
      <div className="max-w-4xl mx-auto py-14 px-6">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 border-r-4 border-[rgb(var(--azure))] pr-4">
            شروط برنامج الشركاء
          </h1>
          <p className="text-neutral-400 text-lg">
            آخر تحديث: 28 أبريل 2026
          </p>
        </div>

        <div className="space-y-6 text-neutral-300 leading-relaxed text-lg">
          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-3">1. الأهلية</h2>
            <p>
              يجب أن يكون عمر المتقدّم 18 سنة فأكثر، وأن يقدّم بيانات صحيحة
              ومُحدَّثة، وألّا يكون موظفاً حالياً لدى كلميرون أو إحدى شركاتها
              التابعة.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border-l-4 border-[rgb(var(--brand-cyan))]">
            <h2 className="text-2xl font-bold text-white mb-3">2. العمولة</h2>
            <ul className="list-disc pr-6 space-y-2 marker:text-[rgb(var(--brand-cyan))]">
              <li>
                <strong className="text-white">النسبة:</strong> 30% من قيمة
                الاشتراك (بعد خصم رسوم بوابة الدفع).
              </li>
              <li>
                <strong className="text-white">المدة:</strong> 12 شهراً
                متكرراً عن كل عميل، تبدأ من تاريخ أول دفعة فعلية.
              </li>
              <li>
                <strong className="text-white">مدة الكوكي:</strong> 30 يوماً
                — يُحسب البيع للشريك الذي جاء عبره العميل آخر مرة خلال هذه
                المدة.
              </li>
              <li>
                <strong className="text-white">المنتجات المؤهلة:</strong> كل
                خطط الاشتراك المدفوعة. تُستثنى الإضافات اللحظية والاستردادات.
              </li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-3">3. الدفع</h2>
            <ul className="list-disc pr-6 space-y-2 marker:text-[rgb(var(--brand-cyan))]">
              <li>الحد الأدنى للدفع: <strong className="text-white">50 دولاراً</strong>.</li>
              <li>الدفع شهرياً عبر <strong className="text-white">Stripe Connect</strong> في أول كل شهر ميلادي.</li>
              <li>أي رصيد أقل من الحد الأدنى يُرحَّل للشهر التالي.</li>
              <li>الشريك مسؤول عن أي ضرائب محلية على دخله.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl border-r-4 border-red-500/40">
            <h2 className="text-2xl font-bold text-white mb-3">4. الممارسات المحظورة</h2>
            <p className="mb-3">يُحظر فوراً ودون إنذار في الحالات التالية:</p>
            <ul className="list-disc pr-6 space-y-2 marker:text-red-400">
              <li>
                <strong className="text-white">المزاودة على كلمات العلامة التجارية</strong>{" "}
                (Brand Bidding) في Google Ads أو Meta Ads على كلمات مثل
                &quot;كلميرون&quot;, &quot;Kalmeron&quot;, أو أي مشتقاتها.
              </li>
              <li>الادعاءات الكاذبة عن المنتج أو نتائجه.</li>
              <li>السبام عبر البريد، واتساب، أو الرسائل غير المرغوبة.</li>
              <li>
                إعادة توجيه الكوكيز أو الحقن (Cookie Stuffing / Forced
                Clicks).
              </li>
              <li>استخدام كوبونات أو مواقع كاش-باك بدون موافقة كتابية مسبقة.</li>
              <li>التسجيل الذاتي (Self-Referral) بأي شكل.</li>
              <li>
                النشر على مواقع تروّج لمحتوى غير لائق أو غير قانوني (إباحي،
                قمار، عنف).
              </li>
            </ul>
            <p className="mt-4 text-red-300/90">
              أي مخالفة تُلغي العمولات المتراكمة وتُغلق الحساب نهائياً.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-3">5. الإلغاء والاستردادات</h2>
            <p>
              في حال طلب العميل استرداد مبلغه، تُخصم العمولة المقابلة من رصيد
              الشريك. لا تُحتسب عمولة على الاشتراكات المُلغاة قبل اكتمال أول
              30 يوماً.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-3">6. حقوق العلامة التجارية</h2>
            <p>
              يحصل الشريك على رخصة محدودة وغير حصرية لاستخدام شعار كلميرون
              ومواد التسويق المعتمدة فقط للترويج للبرنامج. يُحظر تعديل الشعار
              أو استخدامه بشكل يوحي بشراكة رسمية أكبر من برنامج الإحالة.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-3">7. إنهاء البرنامج</h2>
            <p>
              يحقّ لأيٍّ من الطرفين إنهاء العلاقة بإشعار مدته 14 يوماً. تُدفع
              العمولات المستحقة قبل الإنهاء وفق الجدول العادي. تحتفظ كلميرون
              بحق إيقاف البرنامج بالكامل بإشعار 30 يوماً مسبقاً.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border-r-4 border-[rgb(var(--azure))]">
            <h2 className="text-2xl font-bold text-white mb-3">8. القانون الحاكم</h2>
            <p>
              تخضع هذه الشروط لقوانين <strong className="text-white">جمهورية مصر العربية</strong>،
              وأي نزاع يُعرض على المحاكم المختصة في مدينة القاهرة. يُعمل
              بقانون 151 لسنة 2020 لحماية البيانات الشخصية على كل بيانات
              الشركاء.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-3">9. التواصل</h2>
            <p>
              للأسئلة أو الشكاوى:{" "}
              <a
                href="mailto:partners@kalmeron.ai"
                className="text-[rgb(var(--brand-cyan))] underline"
              >
                partners@kalmeron.ai
              </a>
            </p>
            <div className="mt-6">
              <Link
                href="/affiliate"
                className="inline-block rounded-2xl bg-[rgb(var(--azure))] px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                العودة لصفحة البرنامج
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
