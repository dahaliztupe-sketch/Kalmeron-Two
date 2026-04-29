import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Phone, Building2, ArrowLeft, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "تواصل معنا — كلميرون",
  description:
    "تواصل مع فريق كلميرون عبر البريد الإلكتروني أو واتساب — للمبيعات، الدعم الفنّي، الشراكات، والاستفسارات العامّة.",
  alternates: { canonical: "/contact" },
};

const SALES_EMAIL = "sales@kalmeron.com";
const SUPPORT_EMAIL = "support@kalmeron.com";
const PARTNERSHIPS_EMAIL = "partners@kalmeron.com";

const CHANNELS = [
  {
    icon: Building2,
    title: "المبيعات والباقات الكبيرة",
    description: "للشركات التي تبحث عن عرض مخصّص أو خصم على باقة Enterprise.",
    cta: "راسل المبيعات",
    href: `mailto:${SALES_EMAIL}?subject=استفسار%20Enterprise`,
    label: SALES_EMAIL,
  },
  {
    icon: MessageCircle,
    title: "الدعم الفنّي",
    description: "تواجه مشكلة في الحساب أو الفوترة أو أحد الوكلاء؟ نحن هنا.",
    cta: "افتح بطاقة دعم",
    href: `mailto:${SUPPORT_EMAIL}?subject=مساعدة%20فنّية`,
    label: SUPPORT_EMAIL,
  },
  {
    icon: Sparkles,
    title: "الشراكات والتعاون",
    description: "شريك تكنولوجي، موزّع، أو ترغب بدمج كلميرون في منتجك؟",
    cta: "اقترح شراكة",
    href: `mailto:${PARTNERSHIPS_EMAIL}?subject=اقتراح%20شراكة`,
    label: PARTNERSHIPS_EMAIL,
  },
];

export default function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ intent?: string }>;
}) {
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4 icon-flip" />
          الرئيسية
        </Link>

        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs mb-6">
            <Mail className="w-3.5 h-3.5" />
            تواصل معنا
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            نحن هنا للمساعدة
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            اختر القناة الأنسب لاستفسارك — نردّ عادةً خلال يوم عمل واحد.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-5 mb-16">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <article
                key={c.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-300" />
                </div>
                <h2 className="text-lg font-semibold mb-2">{c.title}</h2>
                <p className="text-sm text-neutral-400 leading-relaxed mb-5 flex-1">
                  {c.description}
                </p>
                <a
                  href={c.href}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
                >
                  {c.cta}
                </a>
                <div className="mt-3 text-xs text-neutral-500 text-center" dir="ltr">
                  {c.label}
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 md:p-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-300" />
            معلومات الاتّصال
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-300">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-neutral-500 text-xs mb-1">البريد العام</div>
              <a
                href={`mailto:hello@kalmeron.ai`}
                className="hover:text-white transition-colors"
                dir="ltr"
              >
                hello@kalmeron.ai
              </a>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-neutral-500 text-xs mb-1">ساعات الاستجابة</div>
              <div>الأحد — الخميس · 9 ص — 6 م (تقويم القاهرة)</div>
            </div>
          </div>
          <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
            للاستعلامات الإعلامية والأكاديمية، يرجى التواصل عبر البريد العام
            مع ذكر طبيعة الطلب في عنوان الرسالة.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
