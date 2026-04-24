import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { CalmCard } from "@/components/ui/CalmCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Activity, TrendingUp, AlertCircle, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "نبض السوق | كلميرون",
  description:
    "نبض السوق: نظام ذكي يراقب التمويلات والتغيّرات التنظيمية وفرص الشراكة في 22 دولة عربية، ويُنبّهك بما يخصّك أنت فقط.",
  alternates: { canonical: "/market-pulse" },
};

const PILLARS = [
  {
    icon: TrendingUp,
    title: "تمويلات منطقتنا",
    description:
      "كل جولة تمويل في المنطقة، من التأسيسية حتى الجولات المتأخّرة، مع تفاصيل التقييم.",
  },
  {
    icon: AlertCircle,
    title: "التغييرات التنظيمية",
    description:
      "قوانين جديدة، تحديثات الجهات الرقابية في بلدك، وتأثيرها المباشر على شركتك.",
  },
  {
    icon: Globe,
    title: "فرص الشراكة",
    description:
      "مناقصات حكومية، طلبات عروض، صناديق شركات كبرى تبحث عن شركات ناشئة.",
  },
  {
    icon: Activity,
    title: "حركة منافسيك",
    description:
      "إطلاقات جديدة، تعيينات، تمويلات، توسّعات — كل ما يفعله منافسوك في مكان واحد.",
  },
];

export default function MarketPulsePage() {
  return (
    <SeoLandingShell
      eyebrow="مراقبة فورية"
      title="نبض السوق"
      description="نظام يراقب أكثر من ألف مصدر يومياً ويُصفّيها لك. تستلم فقط ما يخصّ مرحلتك وقطاعك — لا ضوضاء ولا إغراق بالمعلومات."
      breadcrumbs={[{ label: "نبض السوق" }]}
    >
      <SectionHeader
        eyebrow="الأركان الأربعة"
        title="ما الذي يراقبه كلميرون من أجلك؟"
        description="أربع زوايا تغطّي كل ما يحرّك سوقك."
      />
      <section className="grid md:grid-cols-2 gap-5 mb-20">
        {PILLARS.map((p) => (
          <CalmCard
            key={p.title}
            icon={p.icon}
            title={p.title}
            description={p.description}
          />
        ))}
      </section>

      <SectionHeader
        title="ما يميّز نبض السوق"
        description="ستّ خصائص تحوّله من خلاصة أخبار إلى ميزة تنافسية حقيقية."
      />
      <section className="mb-20">
        <ul className="space-y-3">
          <FeatureCheck>تغطية اثنتين وعشرين دولة عربية بالعربية والإنجليزية.</FeatureCheck>
          <FeatureCheck>أكثر من ألف مصدر: Wamda، Magnitt، Crunchbase، صحف محلية، LinkedIn.</FeatureCheck>
          <FeatureCheck>ذكاء يُصفّي الضوضاء ويُرسل لك ما يخصّ قطاعك ومرحلتك فقط.</FeatureCheck>
          <FeatureCheck>إيجاز يومي عبر البريد + Slack أو Telegram حسب تفضيلك.</FeatureCheck>
          <FeatureCheck>تنبيهات مخصّصة (مثلاً: «أيّ تمويل في القطاع المالي المصري فوق مليون دولار»).</FeatureCheck>
          <FeatureCheck>تحليل أسبوعي للاتجاهات مع توصيات قابلة للتنفيذ.</FeatureCheck>
        </ul>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-8">
        <h3 className="text-2xl font-bold text-white mb-4">عيّنة من تنبيهات اليوم</h3>
        <ul className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <li>• شركة مالية سعودية أعلنت جولة بقيمة 80 مليون دولار بقيادة STV.</li>
          <li>• البنك المركزي المصري أصدر تعليمات جديدة للمحافظ الرقمية.</li>
          <li>• مايكروسوفت مصر تطلق 5 ملايين دولار رصيد سحابي للشركات الناشئة.</li>
          <li>• ثلاثة من منافسيك في قطاع التعليم رفعوا 30 مليون دولار هذا الشهر.</li>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
