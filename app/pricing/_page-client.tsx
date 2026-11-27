"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CONTACT_EMAIL } from "@/src/lib/site";

export type BillingCycle = "monthly" | "annual";

/**
 * Honest pricing page. No price, plan or payment method has been decided.
 * The billing code (src/lib/billing) is kept for later but is not exposed here.
 */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070D]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <BrandLogo size={36} />
          <Link
            href="/validate"
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-bold hover:bg-neutral-100 transition"
          >
            جرّب التحقق من فكرتك
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">الأسعار لم تُحدَّد بعد</h1>
        <p className="text-text-secondary leading-relaxed mb-4">
          كلميرون مشروع تجريبي بُني بمساعدة الذكاء الاصطناعي، وحالته الآن &quot;تجريبي، متوقف مؤقتاً&quot;.
          لم نحدد أي سعر أو خطة مدفوعة، ولا توجد بوابة دفع مفعّلة، ولن يُخصم منك شيء.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          نخطط لتقديم الخدمة مدفوعة لاحقاً، وسنعلن الأسعار هنا قبل أن يُطلب منك أي مبلغ.
          مخرجات المساعدين مسودات غير مراجعة بشرياً وليست استشارة مهنية.
        </p>
        <p className="text-text-secondary leading-relaxed mb-8">
          للاستفسار أو لتخبرنا بما تتوقعه من الخدمة: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <Link
          href="/validate"
          className="inline-block rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 font-bold transition"
        >
          ابدأ بفكرتك
        </Link>
      </main>
    </div>
  );
}
