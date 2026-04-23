import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Brain, Zap, Target, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Founder Mode | كلميرون",
  description:
    "وضع المؤسس: تجربة موحدة تدمج كل الأدوات في sidebar واحد، مع AI يفهم سياقك ويتذكر أهدافك ويعمل بشكل proactive.",
  alternates: { canonical: "/founder-mode" },
};

export default function FounderModePage() {
  return (
    <SeoLandingShell
      eyebrow="ميزة محورية"
      title="Founder Mode"
      description="بدلاً من 50 tab، شاشة واحدة. AI يفهم شركتك، يتذكر أهدافك، ويعمل بشكل استباقي. كأن لك Chief of Staff."
      breadcrumbs={[{ label: "Founder Mode" }]}
    >
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Brain, title: "ذاكرة دائمة", desc: "AI يتذكر كل سياق شركتك: المنتج، المستثمرين، الفريق، الأهداف. لا تكرر نفسك." },
          { icon: Zap, title: "Proactive Actions", desc: "AI يقترح ويفعل، لا ينتظر السؤال. تنبيهات للـ runway، الـ deadlines، الفرص." },
          { icon: Target, title: "Goal-Aligned", desc: "كل اقتراح ربطه بأهدافك الربعية الـ OKRs. لا توجد توصيات عشوائية." },
          { icon: Compass, title: "Daily Briefing", desc: "تقرير صباحي شخصي: ما يحتاج اهتمامك اليوم، ما تأخر، ما الفرص الجديدة." },
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
        <h2 className="text-3xl font-bold text-white mb-6">كيف يعمل؟</h2>
        <ol className="space-y-4">
          {[
            "أدخل سياق شركتك مرة: الفكرة، المرحلة، الفريق، التمويل.",
            "AI يبني لك Founder Brain - معرفة كاملة بشركتك.",
            "كل صباح، تستلم Daily Briefing: priorities، blockers، wins.",
            "خلال اليوم، AI يقترح next actions ويتابع تقدمك.",
            "أسبوعياً، تقرير weekly review مع insights عميقة.",
          ].map((s, i) => (
            <li key={i} className="flex gap-4 rounded-xl bg-white/[0.03] border border-white/10 p-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-zinc-300 pt-1">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">ماذا يفعل لك Founder Mode؟</h2>
        <ul className="space-y-3">
          <FeatureCheck>تذكير بـ deadlines (compliance، taxes، investor updates)</FeatureCheck>
          <FeatureCheck>{"تنبيه عند Cash Runway < 9 شهور مع خطة fundraise"}</FeatureCheck>
          <FeatureCheck>تحليل usage data أسبوعياً مع توصيات</FeatureCheck>
          <FeatureCheck>صياغة updates للمستثمرين تلقائياً</FeatureCheck>
          <FeatureCheck>متابعة أداء كل department vs OKRs</FeatureCheck>
          <FeatureCheck>اكتشاف فرص (شراكات، PR، tenders) في السوق</FeatureCheck>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
