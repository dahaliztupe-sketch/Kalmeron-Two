import { PublicShell } from "@/components/layout/PublicShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام | كلميرون",
  description: "اقرأ شروط وأحكام استخدام منصة كلميرون للذكاء الاصطناعي لرواد الأعمال المصريين.",
};

export default function TermsPage() {
  const lastUpdated = "29 أبريل 2026";

  return (
    <PublicShell>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-cyan-300 text-xs font-semibold mb-4">
            وثيقة قانونية
          </div>
          <h1 className="text-4xl font-black text-white mb-3 border-r-4 border-[rgb(var(--azure))] pr-4">
            شروط الخدمة
          </h1>
          <p className="text-neutral-400 text-sm">
            آخر تحديث: {lastUpdated} — هذه الشروط ملزمة قانونياً لجميع مستخدمي منصة Kalmeron AI.
          </p>
        </div>

        <div className="space-y-6 text-neutral-300 leading-relaxed text-base">

          <section className="glass p-8 rounded-3xl border-r-2 border-cyan-500/40">
            <h2 className="text-xl font-bold text-white mb-3">1. قبول الشروط والتعريفات</h2>
            <p className="mb-3">
              باستخدامك لمنصة Kalmeron AI ("المنصة"، "الخدمة")، تُقرّ بأنك قرأتَ وفهمتَ ووافقتَ على الالتزام بهذه الشروط والأحكام ("الاتفاقية") وسياسة الخصوصية المرتبطة بها.
            </p>
            <p className="mb-3">
              "الشركة" أو "نحن" أو "كلميرون" تعني كيان التشغيل المسؤول عن إدارة المنصة. "المستخدم" أو "أنت" يعني أي شخص طبيعي أو اعتباري يصل إلى الخدمة أو يستخدمها.
            </p>
            <p>
              إذا كنت تستخدم المنصة نيابة عن جهة عمل أو كيان قانوني، فأنت تُقرّ بأنك مخوَّل قانونياً لقبول هذه الشروط باسم تلك الجهة.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-3">2. طبيعة الخدمة وحدود الذكاء الاصطناعي</h2>
            <p className="mb-3">
              تعتمد المنصة على نماذج الذكاء الاصطناعي التوليدي لتقديم المشورة الاستراتيجية والمالية والقانونية والتسويقية. <strong className="text-white">مخرجات الذكاء الاصطناعي ذات طابع إرشادي استشاري بحت</strong>، ولا تُعدّ بديلاً عن الاستشارة المتخصصة من محامين أو محاسبين أو مستشارين ماليين مرخصين.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-400">
              <li>قد تحتوي الإخراجات على أخطاء أو معلومات قديمة أو مُتحيّزة.</li>
              <li>لا تُعدّ المنصة مستشاراً قانونياً أو مالياً معتمداً لأغراض القانون المصري أو أي ولاية قضائية أخرى.</li>
              <li>يتحمل المستخدم وحده المسؤولية الكاملة عن قرارات الأعمال المبنية على مخرجات المنصة.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl border-r-2 border-emerald-500/40">
            <h2 className="text-xl font-bold text-white mb-3">3. الملكية الفكرية</h2>
            <p className="mb-3">
              <strong className="text-white">ملكية المستخدم:</strong> تظل جميع الأفكار والخطط التجارية والمحتوى الذي تُنشئه على المنصة ملكيةً فكرية لك. لا تدّعي كلميرون أي حقوق ملكية على المحتوى الذي يولّده المستخدمون.
            </p>
            <p className="mb-3">
              <strong className="text-white">ملكية كلميرون:</strong> تمتلك الشركة جميع حقوق الملكية الفكرية في المنصة، بما يشمل الكود البرمجي، التصاميم، الخوارزميات، النماذج المدرّبة، قواعد البيانات، والعلامات التجارية. يُمنع نسخها أو توزيعها أو إعادة استخدامها دون إذن كتابي مسبق.
            </p>
            <p>
              <strong className="text-white">الترخيص المحدود:</strong> تمنحك الشركة ترخيصاً شخصياً وغير حصري وغير قابل للتحويل لاستخدام الخدمة وفق هذه الشروط.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-3">4. الاستخدام المقبول والمحظور</h2>
            <p className="mb-3 text-green-300 font-medium">الاستخدامات المقبولة تشمل:</p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
              <li>تطوير خطط عمل وتحليل السوق لأغراض ريادة الأعمال المشروعة.</li>
              <li>الاستعانة بالمساعدين الذكيين للحصول على إرشادات استراتيجية.</li>
              <li>إنشاء المستندات القانونية والمالية كنماذج أولية للمراجعة البشرية.</li>
            </ul>
            <p className="mb-3 text-red-400 font-medium">الاستخدامات المحظورة تشمل تحديداً:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-400">
              <li>أي نشاط مخالف للقانون المصري أو قوانين الدولة التي تعمل منها.</li>
              <li>محاولة اختراق أو التلاعب بنماذج الذكاء الاصطناعي (Prompt Injection / Jailbreaking).</li>
              <li>إنتاج محتوى يُروّج للكراهية أو العنف أو التمييز أو يمسّ كرامة الأفراد.</li>
              <li>انتحال شخصية أطراف ثالثة أو إنشاء وثائق مزوّرة.</li>
              <li>الزحف الآلي (scraping) أو الاستخدام المفرط الذي يُضرّ بأداء المنصة.</li>
              <li>إعادة بيع الخدمة أو دمجها في منتجات تجارية دون اتفاقية شريك مكتوبة.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl border-r-2 border-amber-500/40">
            <h2 className="text-xl font-bold text-white mb-3">5. الخطط والفوترة والاسترداد</h2>
            <p className="mb-3">
              تُقدَّم المنصة بخطط مجانية ومدفوعة. تخضع الخطط المدفوعة لشروط الدفع التالية:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-3">
              <li>تُجدَّد الاشتراكات الشهرية والسنوية تلقائياً ما لم يتم إلغاؤها قبل موعد التجديد بـ 24 ساعة.</li>
              <li>الأسعار المعروضة بالجنيه المصري أو الدولار الأمريكي حسب خيار المستخدم.</li>
              <li>يحق للمستخدمين الجدد استرداد المبلغ المدفوع كاملاً خلال 30 يوماً من الاشتراك الأول دون أسئلة.</li>
              <li>لا تُسترد المبالغ بعد انتهاء مدة الاسترداد أو في حال انتهاك هذه الشروط.</li>
            </ul>
            <p className="text-sm text-neutral-400">
              تحتفظ الشركة بحق تعديل الأسعار مع إشعار مسبق لا يقل عن 30 يوماً عبر البريد الإلكتروني المسجّل.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-3">6. البيانات والخصوصية</h2>
            <p className="mb-3">
              تُعالَج بيانات المستخدمين وفقاً لـ{" "}
              <a href="/privacy" className="text-cyan-400 underline hover:text-white transition-colors">
                سياسة الخصوصية
              </a>{" "}
              التي تُشكّل جزءاً لا يتجزأ من هذه الاتفاقية.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-400">
              <li>تلتزم المنصة بقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020 ولائحته التنفيذية.</li>
              <li>تلتزم المنصة باللائحة العامة لحماية البيانات الأوروبية (GDPR) للمستخدمين الأوروبيين.</li>
              <li>يمكنك طلب تصدير بياناتك أو حذفها بالكامل عبر إعدادات الحساب أو بالتواصل مع فريق الدعم.</li>
              <li>لا تُباع بيانات المستخدمين لأطراف ثالثة بأي شكل من الأشكال.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl border-r-2 border-red-500/30">
            <h2 className="text-xl font-bold text-white mb-3">7. حدود المسؤولية والضمانات</h2>
            <p className="mb-3">
              <strong className="text-white">إخلاء المسؤولية:</strong> تُقدَّم الخدمة "كما هي" (AS-IS) دون أي ضمانات صريحة أو ضمنية فيما يخص دقة المحتوى أو ملاءمته لغرض معين.
            </p>
            <p className="mb-3">
              <strong className="text-white">حد المسؤولية:</strong> في أقصى الحالات التي يسمح فيها القانون، لن تتجاوز مسؤولية كلميرون تجاهك المبلغ الذي دفعتَه خلال الاثني عشر شهراً السابقة لنشوء المطالبة.
            </p>
            <p>
              لا تتحمل كلميرون المسؤولية عن: الأضرار غير المباشرة أو العرضية أو التبعية، فقدان الأرباح، فقدان البيانات، أو أي قرارات تجارية أو استثمارية اتُّخذت بناءً على مخرجات المنصة.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-3">8. الإنهاء وتعليق الحسابات</h2>
            <p className="mb-3">
              يحق لك إنهاء اشتراكك في أي وقت عبر إعدادات الحساب. كما تحتفظ كلميرون بحق تعليق أو إنهاء الحسابات فوراً في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-400">
              <li>انتهاك صريح لأي بند من بنود هذه الشروط.</li>
              <li>التأخر في السداد لفترة تتجاوز 14 يوماً.</li>
              <li>الاشتباه في النشاط الاحتيالي أو الإضرار بسلامة المنصة.</li>
            </ul>
            <p className="mt-3 text-sm">
              عند الإنهاء، يتوقف الوصول إلى البيانات المخزّنة فور انتهاء فترة الاحتفاظ المحددة في سياسة الخصوصية.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border-r-2 border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-3">9. القانون الحاكم وتسوية النزاعات</h2>
            <p className="mb-3">
              تخضع هذه الاتفاقية وتُفسَّر وفقاً لقوانين جمهورية مصر العربية. تختص المحاكم المصرية المختصة بالفصل في أي نزاع يتعلق بهذه الاتفاقية.
            </p>
            <p className="text-sm text-neutral-400">
              يتفق الطرفان على محاولة تسوية أي نزاع ودياً خلال 30 يوماً قبل اللجوء إلى القضاء.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-3">10. التعديلات على هذه الشروط</h2>
            <p>
              تحتفظ كلميرون بحق تعديل هذه الشروط في أي وقت. في حال وجود تعديلات جوهرية، سنُخطرك عبر البريد الإلكتروني المسجّل أو عبر إشعار بارز على المنصة قبل 15 يوماً على الأقل من نفاذ التعديلات. استمرارك في استخدام الخدمة بعد ذلك يُعدّ موافقة ضمنية على الشروط المعدّلة.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border-r-2 border-cyan-500/30">
            <h2 className="text-xl font-bold text-white mb-3">11. أحكام متفرقة</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-neutral-400">
              <li><strong className="text-white">عدم التنازل:</strong> عدم ممارسة أي طرف لأي حق لا يُعدّ تنازلاً عنه.</li>
              <li><strong className="text-white">قابلية الفصل:</strong> إذا تبيّن أن أي بند غير قابل للتطبيق، تبقى سائر الشروط نافذة.</li>
              <li><strong className="text-white">الاتفاقية الكاملة:</strong> تُمثّل هذه الوثيقة مع سياسة الخصوصية الاتفاقية الكاملة بين الطرفين.</li>
              <li><strong className="text-white">السيادة على النسخ الأجنبية:</strong> في حال الترجمة، تسود النسخة العربية في حل أي تعارض.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl bg-cyan-500/[0.03]">
            <h2 className="text-xl font-bold text-white mb-3">التواصل بشأن الشروط</h2>
            <p className="text-sm">
              لأي استفسار قانوني يتعلق بهذه الشروط، يرجى التواصل على:{" "}
              <a href="mailto:legal@kalmeron.ai" className="text-cyan-400 underline hover:text-white transition-colors" dir="ltr">
                legal@kalmeron.ai
              </a>
            </p>
          </section>

        </div>
      </div>
    </PublicShell>
  );
}
