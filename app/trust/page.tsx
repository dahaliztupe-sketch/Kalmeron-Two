/**
 * Trust Center — public page that surfaces our security posture so prospects
 * and procurement teams can vet Kalmeron without an NDA.
 *
 * Sources:
 *  - docs/THREAT_MODEL.md (controls)
 *  - docs/SLO.md (uptime targets)
 *  - docs/RUNBOOK.md (incident response)
 *  - security_spec.md (compliance posture)
 *
 * Static content is intentional — this page is part of the legal surface
 * area and changes should be reviewed.
 */
import Link from 'next/link';
import { PublicShell } from '@/components/layout/PublicShell';

export const metadata = {
  title: 'مركز الثقة — كلميرون',
  description: 'مركز ثقة كلميرون: ما نفعله لحماية بياناتك وما لم نتحقق منه بعد. بلا تدقيق أمان أو امتثال مستقل حتى الآن.',
};

interface Control {
  title: string;
  desc: string;
}

const dataControls: Control[] = [
  { title: 'تشفير البيانات أثناء النقل', desc: 'الاتصال عبر HTTPS من مزوّد الاستضافة، مع ترويسة HSTS (سنتان، includeSubDomains، preload) في إعدادات التطبيق.' },
  { title: 'تشفير البيانات في الراحة', desc: 'التشفير في السكون افتراضي لدى Google Cloud بحسب وثائقها، والمفاتيح يديرها المزوّد. لم نتحقق من ذلك بتدقيق مستقل.' },
  { title: 'فصل البيانات', desc: 'قواعد Firestore ترفض الوصول المباشر من المتصفح، والوصول يتم عبر الخادم فقط. لم يُجرَ اختبار اختراق مستقل للعزل بين الحسابات.' },
  { title: 'النسخ الاحتياطي المجدول — قيد التفعيل', desc: 'بنية النسخ اليومي جاهزة (تصدير Firestore إلى تخزين سحابي معزول) وتُفعَّل على بيئة الإنتاج قبل الإطلاق العام.' },
];

const accessControls: Control[] = [
  { title: 'مصادقة قوية', desc: 'Firebase Auth مع التحقق من البريد، ودعم TOTP لأدوار المسؤولين.' },
  { title: 'صلاحيات قائمة على الدور (RBAC)', desc: 'أدوار: owner / admin / member / viewer مع تحقّق على الخادم لكل طلب.' },
  { title: 'مفاتيح API محدودة الصلاحيات', desc: 'مفاتيح موقّعة، قابلة للإلغاء، مع تتبُّع آخر استخدام، ولا تظهر القيمة بعد إنشائها. الواجهة الذاتية لإدارتها من لوحة التحكم قيد الإطلاق.' },
  { title: 'سجل تدقيق غير قابل للتعديل', desc: 'تغييرات الحساب تُسجَّل في `audit_logs` عبر الخادم. لا نضمن عدم قابلية السجل للتعديل.' },
];

const aiControls: Control[] = [
  { title: 'Prompt Injection Defense', desc: 'توجد طبقات حماية جزئية في الكود (فحص المدخلات وعزل السياق). لا تمنع كل الهجمات ولم تُختبر بشكل مستقل.' },
  { title: 'حدود التكلفة لكل عميل', desc: 'سقف يومي مطبّق على التحليل التجريبي للضيوف. لا نعد بسقوف مماثلة على كل الواجهات الأخرى.' },
  { title: 'تتبُّع الاستهلاك الشفّاف', desc: 'كل استدعاء نموذج يُسجَّل بالتكلفة والمصدر، ويظهر في لوحة التكاليف للحساب.' },
];

const compliance: Control[] = [
  { title: 'تصدير الحساب وحذفه', desc: 'توجد واجهات `/api/account/export` و`/api/account/delete`. لا ندّعي الامتثال الكامل للائحة GDPR.' },
  { title: 'PDPL مصر', desc: 'نعمل على مواءمة ممارساتنا مع القانون 151/2020 ولائحته التنفيذية. لم يُجرَ تدقيق امتثال، ولم نتحقق من مكان استضافة البيانات.' },
  { title: 'سجل الموافقات', desc: 'يوجد منطق لتسجيل الموافقات في الكود. لم نراجع اكتماله بعد.' },
  { title: 'استجابة الحوادث', desc: 'لا توجد خطة استجابة للحوادث موثقة أو متفق على مهلها حتى الآن.' },
];

function Section({ title, items }: { title: string; items: Control[] }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((c) => (
          <div key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-semibold text-white mb-2">{c.title}</h3>
            <p className="text-neutral-300 text-sm leading-7">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TrustCenter() {
  return (
    <PublicShell>
      <div dir="rtl" className="max-w-5xl mx-auto p-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">مركز الثقة</h1>
          <p className="text-neutral-400 max-w-2xl leading-8">
            كلميرون نظام تشغيل عربي للمشاريع الناشئة، نتعامل مع بيانات حسّاسة لرواد الأعمال:
            خطط، عقود، تواصل عملاء. هذه الصفحة تصف ما نفعله وما لم نتحقق منه بعد. لا يوجد تدقيق أمان أو امتثال مستقل، ولا شهادات.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link href="/status" className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition">حالة المنصّة الآن →</Link>
          <a href="/api-docs" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">وثائق الـ API</a>
        </div>

        <Section title="حماية البيانات" items={dataControls} />
        <Section title="التحكّم في الوصول" items={accessControls} />
        <Section title="أمان مساعدي الذكاء الاصطناعي" items={aiControls} />
        <Section title="الامتثال والخصوصية" items={compliance} />

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mt-8">
          <h2 className="text-xl font-bold mb-3">إفصاح المسؤول للثغرات</h2>
          <p className="text-neutral-300 text-sm leading-7">
            للإبلاغ عن ثغرة أمنية راسلنا عبر صفحة التواصل. لا نعد بمهلة استجابة محددة.
          </p>
        </section>

        <div className="mt-12 text-sm text-neutral-400">
          آخر مراجعة لهذه الصفحة: 26 نوفمبر 2026
        </div>
      </div>
    </PublicShell>
  );
}
