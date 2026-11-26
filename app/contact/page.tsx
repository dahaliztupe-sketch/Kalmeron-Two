import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Phone, Building2, ArrowLeft, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "تواصل معنا — كلميرون",
  description:
    "قنوات التواصل مع كلميرون قيد التجهيز.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
  },
};

const CHANNELS: {
  icon: typeof Mail;
  title: string;
  description: string;
}[] = [
  {
    icon: Building2,
    title: "المبيعات والباقات الكبيرة",
    description: "الخطة المؤسسية قيد الإعداد ولا تُباع مباشرة بعد.",
  },
  {
    icon: MessageCircle,
    title: "الدعم الفنّي",
    description: "قناة الدعم الرسمية قيد التجهيز.",
  },
  {
    icon: Sparkles,
    title: "الشراكات والتعاون",
    description: "نستقبل اقتراحات الشراكة بعد إعلان قناة التواصل الرسمية.",
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
            قنوات التواصل الرسمية قيد التجهيز وستُعلن هنا فور تفعيلها.
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
              </article>
            );
          })}
        </section>

        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 md:p-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-300" />
            حالة قنوات التواصل
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed">
            لا توجد قناة تواصل مباشرة منشورة حالياً. سنعلن عنوان البريد الرسمي ووقت الاستجابة هنا بعد تفعيله.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
