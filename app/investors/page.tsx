import { PublicShell } from "@/components/layout/PublicShell";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "حالة المشروع | كلميرون",
  description:
    "كلميرون مشروع في مرحلة مبكرة. لا توجد جولة استثمار مفتوحة حالياً.",
  robots: { index: false, follow: false },
};

export default function InvestorsPage() {
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
          حالة المشروع
        </h1>
        <div className="space-y-4 text-neutral-300 leading-8">
          <p>
            كلميرون منصة عربية لمساعدة رواد الأعمال على تحويل الفكرة إلى خطة
            واضحة، وهي في مرحلة مبكرة جداً من التطوير. بُنيت بمساعدة أدوات
            الذكاء الاصطناعي.
          </p>
          <p>
            لا توجد جولة استثمار مفتوحة حالياً، ولا نعرض أرقام سوق أو إيرادات
            أو عدد مستخدمين على هذه الصفحة لأنها غير موثّقة بعد.
          </p>
          <p>
            الدفع والبريد وبعض الخدمات الجانبية قيد التفعيل، وتُعلن قنوات
            التواصل الرسمية في صفحة التواصل فور جهوزها.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 mt-10">
          <Link
            href="/start"
            className="inline-block rounded-2xl bg-[rgb(var(--azure))] px-8 py-4 font-bold text-white hover:opacity-90"
          >
            جرّب المنصة مجاناً
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-bold text-white hover:bg-white/10"
          >
            التواصل
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
