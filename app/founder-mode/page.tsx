import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { CalmCard } from "@/components/ui/CalmCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Brain, Zap, Target, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "وضع التركيز | كلميرون",
  description:
    "وضع التركيز: شاشة واحدة تجمع كل أدواتك. مساعد ذكي يفهم سياقك، يتذكّر أهدافك، ويقترح خطوتك التالية قبل أن تطلبها.",
  alternates: { canonical: "/founder-mode" },
};

const PILLARS = [
  {
    icon: Brain,
    title: "ذاكرة شركتك الجامعة",
    description:
      "يحتفظ بكل سياق: المنتج، المستثمرون، الفريق، الأهداف. لا تشرح نفسك مرّتين.",
  },
  {
    icon: Zap,
    title: "اقتراحات استباقية",
    description:
      "يقترح الخطوة التالية قبل أن تسأل. تنبيهات لمدّة سيولتك، للمواعيد الحرجة، للفرص.",
  },
  {
    icon: Target,
    title: "متّسق مع أهدافك",
    description:
      "كل اقتراح مربوط بأهدافك الفصلية. لا توصيات عشوائية، فقط ما يخدم تقدّمك.",
  },
  {
    icon: Compass,
    title: "إيجاز يومي",
    description:
      "تقرير صباحي شخصي: ما يحتاج انتباهك اليوم، ما تأخّر، وأين تكمن فرصتك.",
  },
];

const STEPS = [
  "أدخل سياق شركتك مرّة واحدة: الفكرة، المرحلة، الفريق، التمويل.",
  "يبني كلميرون «دماغ شركتك» — معرفة موحّدة عن مشروعك بأكمله.",
  "كل صباح، تستلم إيجازاً شخصياً: أولوياتك، عوائقك، مكاسبك.",
  "خلال يومك، يقترح كلميرون الخطوة التالية ويتابع تقدّمك بهدوء.",
  "أسبوعياً، تصلك مراجعة عميقة مع استنتاجات قابلة للتنفيذ.",
];

export default function FounderModePage() {
  return (
    <SeoLandingShell
      eyebrow="ميزة محورية"
      title="وضع التركيز"
      description="بدلاً من خمسين نافذة مفتوحة، شاشة واحدة. مساعد يفهم شركتك، يتذكّر أهدافك، ويعمل بصمت ليجعل يومك أبسط."
      breadcrumbs={[{ label: "وضع التركيز" }]}
    >
      <SectionHeader
        eyebrow="الأركان الأربعة"
        title="ما الذي يجعل وضع التركيز مختلفاً؟"
        description="أربعة مبادئ تحوّل لوحة التحكّم من أداة إلى رفيق عمل حقيقي."
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

      <SectionHeader title="كيف يعمل؟" description="خمس خطوات بسيطة من الإعداد إلى الاعتياد." />
      <section className="mb-20">
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-2xl bg-white/[0.03] border border-white/10 p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-zinc-300 pt-1.5 leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <SectionHeader
        title="ماذا يفعل لك يومياً؟"
        description="ست مهام صامتة يقوم بها كلميرون من أجلك."
      />
      <section className="mb-12">
        <ul className="space-y-3">
          <FeatureCheck>تذكير بالمواعيد الحرجة (الامتثال، الضرائب، تحديثات المستثمرين).</FeatureCheck>
          <FeatureCheck>تنبيه عند نزول مدّة سيولتك تحت تسعة أشهر — مع خطّة تمويل مقترحة.</FeatureCheck>
          <FeatureCheck>تحليل أسبوعي لاستخدام منتجك مع توصيات ملموسة.</FeatureCheck>
          <FeatureCheck>صياغة تحديثات منتظمة للمستثمرين تلقائياً.</FeatureCheck>
          <FeatureCheck>متابعة أداء كل قسم مقارنةً بأهدافك الفصلية.</FeatureCheck>
          <FeatureCheck>اكتشاف فرص شراكات وفعاليات ومناقصات تناسب قطاعك.</FeatureCheck>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
