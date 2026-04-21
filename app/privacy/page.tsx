import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";

export const metadata = {
  title: "سياسة الخصوصية | كلميرون تو",
  description: "سياسة الخصوصية وحماية البيانات الشخصية وفق قانون رقم 151 لسنة 2020",
};

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12 px-4" dir="rtl">
        <h1 className="text-4xl font-bold mb-2 text-[rgb(var(--gold))]">سياسة الخصوصية وحماية البيانات</h1>
        <p className="text-neutral-500 text-sm mb-10">آخر تحديث: أبريل 2026</p>

        <div className="space-y-10 text-neutral-300 leading-relaxed text-sm md:text-base">

          <section className="glass p-8 rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-white">1. التوافق التنظيمي (PDPL & GDPR)</h2>
            <p>
              تلتزم منصة <strong>كلميرون تو</strong> تماماً بأحكام{" "}
              <strong>قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020</strong>{" "}
              ولوائحه التنفيذية المطبّقة منذ 2026، وكذلك اللائحة العامة لحماية البيانات
              الأوروبية (GDPR). نعالج بياناتك على أساس قانوني شفاف يتمثل في موافقتك
              الصريحة وضرورة تقديم الخدمة المتعاقد عليها.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-white">2. البيانات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>بيانات التعريف: الاسم، البريد الإلكتروني، الصورة الشخصية (من Google).</li>
              <li>بيانات الملف الريادي: مرحلة المشروع، المجال، المحافظة.</li>
              <li>بيانات الاستخدام: سجل المحادثات، الأفكار المحلّلة، خطط الأعمال المنشأة.</li>
              <li>بيانات الفوترة: رصيد النقاط، سجل الاشتراكات (دون بيانات بطاقة الائتمان).</li>
              <li>بيانات تقنية: عنوان IP (لتحديد العملة والحدّ من الإساءة)، اللغة.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-white">3. كيف نستخدم بياناتك</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>تخصيص المخرجات الاستراتيجية للوكلاء بناءً على سياق مشروعك.</li>
              <li>تحسين أداء المنصة ونماذج الذكاء الاصطناعي الداخلية فقط.</li>
              <li>إرسال إشعارات خدمية (لا تسويقية) تتعلق بالاشتراك والرصيد.</li>
              <li><strong>لا نبيع بياناتك لأي طرف ثالث في أي حال من الأحوال.</strong></li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-white">4. حقوق المستخدم (وفق قانون 151)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>حق الوصول:</strong> طلب نسخة كاملة من بياناتك في أي وقت.</li>
              <li><strong>حق التصحيح:</strong> تعديل بياناتك الشخصية من صفحة الملف الشخصي.</li>
              <li><strong>حق النسيان (الحذف):</strong> طلب المسح الكامل لجميع بياناتك.</li>
              <li><strong>حق الاعتراض:</strong> الاعتراض على أي معالجة غير ضرورية لبياناتك.</li>
            </ul>
          </section>

          <section className="glass p-8 rounded-3xl space-y-3 border border-[rgb(var(--gold))]/20">
            <h2 className="text-2xl font-semibold text-white">5. آلية طلب حذف البيانات (حق النسيان)</h2>
            <p>
              يمكنك طلب الحذف الكامل لحسابك وجميع بياناتك المرتبطة به بطريقتين:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>من لوحة التحكم:</strong>{" "}
                <Link href="/profile" className="text-[rgb(var(--gold))] hover:underline">
                  صفحة الإعدادات والملف الشخصي ← زر &quot;حذف حسابي (الحق في النسيان)&quot;
                </Link>
                . يتم تنفيذ الحذف فوراً.
              </li>
              <li>
                <strong>عبر البريد الإلكتروني:</strong> أرسل طلبك إلى{" "}
                <a href="mailto:privacy@kalmeron.ai" className="text-[rgb(var(--gold))] hover:underline">
                  privacy@kalmeron.ai
                </a>{" "}
                مع ذكر عنوان البريد المرتبط بحسابك. سنستجيب خلال <strong>48 ساعة</strong>.
              </li>
            </ol>
            <p className="text-neutral-500 text-sm">
              * يشمل الحذف: بيانات الملف الشخصي، سجل المحادثات، الأفكار، خطط الأعمال،
              الذاكرة الريادية، وسجلات الفوترة، مع الاحتفاظ بما يقتضيه القانون لمدة لا تتجاوز 90 يوماً.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-white">6. الذاكرة والذكاء الاصطناعي</h2>
            <p>
              نقوم بتخزين &quot;ذاكرة عرضية&quot; لفهم تفضيلاتك وتجاربك السابقة لتحسين المخرجات
              الاستراتيجية. هذه الذاكرة مشفرة كلياً (AES-256) ولا تُستخدم لتدريب نماذج
              عامة لدى أي طرف ثالث.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-white">7. التواصل بشأن الخصوصية</h2>
            <p>
              لأي استفسارات تتعلق بخصوصيتك وبياناتك، يمكنك التواصل مع مسؤول حماية
              البيانات لدينا عبر:{" "}
              <a href="mailto:privacy@kalmeron.ai" className="text-[rgb(var(--gold))] hover:underline">
                privacy@kalmeron.ai
              </a>
            </p>
          </section>

        </div>
      </div>
    </AppShell>
  );
}
