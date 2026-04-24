import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { CalmCard } from "@/components/ui/CalmCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Users, Handshake, Coffee, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "مجلس المؤسّسين | كلميرون",
  description:
    "مجلس المؤسّسين: مجتمع حصري لخمسة آلاف مؤسّس عربي. تعارفات ذكية، حلقات عمل صغيرة، نقاشات صريحة، وفرص شراكة حقيقية.",
  alternates: { canonical: "/founder-network" },
};

const PILLARS = [
  {
    icon: Users,
    title: "أكثر من 5000 مؤسّس",
    description:
      "من اثنتين وعشرين دولة عربية، عبر عشرين قطاعاً، من المرحلة التأسيسية حتى المتقدّمة.",
  },
  {
    icon: Handshake,
    title: "تعارفات ذكية",
    description:
      "يحلّل كلميرون تحدّيك ويربطك بثلاثة مؤسّسين تجاوزوا المشكلة نفسها.",
  },
  {
    icon: Coffee,
    title: "حلقات عمل صغيرة",
    description:
      "مجموعات من ثمانية مؤسّسين متشابهين في المرحلة، تجتمع شهرياً لتبادل الخبرات.",
  },
  {
    icon: MessageCircle,
    title: "منتدى خاصّ",
    description:
      "نقاشات صريحة عن التمويل والتوظيف والإخفاقات — بعيداً عن واجهات الإعلام.",
  },
];

export default function FounderNetworkPage() {
  return (
    <SeoLandingShell
      eyebrow="مجتمع حصري"
      title="مجلس المؤسّسين"
      description="أكبر تجمّع للمؤسّسين العرب. كلميرون يربطك بمن خاض تحدّيك بالفعل، ويفتح أمامك أبواب التعلّم النظير لنظير."
      breadcrumbs={[{ label: "مجلس المؤسّسين" }]}
    >
      <SectionHeader
        eyebrow="الأركان الأربعة"
        title="ما يميّز مجلس المؤسّسين"
        description="أربعة عناصر تجعل هذا المجتمع مختلفاً عن أيّ شبكة أخرى."
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
        title="ما تحصل عليه شهرياً"
        description="ستّ مزايا ملموسة تُضاف لاشتراكك."
      />
      <section className="mb-20">
        <ul className="space-y-3">
          <FeatureCheck>ثلاث تعارفات شهرياً مع مؤسّسين خبروا تحدّيك.</FeatureCheck>
          <FeatureCheck>حلقة عمل من ثمانية مؤسّسين متشابهين في مرحلتك.</FeatureCheck>
          <FeatureCheck>لقاءات افتراضية شهرية مع مؤسّسين بارزين.</FeatureCheck>
          <FeatureCheck>لقاءات حضورية فصلية في القاهرة والرياض ودبي.</FeatureCheck>
          <FeatureCheck>قنوات خاصّة حسب القطاع (مالي، تعليمي، صحي، إلخ).</FeatureCheck>
          <FeatureCheck>لوحة وظائف: وظّف من شبكة المؤسّسين قبل المنصّات العامّة.</FeatureCheck>
        </ul>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-8 mb-12">
        <h3 className="text-2xl font-bold text-white mb-4">شروط الانضمام</h3>
        <p className="text-zinc-300 mb-4 leading-relaxed">
          المجلس انتقائي بطبعه لضمان جودة النقاشات. نقبل المؤسّسين والشركاء المؤسّسين النشطين فقط:
        </p>
        <ul className="space-y-2 text-sm text-zinc-400 leading-relaxed">
          <li>• مؤسّس أو شريك مؤسّس لشركة نشطة (إيرادات أو زخم قابل للقياس).</li>
          <li>• مقيم في المنطقة العربية أو يبني للسوق العربي.</li>
          <li>• مستعدّ للمشاركة بصدق ومبدأ «ما تعطيه قبل ما تأخذه».</li>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
