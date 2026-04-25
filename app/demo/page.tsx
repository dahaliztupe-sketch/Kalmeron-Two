import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SCENARIOS } from "./scenarios";
import { DemoTabs } from "@/components/demo/DemoTabs";

export const metadata: Metadata = {
  title: "جرّب كلميرون مباشرة — بدون تسجيل",
  description:
    "شوف كلميرون شغّال على 3 سيناريوهات حقيقية لرواد أعمال مصريين. بدون تسجيل، بدون بطاقة، بدون انتظار.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "جرّب كلميرون مباشرة — 3 سيناريوهات لرواد أعمال مصريين",
    description:
      "كافيه في المعادي، متجر إلكتروني للسعودية، تأسيس شركة قانونية. شوف المجلس بيتداول قدّامك.",
    url: "/demo",
  },
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#04060B] text-white" dir="rtl">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070D]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-sm text-text-secondary hover:text-white transition"
            >
              الأسعار
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl bg-white text-black px-4 py-2 text-sm font-bold hover:bg-neutral-100 transition"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-[11px] uppercase tracking-[0.2em] text-cyan-200 font-bold mb-5">
            عرض حيّ — بدون تسجيل
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            شوف <span className="brand-gradient-text">المجلس</span> بيشتغل قدّامك
          </h1>
          <p className="text-neutral-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            3 سيناريوهات حقيقية لرواد أعمال مصريين. كل سيناريو يستغرق دقيقتين تقريباً
            ويُريك كيف يتداول 4 خبراء داخل المنصّة قبل تسليم توصية واحدة قابلة للتنفيذ.
          </p>
        </div>
      </section>

      {/* Scenarios — interactive client component */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-20">
        <DemoTabs scenarios={SCENARIOS} />
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3">
            عجبتك التجربة؟
          </h2>
          <p className="text-neutral-300 mb-7">
            ابدأ بفكرتك إنت دلوقتي — مجاني للأبد، بدون بطاقة ائتمان.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-3.5 text-sm font-bold hover:bg-neutral-100 transition"
          >
            ابدأ بفكرتك مجاناً
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
