import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { CalmCard } from "@/components/ui/CalmCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Presentation, BarChart3, Users, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "مُنشئ عرض المستثمرين | كلميرون",
  description:
    "مُنشئ عرض المستثمرين: من فكرة إلى عرض احترافي بمعايير عالمية في عشر دقائق. مخصّص لمستثمري المنطقة، مدعوم ببيانات شركتك الفعلية.",
  alternates: { canonical: "/investor-deck" },
};

const PILLARS = [
  {
    icon: Presentation,
    title: "اثنتا عشرة شريحة قياسية",
    description:
      "مبنيّة على معايير Sequoia و a16z و Y Combinator. كل شريحة بطريقة أثبتت فعاليّتها.",
  },
  {
    icon: BarChart3,
    title: "متّصل ببياناتك الحقيقية",
    description:
      "يجلب أرقامك من Stripe و Mixpanel و QuickBooks مباشرة — بدون نسخ ولصق.",
  },
  {
    icon: Users,
    title: "مخصّص لكل مستثمر",
    description:
      "نسخة لـ Algebra، نسخة لـ STV، نسخة لـ 500 Global. التخصيص يتمّ تلقائياً.",
  },
  {
    icon: Sparkles,
    title: "يتحدّث ذاتياً",
    description:
      "كلّما تغيّرت أرقامك، يتحدّث العرض من تلقاء نفسه. لا نسخة قديمة بعد اليوم.",
  },
];

const SLIDES = [
  "الافتتاحية",
  "المشكلة",
  "الحلّ",
  "حجم السوق (TAM/SAM/SOM)",
  "عرض المنتج",
  "الزخم والإنجازات",
  "نموذج العمل",
  "خطّة الوصول للسوق",
  "المنافسون",
  "الفريق",
  "البيانات المالية والطلب",
  "الرؤية والخاتمة",
];

export default function InvestorDeckPage() {
  return (
    <SeoLandingShell
      eyebrow="ميزة محورية"
      title="مُنشئ عرض المستثمرين"
      description="من فكرة خام إلى عرض جاهز للمستثمرين بمعايير عالمية في عشر دقائق. مفصّل على ذوق مستثمري المنطقة، ومدعوم بأرقام شركتك الفعلية."
      breadcrumbs={[{ label: "مُنشئ عرض المستثمرين" }]}
    >
      <SectionHeader
        eyebrow="الأركان الأربعة"
        title="ما الذي يميّز هذا المُنشئ؟"
        description="أربعة فروق جوهرية بينه وبين قوالب العروض التقليدية."
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
        title="الشرائح الاثنتا عشرة"
        description="هيكل معتمد عالمياً، مرتّب بطريقة تجذب المستثمر من أوّل دقيقة."
      />
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-3">
          {SLIDES.map((s, i) => (
            <div
              key={s}
              className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-zinc-300">{s}</span>
            </div>
          ))}
        </div>
      </section>

      <SectionHeader
        title="ما تحصل عليه"
        description="ستّ مخرجات جاهزة للإرسال للمستثمرين فوراً."
      />
      <section className="mb-12">
        <ul className="space-y-3">
          <FeatureCheck>تصدير بصيغة PowerPoint و PDF و Google Slides.</FeatureCheck>
          <FeatureCheck>نسختان تلقائياً: عربية وإنجليزية.</FeatureCheck>
          <FeatureCheck>ملاحظات للمتحدّث مع كل شريحة (ما تقول، وما تتجنّب).</FeatureCheck>
          <FeatureCheck>ملحق أسئلة وأجوبة: ثلاثون سؤالاً متوقّعاً مع إجاباتك.</FeatureCheck>
          <FeatureCheck>متابعة المستثمرين: من شاهد العرض، متى، وما الملاحظات.</FeatureCheck>
          <FeatureCheck>قائمة بأكثر من مئتي صندوق استثمار في المنطقة مع جهات الاتصال.</FeatureCheck>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
