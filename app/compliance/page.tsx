import { AppShell } from "@/components/layout/AppShell";

export default function CompliancePage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12 px-4" dir="rtl">
        <h1 className="text-4xl font-bold mb-8 text-[rgb(var(--gold))]">الامتثال التنظيمي (Regional Compliance)</h1>
        <p className="text-neutral-300 mb-8">نعمل في Kalmeron AI على مواءمة عملياتنا التقنية والقانونية مع أعلى المعايير التنظيمية في منطقة الشرق الأوسط وشمال أفريقيا (MENA).</p>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-2xl font-semibold mb-4 text-white">المملكة العربية السعودية (CST)</h2>
            <p className="text-neutral-400">نلتزم بمتطلبات هيئة الاتصالات والفضاء والتقنية لحماية وتوطين البيانات، مما يضمن أمان معلومات رواد الأعمال ويتماشى مع المعايير الرقمية لـ رؤية 2030.</p>
          </div>
          
          <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-2xl font-semibold mb-4 text-white">الإمارات العربية المتحدة (TDRA)</h2>
            <p className="text-neutral-400">متوافقون تماماً مع ضوابط هيئة تنظيم الاتصالات والحكومة الرقمية الشاملة لحماية بيانات المنصات الرقمية، مدعومة بخوادم إقليمية (Multi-Region) في دبي لتقليل زمن الاستجابة.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
