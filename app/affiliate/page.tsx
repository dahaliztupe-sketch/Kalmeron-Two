"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Coins, Users, TrendingUp, Check, Mail, ExternalLink } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const COMMISSION_RATE = 30; // %
const COMMISSION_DURATION_MONTHS = 12;

/**
 * Affiliate Program landing — P1-3 / GE-3 from the 45-expert business audit.
 * Generic landing; actual signup goes through email until the partner portal
 * ships in P2.
 */
export default function AffiliatePage() {
  const tiers = [
    {
      name: "صانع المحتوى",
      followers: "5k – 50k متابع",
      bonus: "كود تخفيض 20 % لجمهورك",
      icon: Users,
      color: "text-cyan-300",
    },
    {
      name: "المؤثر المتوسط",
      followers: "50k – 200k",
      bonus: "1k$ مكافأة عند 25 عميلاً مدفوعاً",
      icon: TrendingUp,
      color: "text-indigo-300",
    },
    {
      name: "الشريك الاستراتيجي",
      followers: "+200k أو حاضنة/جامعة",
      bonus: "اتفاق مخصص + Equity صغيرة عند المؤهلية",
      icon: Coins,
      color: "text-amber-300",
    },
  ];

  const steps = [
    "املأ نموذج التسجيل (أقل من 3 دقائق).",
    "نراجع طلبك خلال 5 أيام عمل ونرسل رابطك ولوحة بياناتك.",
    "تشارك كلميرون مع جمهورك بأسلوبك (محتوى، Newsletter، Reels…).",
    `تستلم ${COMMISSION_RATE}% عمولة شهرية على كل اشتراك تجلبه — لمدة ${COMMISSION_DURATION_MONTHS} شهراً.`,
    "نُحوّل العمولة كل شهر عبر Stripe / حوالة بنكية (حد أدنى 50$).",
  ];

  const faq = [
    {
      q: "هل الانضمام مجاني؟",
      a: "نعم، 100 % مجاني. نُراجع الطلبات يدوياً للحفاظ على جودة الشركاء.",
    },
    {
      q: "كيف تُتتبَع الإحالات؟",
      a: "كل شريك يحصل على رابط فريد بمعلَمات UTM + كود خصم مخصص. نظام التتبع يعمل عبر Cookies بمدة 60 يوماً.",
    },
    {
      q: "هل يمكنني الترويج بأي لغة؟",
      a: "نعم. لكن نُفضّل العربية والإنجليزية لأنهما لغتا منصتنا الرئيسيتان.",
    },
    {
      q: "هل تُسمح الإعلانات المدفوعة على Brand Keywords؟",
      a: "لا. الإعلان على كلمات 'كلميرون' أو 'Kalmeron' في Google/Meta Ads ممنوع لحماية القناة الرسمية.",
    },
  ];

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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-emerald-300 text-xs font-semibold mb-6">
            <Coins className="w-3.5 h-3.5" />
            برنامج الشركاء — مفتوح الآن
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-l from-emerald-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              {COMMISSION_RATE}% عمولة شهرية
            </span>
            <br />
            على كل عميل تجلبه — لمدة عام كامل
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            انضم لشركاء كلميرون. كل اشتراك من جمهورك يجلب لك دخلاً شهرياً متجدداً، بأبسط برنامج إحالة في السوق العربي.
          </p>
        </motion.div>

        {/* Tiers */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">الفئات</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] transition">
                  <Icon className={`w-7 h-7 ${t.color} mb-4`} />
                  <h3 className="font-bold text-lg text-white">{t.name}</h3>
                  <p className="text-neutral-500 text-xs mt-1">{t.followers}</p>
                  <p className="text-neutral-300 text-sm mt-4">{t.bonus}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">كيف يعمل البرنامج؟</h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <span className="text-neutral-200 text-sm pt-1.5">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
          <a
            href="mailto:partners@kalmeron.com?subject=Affiliate%20Application"
            className="rounded-full bg-gradient-to-l from-emerald-500 to-cyan-500 px-8 py-4 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            تقدّم بطلبك الآن
          </a>
          <Link
            href="/affiliate-terms"
            className="rounded-full border border-white/[0.1] px-8 py-4 text-white font-medium hover:bg-white/[0.04] transition inline-flex items-center gap-2"
          >
            شروط البرنامج <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-6">أسئلة شائعة</h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <summary className="cursor-pointer font-semibold text-neutral-100 list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-neutral-500 group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-neutral-300 text-sm">
              برنامج الشركاء مكمّل لـ <Link href="/first-100" className="underline text-cyan-300">برنامج «أوّل 100 شركة»</Link> — يمكنك الترويج لكليهما في حملة واحدة.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
