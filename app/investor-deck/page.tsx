import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Presentation, BarChart3, Users, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Investor Deck Generator | كلميرون",
  description:
    "مولد pitch decks بمعايير Sequoia/a16z، مخصص للسوق العربي. يربط ببياناتك المالية الحقيقية ويولد deck جاهز في 10 دقائق.",
  alternates: { canonical: "/investor-deck" },
};

export default function InvestorDeckPage() {
  return (
    <SeoLandingShell
      eyebrow="ميزة قاتلة"
      title="Investor Deck Generator"
      description="من فكرة إلى pitch deck بمعايير عالمية في 10 دقائق. مخصص لمستثمري MENA، مدعوم ببياناتك الفعلية."
      breadcrumbs={[{ label: "Investor Deck Generator" }]}
    >
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Presentation, title: "12 شريحة قياسية", desc: "Sequoia template + a16z + YC. كل شريحة بمعايير proven." },
          { icon: BarChart3, title: "ربط بالبيانات", desc: "يجلب metrics من Stripe، Mixpanel، QuickBooks مباشرة." },
          { icon: Users, title: "مخصص للمستثمر", desc: "نسخة لـ Algebra، نسخة لـ STV، نسخة لـ 500. تخصيص automatic." },
          { icon: Sparkles, title: "Real-time updates", desc: "لما تتغير metrics، الـ deck يتحدث تلقائياً." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">الـ 12 شريحة</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "Title slide", "Problem", "Solution", "Market Size (TAM/SAM/SOM)",
            "Product Demo", "Traction", "Business Model", "Go-to-Market",
            "Competition", "Team", "Financials & Ask", "Vision/Closing",
          ].map((s, i) => (
            <div key={s} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {i + 1}
              </span>
              <span className="text-zinc-300">{s}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">ما تحصل عليه</h2>
        <ul className="space-y-3">
          <FeatureCheck>PowerPoint + PDF + Google Slides exports</FeatureCheck>
          <FeatureCheck>نسختين: عربي وإنجليزي بشكل automatic</FeatureCheck>
          <FeatureCheck>Speaker notes لكل شريحة (ما تقول، ما تتجنب)</FeatureCheck>
          <FeatureCheck>Q&A appendix: 30 سؤال متوقع مع إجابات</FeatureCheck>
          <FeatureCheck>Investor tracker: من شاف، متى، ما الـ feedback</FeatureCheck>
          <FeatureCheck>قائمة 200+ MENA VC مع contacts و focus areas</FeatureCheck>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
