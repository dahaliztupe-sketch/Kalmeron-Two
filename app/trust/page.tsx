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
  title: 'مركز الثقة — كالميرون',
  description: 'الأمن، الخصوصية، والامتثال في منصّة كالميرون.',
};

interface Control {
  title: string;
  desc: string;
}

const dataControls: Control[] = [
  { title: 'تشفير البيانات أثناء النقل', desc: 'TLS 1.2+ مفروض على كل نقاط النهاية، مع HSTS preload لمدة سنتين.' },
  { title: 'تشفير البيانات في الراحة', desc: 'AES-256 افتراضي في Firestore وGCS، مفاتيح يديرها مزوّد السحابة.' },
  { title: 'فصل البيانات', desc: 'كل عميل في workspace معزول، وقواعد Firestore تمنع التسرُّب بين العملاء.' },
  { title: 'النسخ الاحتياطي اليومي', desc: 'نسخة كاملة كل 24 ساعة، احتفاظ 30 يومًا، مع تمرين استرجاع شهري.' },
];

const accessControls: Control[] = [
  { title: 'مصادقة قوية', desc: 'Firebase Auth مع التحقق من البريد، ودعم TOTP لأدوار المسؤولين.' },
  { title: 'صلاحيات قائمة على الدور (RBAC)', desc: 'أدوار: owner / admin / editor / viewer مع تحقّق على الخادم لكل طلب.' },
  { title: 'مفاتيح API محدودة الصلاحيات', desc: 'مفاتيح موقّعة، قابلة للإلغاء، مع تتبُّع آخر استخدام، ولا تظهر القيمة بعد إنشائها.' },
  { title: 'سجل تدقيق غير قابل للتعديل', desc: 'كل تغيير على الحساب يُكتب في `audit_logs` ولا يمكن تعديله أو حذفه.' },
];

const aiControls: Control[] = [
  { title: 'Prompt Injection Defense', desc: 'تنظيف المدخلات، عزل سياق المستخدم عن تعليمات النظام، رفض الأوامر الحرجة من المحتوى.' },
  { title: 'حدود التكلفة لكل عميل', desc: 'سقوف يومية وشهرية مع إنذار مبكر، وإيقاف تلقائي عند تجاوز السقف الصلب.' },
  { title: 'Red-Team يومي', desc: 'مهمة مجدوَلة تختبر كل مساعد بمحفّزات هجومية معروفة وترفع تذكرة عند أي اختراق.' },
  { title: 'تتبُّع الاستهلاك الشفّاف', desc: 'كل استدعاء نموذج يُسجَّل بالتكلفة والمصدر، ويظهر في لوحة التكاليف للحساب.' },
];

const compliance: Control[] = [
  { title: 'GDPR', desc: 'حق التصدير عبر `/api/account/export`، حق المحو عبر `/api/account/delete` بمهلة 30 يومًا.' },
  { title: 'PDPL مصر', desc: 'استضافة بيانات أساسية في المنطقة، والتوافق مع مبادئ القانون 151/2020.' },
  { title: 'سجل الموافقات', desc: 'كل موافقة تُسجَّل بنسخة السياسة، الزمن، والمصدر، وأي سحب يُكتب كحدث جديد (append-only).' },
  { title: 'استجابة الحوادث', desc: 'دليل عمل عام للحوادث وقنوات تواصل واضحة، مع تقييم أثر خلال 72 ساعة كحد أقصى.' },
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
            كالميرون نظام تشغيل عربي للمشاريع الناشئة، نتعامل مع بيانات حسّاسة لرواد الأعمال:
            خطط، عقود، تواصل عملاء. هذه الصفحة تشرح بإيجاز كيف نحمي تلك البيانات.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link href="/status" className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition">حالة المنصّة الآن →</Link>
          <a href="mailto:security@kalmeron.com" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">الإبلاغ عن ثغرة</a>
          <a href="/api-docs" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">وثائق الـ API</a>
        </div>

        <Section title="حماية البيانات" items={dataControls} />
        <Section title="التحكّم في الوصول" items={accessControls} />
        <Section title="أمان مساعدي الذكاء الاصطناعي" items={aiControls} />
        <Section title="الامتثال والخصوصية" items={compliance} />

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mt-8">
          <h2 className="text-xl font-bold mb-3">إفصاح المسؤول للثغرات</h2>
          <p className="text-neutral-300 text-sm leading-7">
            نُرحّب بأي بلاغات أمنية على{' '}
            <a className="underline" href="mailto:security@kalmeron.com">security@kalmeron.com</a>.
            نلتزم بالردّ خلال 48 ساعة عمل، وبتقديم خطة معالجة خلال 7 أيام للثغرات الحرجة.
            نمتنع عن الملاحقة القانونية لأي باحث أمني يلتزم بسياسة الإفصاح المسؤول.
          </p>
        </section>

        <div className="mt-12 text-sm text-neutral-500">
          آخر مراجعة لهذه الصفحة: 24 أبريل 2026
        </div>
      </div>
    </PublicShell>
  );
}
