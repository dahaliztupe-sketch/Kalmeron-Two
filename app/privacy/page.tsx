import { AppShell } from "@/components/layout/AppShell";

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12 px-4" dir="rtl">
        <h1 className="text-4xl font-bold mb-8 text-[rgb(var(--gold))]">سياسة الخصوصية وحماية البيانات</h1>
        <div className="space-y-8 text-neutral-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. التوافق التنظيمي (PDPL & GDPR)</h2>
            <p>تلتزم منصة Kalmeron Two تماماً بقانون حماية البيانات الشخصية المصري (رقم 151 لسنة 2020) المطبق فعلياً منذ 2026، وكذلك اللائحة العامة لحماية البيانات في الاتحاد الأوروبي (GDPR). نعالج بياناتك بأساس قانوني شفاف يعتمد على موافقتك الصريحة و تقديم الخدمة.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. حقوق المستخدم (حق النسيان)</h2>
            <p>لكامل الحق في الوصول إلى بياناتك الشخصية، تصحيحها، والمطالبة القطعية بحذفها (حق النسيان). عبر لوحة التحكم، يمكنك طلب الحذف النهائي، والذي سيشمل محو هويتك، سجلات الدردشة، وتقارير الأعمال من مستودعاتنا في غضون 48 ساعة.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. الذاكرة والذكاء الاصطناعي</h2>
            <p>نقوم بتخزين &quot;ذاكرة عرضية&quot; لفهم تفضيلاتك وتجاربك السابقة (النجاحات والإخفاقات) لتحسين المخرجات الاستراتيجية. هذه الذاكرة مشفرة كلياً ولا تستخدم لتدريب النماذج العامة لجهة خارجية.</p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
