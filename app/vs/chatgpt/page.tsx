import Link from "next/link";
import { ArrowLeft, Check, Minus, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata = {
  title: "كلميرون مقابل ChatGPT — كلميرون",
  description: "مقارنة صريحة بين كلميرون وChatGPT لمؤسّسي شركات المنطقة.",
};

const ROWS: { feature: string; kalmeron: string; chatgpt: string }[] = [
  { feature: "اللغة الأم", kalmeron: "عربي أصيل + مصطلحات السوق", chatgpt: "إنجليزي مترجم" },
  { feature: "معرفة السوق المحلي", kalmeron: "أسعار، رسوم، تراخيص ٢٠ بلداً عربياً", chatgpt: "عام، يحتاج توضيحاً مستمرّاً" },
  { feature: "النماذج المالية", kalmeron: "بالعملة المحلية، حسب نظام الضرائب الفعلي", chatgpt: "يحتاج تحويل يدوي" },
  { feature: "العقود القانونية", kalmeron: "قوالب مصرية/خليجية مراجعة", chatgpt: "نماذج عامة، قد تحتاج محامياً" },
  { feature: "الذاكرة بين المحادثات", kalmeron: "ذاكرة طويلة المدى لشركتك", chatgpt: "ذاكرة محدودة، تختفي بعد فترة" },
  { feature: "البحث في مستنداتك", kalmeron: "يبحث في PDFs ومستندات شركتك", chatgpt: "يحتاج رفع كل مرّة" },
  { feature: "السعر للمؤسّس العربي", kalmeron: "خطة مجانية + مدفوعة بالعملة المحلية", chatgpt: "٢٠$ شهرياً بالدولار" },
  { feature: "الامتثال للقانون المحلي", kalmeron: "PDPL مصر + GDPR", chatgpt: "GDPR فقط" },
];

export default function VsChatgptPage() {
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200 mb-5">
            مقارنة شفّافة
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4 [text-wrap:balance]">
            كلميرون مقابل ChatGPT
          </h1>
          <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-8 [text-wrap:pretty]">
            كلاهما يستخدم نماذج كبرى — لكن لكلٍّ هدف. هذه مقارنة صريحة لكي تختار بثقة.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] mb-10">
          <div className="grid grid-cols-12 bg-white/[0.04] border-b border-white/10 px-4 md:px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-wide text-neutral-300">
            <div className="col-span-4">الميزة</div>
            <div className="col-span-4 text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              كلميرون
            </div>
            <div className="col-span-4 text-neutral-400">ChatGPT</div>
          </div>
          <ul>
            {ROWS.map((row, i) => (
              <li key={i} className={`grid grid-cols-12 px-4 md:px-6 py-4 text-sm gap-3 ${i % 2 ? "bg-white/[0.015]" : ""}`}>
                <div className="col-span-4 font-semibold text-white leading-relaxed">{row.feature}</div>
                <div className="col-span-4 text-neutral-200 leading-relaxed flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{row.kalmeron}</span>
                </div>
                <div className="col-span-4 text-neutral-400 leading-relaxed flex items-start gap-2">
                  <Minus className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                  <span>{row.chatgpt}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950/40 via-[#0B1020] to-cyan-950/30 p-8 md:p-10 text-center">
          <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">ابدأ بكلميرون مجاناً</h2>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-7 mb-6">
              بدون بطاقة ائتمان، وخطة مجانية تكفي لاختبار فكرتك.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
              <Link href="/auth/signup" prefetch className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold">
                ابدأ مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/why-arabic" className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm">
                لماذا عربي أصيل؟
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
