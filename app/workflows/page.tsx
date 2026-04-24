import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { CalmCard } from "@/components/ui/CalmCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Workflow, Zap, GitBranch, Repeat } from "lucide-react";

export const metadata: Metadata = {
  title: "مسارات العمل | كلميرون",
  description:
    "مسارات العمل: أكثر من خمسين مساراً جاهزاً يُنسّق عدّة مساعدين أذكياء بنقرة واحدة. من الفكرة إلى النموذج الأوّلي، التمويل، الإطلاق، الامتثال.",
  alternates: { canonical: "/workflows" },
};

const PATHS = [
  { slug: "idea-to-mvp", title: "من الفكرة إلى النموذج الأوّلي", desc: "عشر خطوات: التحقّق، التصميم، اختيار التقنية، تحديد النطاق.", agents: 6 },
  { slug: "fundraise-seed", title: "جمع تمويل تأسيسي", desc: "العرض، قائمة المستثمرين، التواصل، التحضير للفحص النافي للجهالة، التفاوض.", agents: 8 },
  { slug: "product-launch", title: "إطلاق منتج جديد", desc: "التموضع، العلاقات العامّة، يوم الإطلاق، التحسين بعد الإطلاق.", agents: 7 },
  { slug: "compliance-egypt", title: "الامتثال للسوق المصري", desc: "حماية البيانات، الضرائب، التراخيص، عقود الموظّفين.", agents: 5 },
  { slug: "hire-first-engineer", title: "تعيين أوّل مهندس", desc: "وصف الوظيفة، البحث، الفلترة، المقابلات، العرض، التهيئة.", agents: 6 },
  { slug: "saas-pricing", title: "تسعير منتج اشتراكي", desc: "بحث السوق، تصميم الباقات، اختبار الأسعار، الإطلاق.", agents: 4 },
  { slug: "expand-saudi", title: "التوسّع للسعودية", desc: "التأسيس، التعارفات، التعريب، الوصول للسوق، الامتثال.", agents: 9 },
  { slug: "weekly-investor-update", title: "تحديث المستثمرين الأسبوعي", desc: "تجميع المؤشّرات، المكاسب، الطلبات، الصياغة، الإرسال.", agents: 3 },
  { slug: "content-engine", title: "محرّك المحتوى", desc: "بحث المواضيع، المخطّط، الصياغة، التحسين، الجدولة.", agents: 5 },
  { slug: "annual-tax-egypt", title: "الإقرار الضريبي السنوي - مصر", desc: "تجميع السجلّات، الحساب، التقديم، المتابعة.", agents: 4 },
];

const PILLARS = [
  { icon: Workflow, title: "تنسيق متعدّد المساعدين", description: "كل مسار يُنسّق بين 5–10 مساعدين، كلّ واحد متخصّص في خطوة." },
  { icon: Zap, title: "نقرة واحدة", description: "اضغط «شغّل»، أدخل سياقك، استلم النتائج. لا برمجة، لا تعقيد." },
  { icon: GitBranch, title: "قابل للتعديل", description: "يمكنك نسخ أيّ مسار وتعديل خطواته. اصنع نسختك المناسبة لشركتك." },
  { icon: Repeat, title: "متكرّر تلقائياً", description: "جدوِل المسار ليعمل أسبوعياً (مثلاً: تحديث المستثمرين)." },
];

export default function WorkflowsPage() {
  return (
    <SeoLandingShell
      eyebrow={`أكثر من ${PATHS.length} مساراً جاهزاً`}
      title="مسارات العمل"
      description="بدلاً من تشغيل كل مساعد بمفرده، شغّل مساراً كاملاً بنقرة واحدة. كل مسار يُنسّق بين عدّة مساعدين لحلّ مشكلة معقّدة من البداية للنهاية."
      breadcrumbs={[{ label: "مسارات العمل" }]}
    >
      <SectionHeader
        eyebrow="الأركان الأربعة"
        title="لماذا المسارات أقوى من المساعدين الفرديين؟"
        description="أربع مزايا تحوّل العمل المتفرّق إلى منظومة متكاملة."
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
        title="مسارات شائعة"
        description="عشرة مسارات يستخدمها أغلب المؤسّسين. النسخة الكاملة تحوي أكثر من خمسين."
      />
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-4">
          {PATHS.map((w) => (
            <div
              key={w.slug}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2 gap-3">
                <h3 className="text-lg font-semibold text-white leading-tight">{w.title}</h3>
                <span className="text-xs text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-lg whitespace-nowrap">
                  {w.agents} مساعدين
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionHeader title="مزايا المسارات" />
      <section className="mb-12">
        <ul className="space-y-3">
          <FeatureCheck>أكثر من خمسين مساراً جاهزاً للسوق العربي.</FeatureCheck>
          <FeatureCheck>إنشاء مسارات مخصّصة عبر مُنشئ بصري مبسّط.</FeatureCheck>
          <FeatureCheck>جدولة المسارات لتعمل يومياً أو أسبوعياً أو شهرياً.</FeatureCheck>
          <FeatureCheck>محفّزات من خدمات خارجية (Stripe، Slack، البريد).</FeatureCheck>
          <FeatureCheck>منطق شرطي متقدّم (تفرّعات، حلقات، شروط).</FeatureCheck>
          <FeatureCheck>سوق مسارات: شارك مساراتك واستفد من مسارات الآخرين.</FeatureCheck>
        </ul>
      </section>
    </SeoLandingShell>
  );
}
