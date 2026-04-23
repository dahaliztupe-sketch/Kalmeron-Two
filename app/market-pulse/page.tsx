import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Activity, TrendingUp, AlertCircle, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Market Pulse | كلميرون",
  description:
    "نبض السوق المباشر: تتبع التمويلات، الـ exits، التغيرات التنظيمية، والفرص في 22 دولة عربية بشكل مستمر.",
  alternates: { canonical: "/market-pulse" },
};

export default function MarketPulsePage() {
  return (
    <SeoLandingShell
      eyebrow="مراقبة فورية"
      title="Live Market Pulse"
      description="نظام يراقب 1000+ مصدر يومياً: تمويلات، exits، تغيرات قانونية، tenders، فرص شراكة. ينبهك بما يخصك فقط."
      breadcrumbs={[{ label: "Market Pulse" }]}
    >
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: TrendingUp, title: "تمويلات MENA", desc: "كل round في المنطقة، من pre-seed لـ Series D، مع تفاصيل valuation." },
          { icon: AlertCircle, title: "تغييرات تنظيمية", desc: "قوانين جديدة، تحديثات الجهات (CBE، SAMA، VARA)، تأثيرها على شركتك." },
          { icon: Globe, title: "فرص الشراكة", desc: "tenders حكومية، RFPs، corporate VCs تبحث عن startups." },
          { icon: Activity, title: "حركة المنافسين", desc: "تتبع launches، hires، funding، expansions للمنافسين الرئيسيين." },
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
        <h2 className="text-3xl font-bold text-white mb-6">ما يميزه</h2>
        <ul className="space-y-3">
          <FeatureCheck>تغطية 22 دولة عربية باللغتين (عربي + إنجليزي)</FeatureCheck>
          <FeatureCheck>1000+ مصدر: Wamda، Magnitt، Crunchbase، صحف محلية، LinkedIn</FeatureCheck>
          <FeatureCheck>AI يفلتر noise ويوصل لك ما يخص قطاعك ومرحلتك فقط</FeatureCheck>
          <FeatureCheck>Daily digest عبر email + Slack/Telegram</FeatureCheck>
          <FeatureCheck>{'Custom alerts (مثلاً: "أي funding في fintech مصري > $1M")'}</FeatureCheck>
          <FeatureCheck>تحليل أسبوعي للترندات مع توصيات</FeatureCheck>
        </ul>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-8">
        <h3 className="text-2xl font-bold text-white mb-3">عينة من تنبيهات اليوم</h3>
        <ul className="space-y-3 text-sm text-zinc-300">
          <li>• fintech سعودي (السعر: $1B) أعلن Series C $80M بقيادة STV</li>
          <li>• البنك المركزي المصري أصدر تعليمات جديدة للـ digital wallets</li>
          <li>• Microsoft Egypt تطلق $5M cloud credits للستارت أبس</li>
          <li>• 3 منافسين لك (في edtech) رفعوا total $30M هذا الشهر</li>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
