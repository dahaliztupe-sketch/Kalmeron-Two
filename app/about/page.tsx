import { PublicShell } from "@/components/layout/PublicShell";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "من نحن | كلميرون AI",
  description:
    "كلميرون AI — مقرّ عمليات لكل شركة ناشئة عربية. تعرّف على قصتنا، مهمّتنا، ورؤيتنا لمستقبل ريادة الأعمال في المنطقة.",
  openGraph: {
    title: "من نحن | كلميرون AI",
    description:
      "نبني نظام التشغيل الذكي للشركات الناشئة العربية: 16 وكيلاً ذكياً يعملون مع رواد الأعمال يومياً.",
    locale: "ar_EG",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="max-w-4xl mx-auto py-14 px-6">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 border-r-4 border-[rgb(var(--azure))] pr-4">
            من نحن
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            مقرّ العمليات الذكي لكل شركة ناشئة عربية.
          </p>
        </div>

        <div className="space-y-8 text-neutral-300 leading-relaxed text-lg">
          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">قصتنا</h2>
            <p>
              بدأت كلميرون من ملاحظة بسيطة: رائد الأعمال المصري والخليجي يُنفق
              من 5,000 إلى 50,000 جنيه شهرياً على مستشارين متفرقين — مالي،
              قانوني، تسويق، تشغيل — ومع ذلك يبقى وحيداً أمام أصعب القرارات.
              قرّرنا أن نبني بديلاً ذكياً يفهم اللغة العربية، يحترم القانون
              المصري والخليجي، ويعمل 24/7 بسعر يبدأ من 199 جنيهاً شهرياً.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border-l-4 border-[rgb(var(--brand-cyan))]">
            <h2 className="text-2xl font-bold text-white mb-4">مهمتنا</h2>
            <p>
              تمكين كل رائد أعمال عربي من اتخاذ قرارات أفضل، أسرع، وأكثر ثقة —
              عبر فريق من 16 مساعداً ذكياً متخصصاً في المالية، القانون،
              التسويق، المبيعات، الموارد البشرية، والعمليات.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">رؤيتنا</h2>
            <p>
              أن نصبح <strong className="text-white">مقرّ العمليات</strong>{" "}
              لكل شركة ناشئة عربية — منصة واحدة تُغني عن عشرات الأدوات
              والمستشارين، وتمنح المؤسس وقتاً أطول لما يهم: المنتج والعميل.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">قيَمنا</h2>
            <ul className="list-disc pr-6 space-y-3 marker:text-[rgb(var(--brand-cyan))]">
              <li>
                <strong className="text-white">العربية أولاً:</strong> كل
                مخرجاتنا بعربية فصحى دقيقة، مع احترام السياق المحلي.
              </li>
              <li>
                <strong className="text-white">الامتثال القانوني:</strong>{" "}
                متوافقون مع قانون 151 لحماية البيانات المصري، PDPL السعودي،
                وGDPR الأوروبي.
              </li>
              <li>
                <strong className="text-white">الشفافية:</strong> سجل تحديثات
                علني، وأسعار واضحة بدون رسوم خفية.
              </li>
              <li>
                <strong className="text-white">الفعالية المالية:</strong> سعر
                لا يتجاوز 5% مما يدفعه رائد الأعمال للمستشارين التقليديين.
              </li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">الفريق</h2>
            <p>
              فريق من المهندسين والمصممين ورواد الأعمال المصريين والخليجيين،
              مدعوم بشبكة من المستشارين القانونيين والماليين في القاهرة،
              والرياض، ودبي. نعمل من قلب المنطقة، لرواد المنطقة.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border-r-4 border-[rgb(var(--azure))]">
            <h2 className="text-2xl font-bold text-white mb-4">تواصل معنا</h2>
            <p className="mb-4">
              للشراكات، الاستثمار، أو أسئلة عامة:
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/investors"
                className="inline-block rounded-2xl bg-[rgb(var(--azure))] px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                للمستثمرين
              </Link>
              <Link
                href="/contact"
                className="inline-block rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                تواصل
              </Link>
              <Link
                href="/auth/signup"
                className="inline-block rounded-2xl border border-[rgb(var(--brand-cyan))]/40 bg-[rgb(var(--brand-cyan))]/10 px-6 py-3 font-semibold text-[rgb(var(--brand-cyan))] hover:bg-[rgb(var(--brand-cyan))]/20"
              >
                جرّب المنصة
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
