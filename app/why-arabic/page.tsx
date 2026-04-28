import Link from "next/link";
import { ArrowLeft, Globe2, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata = {
  title: "لماذا عربي أصيل؟ — كلميرون",
  description: "كلميرون يفكّر بالعربية لأنه مدرَّب على شركات وأسواق المنطقة، وليس مجرّد ترجمة.",
};

const ITEMS: { title: string; desc: string }[] = [
  { title: "يفهم اللهجات الست الكبرى", desc: "مصري، خليجي، شامي، مغاربي، سوداني، يمني — مع الفصحى الخفيفة." },
  { title: "يعرف الأسواق المحلية", desc: "أسعار التراخيص، رسوم الشحن، أعراف التفاوض، أوقات الذروة الحقيقية لكل بلد." },
  { title: "كتابة من اليمين لليسار صحيحة", desc: "كل صفحة، كل واجهة، كل تقرير PDF — RTL أصلي وليس CSS مقلوباً." },
  { title: "اعتبار ثقافي", desc: "يحترم الأسبوع الإسلامي، يتجنّب الأمثلة غير المناسبة ثقافياً، يستخدم العملات المحلية." },
  { title: "لغة قانونية بمصطلحات السوق", desc: "يميّز بين «شركة ذات مسؤولية محدودة» المصرية و«ش.ذ.م.م» الإماراتية ولا يخلط بينهما." },
  { title: "محتوى لرواد المنطقة", desc: "أمثلة من سوق التوصيل المصري، فينتك السعودي، تجارة جدّة، لا أمثلة سيليكون فالي." },
];

export default function WhyArabicPage() {
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200 mb-5">
            <Globe2 className="w-3.5 h-3.5" />
            Native Arabic
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4 [text-wrap:balance]">
            لماذا عربي أصيل؟
          </h1>
          <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-8 [text-wrap:pretty]">
            ليس ترجمة، ليس Google Translate. كلميرون يفكّر بالعربية لأنه مدرَّب على شركات وأسواق المنطقة.
          </p>
        </div>

        <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-6">الفرق العملي</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-14">
          {ITEMS.map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-cyan-400/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 shrink-0 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1.5 text-base md:text-lg">{item.title}</h3>
                  <p className="text-sm text-neutral-300 leading-7">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/40 via-[#0B1020] to-cyan-950/30 p-8 md:p-10 text-center">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">جرّب الفرق بنفسك</h2>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-7 mb-6">
              اطرح نفس السؤال على ChatGPT وعلى كلميرون، ثمّ قارن.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
              <Link href="/auth/signup" prefetch className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                ابدأ مع كلميرون مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/vs/chatgpt" className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm">
                مقارنة مع ChatGPT
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
