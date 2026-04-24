import type { Metadata } from "next";
import Link from "next/link";
import { EXPERTS, EXPERT_CATEGORIES, getExpertsByCategory } from "@/src/lib/seo/experts";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "الخبراء | 12 مساعداً ذكياً متخصصاً في كل ما تحتاجه",
  description:
    "تعرف على مساعدين كلميرون: CFO افتراضي، حارس قانوني، مدير تسويق، رادار فرص، درع أخطاء، وأكثر. كل مساعد متخصص بعمق في مجاله.",
  alternates: { canonical: "/ai-experts" },
};

export default function ExpertsIndexPage() {
  return (
    <SeoLandingShell
      eyebrow="الخبراء"
      title={`${EXPERTS.length} خبيراً ذكياً يعملون كفريق التأسيس الخاص بك`}
      description="كل خبير من خبراء كلميرون متخصص بعمق في مجاله، مدرب على بيانات السوق المصري والخليجي. اختر الخبير الأنسب لاحتياجك."
      breadcrumbs={[{ label: "الخبراء" }]}
    >
      {EXPERT_CATEGORIES.map((cat) => {
        const items = getExpertsByCategory(cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{cat.nameAr}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((e) => (
                <Link
                  key={e.slug}
                  href={`/ai-experts/${e.slug}`}
                  className="group rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all"
                >
                  <div className="text-3xl mb-3">{e.emoji}</div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition">
                    {e.nameAr}
                  </h3>
                  <div className="text-xs text-zinc-500 mb-3">{e.roleAr}</div>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    {e.taglineAr}
                  </p>
                  <span className="text-cyan-400 inline-flex items-center gap-1 text-xs group-hover:translate-x-[-4px] transition-transform">
                    اعرف المزيد
                    <ArrowLeft className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </SeoLandingShell>
  );
}
