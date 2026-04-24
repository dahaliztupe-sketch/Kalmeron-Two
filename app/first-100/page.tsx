"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Trophy, Check, Sparkles, Clock, ArrowLeft, Crown } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TrustBadges } from "@/components/marketing/TrustBadges";

const TOTAL_SEATS = 100;

/**
 * First-100 Lifetime Deal — P0-7 from the 45-expert business audit.
 * Goal: 100 paying customers locked in at 9 USD/month forever, in
 * exchange for a public testimonial + PR participation.
 */
export default function First100Page() {
  // Seat counter is static for now (would read Firestore in production).
  // The audit recommends starting with `seatsTaken=0` and bumping it as
  // sign-ups land in `first_100_signups` collection.
  const [seatsTaken] = useState(0);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const seatsLeft = Math.max(0, TOTAL_SEATS - seatsTaken);
  const pct = (seatsTaken / TOTAL_SEATS) * 100;

  const benefits = [
    "اشتراك مدى الحياة بـ 9$ شهرياً (السعر العادي 19$)",
    "وصول مبكر لكل الميزات الجديدة قبل الإطلاق العام",
    "ساعتان شهرياً مكالمة استشارية مع فريق المنتج",
    "تجربة مجانية 30 يوماً قبل أول دفعة",
    "شارة 'مؤسس كلميرون' في حسابك ولوحة العملاء",
    "أولوية دعم خلال 2 ساعة (مقابل 24 ساعة للعموم)",
  ];

  const expectations = [
    "نشر شهادة فيديو قصيرة (3–5 دقائق) خلال أول 60 يوم",
    "السماح بعرض شعار شركتك في صفحة 'يثقون بنا'",
    "ملء استبيان NPS كل 90 يوم",
    "رد على رسائل التحديث الشهرية حين يُطلب رأيك",
  ];

  const faq = [
    {
      q: "هل السعر فعلاً مدى الحياة؟",
      a: "نعم. طالما اشتراكك نشط، السعر 9$ شهرياً لن يتغير حتى لو رفعنا أسعارنا للجمهور. عند الإلغاء، يعود السعر للعادي عند الاشتراك مجدداً.",
    },
    {
      q: "ماذا يحدث بعد بيع المقاعد الـ100؟",
      a: "يُغلَق العرض. لن نُعيد فتحه. الدفعة التالية ستكون 'أول 500' بسعر مختلف وشروط أخرى.",
    },
    {
      q: "هل يمكنني التوقف عن المشاركة في الشهادات؟",
      a: "بالطبع. السعر يبقى لك، لكن نطلب فقط الالتزام في أول 60 يوماً.",
    },
    {
      q: "أنا فردي، ليس شركة — هل أستحق المقعد؟",
      a: "نعم. كلميرون لرواد الأعمال أولاً، سواء كنت سولو أو فريقاً.",
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#05070D] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-300 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Link>
          <BrandLogo size={32} iconOnly />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-amber-300 text-xs font-semibold mb-6"
          >
            <Trophy className="w-3.5 h-3.5" />
            عرض محدود — ينتهي ببيع المقعد الـ100
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            <span className="bg-gradient-to-l from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
              أوّل 100 شركة
            </span>
            <br />
            تبني رحلتها مع كلميرون
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            احصل على اشتراك <span className="text-white font-semibold">مدى الحياة بـ 9$ شهرياً</span> بدلاً من 19$،
            مقابل شهادة قصيرة بعد أول 60 يوماً تُعرض في صفحاتنا الرسمية.
          </p>
        </div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 mb-12"
        >
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-5xl md:text-6xl font-bold tabular-nums">
                {seatsLeft}
                <span className="text-2xl text-neutral-500">/{TOTAL_SEATS}</span>
              </div>
              <div className="text-neutral-400 mt-2 text-sm">مقعد متاح حتى الآن</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-emerald-400">9$ <span className="text-base text-neutral-400">/شهر</span></div>
              <div className="text-neutral-500 text-xs mt-1 line-through">السعر العادي 19$/شهر</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-l from-cyan-500 to-violet-500"
            />
          </div>
          {now && (
            <div className="flex items-center gap-1.5 text-neutral-500 text-xs mt-4">
              <Clock className="w-3 h-3" />
              آخر تحديث: {now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </motion.div>

        {/* What you get */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            ماذا تحصل عليه؟
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <div
                key={b}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-neutral-200 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </section>

        {/* What we ask */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            ماذا نطلب منك؟
          </h2>
          <div className="space-y-3">
            {expectations.map((e, i) => (
              <div key={e} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-neutral-300 text-sm">{e}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
          <Link
            href="/auth/signup?plan=first100"
            className="rounded-full bg-gradient-to-l from-cyan-500 to-violet-500 px-8 py-4 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
          >
            احجز مقعدك الآن — 9$/شهر
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-white/[0.1] px-8 py-4 text-white font-medium hover:bg-white/[0.04] transition"
          >
            مقارنة بالباقات الأخرى
          </Link>
        </div>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">أسئلة شائعة</h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <summary className="cursor-pointer font-semibold text-neutral-100 list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-neutral-500 group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Trust */}
        <TrustBadges />
      </main>
    </div>
  );
}
