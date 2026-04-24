/**
 * Public status page — surfaces the latest health-probe results so customers
 * can self-serve "is Kalmeron down?" without contacting support.
 *
 * Reads `_health/probe-summary` written by `/api/cron/health-probe`.
 */
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 30;

interface ProbeSummary {
  updatedAt?: { toMillis?: () => number } | null;
  status?: 'ok' | 'degraded' | 'down';
  checks?: Record<string, string>;
  windowMinutes?: number;
  uptimePct?: number;
}

async function loadSummary(): Promise<ProbeSummary | null> {
  try {
    const doc = await adminDb.collection('_health').doc('probe-summary').get();
    if (!doc.exists) return null;
    return doc.data() as ProbeSummary;
  } catch {
    return null;
  }
}

function pillColor(state: string): string {
  if (state === 'ok' || state === 'connected' || state === 'operational') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (state === 'degraded' || state === 'unconfigured') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
}

function labelAr(key: string): string {
  const map: Record<string, string> = {
    firestore: 'قاعدة البيانات',
    knowledgeGraph: 'الرسم المعرفي',
    learningLoop: 'حلقة التعلّم',
    virtualMeeting: 'الاجتماعات الافتراضية',
    launchpad: 'منصّة الإطلاق',
    expertFactory: 'مصنع الخبراء',
    virtualOffice: 'المكتب الافتراضي',
    whatsapp: 'واتساب',
    telegram: 'تيليجرام',
    email: 'البريد الإلكتروني',
    cron: 'المهام المجدوَلة',
    firebaseAdmin: 'Firebase Admin',
  };
  return map[key] ?? key;
}

export default async function StatusPage() {
  const summary = await loadSummary();
  const overall: 'ok' | 'degraded' | 'down' = summary?.status ?? 'degraded';
  const checks = summary?.checks ?? {};
  const updated = summary?.updatedAt?.toMillis?.()
    ? new Date(summary.updatedAt.toMillis!()).toLocaleString('ar-EG')
    : 'لم يتم القياس بعد';

  const headlineAr =
    overall === 'ok' ? 'كل الأنظمة تعمل بشكل طبيعي'
    : overall === 'degraded' ? 'بعض الخدمات تعمل بأداء منخفض'
    : 'يوجد عُطل عام';

  return (
    <main dir="rtl" className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">حالة منصّة كالميرون</h1>
        <p className="text-neutral-400 mb-8">آخر تحديث: {updated}</p>

        <div className={`rounded-2xl border p-6 mb-8 ${pillColor(overall)}`}>
          <div className="text-2xl font-bold">{headlineAr}</div>
          {typeof summary?.uptimePct === 'number' && (
            <div className="text-sm mt-2 opacity-80">
              نسبة الجاهزية خلال آخر {summary.windowMinutes ?? 60} دقيقة: {summary.uptimePct.toFixed(2)}%
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">الخدمات</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(checks).length === 0 && (
            <div className="text-neutral-500 text-sm col-span-full">
              لم يصل أي قياس بعد. سيظهر التفصيل خلال دقائق من تشغيل المهام المجدوَلة.
            </div>
          )}
          {Object.entries(checks).map(([k, v]) => (
            <div key={k} className={`rounded-xl border p-4 flex items-center justify-between ${pillColor(String(v))}`}>
              <span className="font-medium">{labelAr(k)}</span>
              <span className="text-xs uppercase tracking-wider opacity-80">{String(v)}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 text-sm text-neutral-500 leading-7">
          <p>
            هذه الصفحة تُحدَّث تلقائيًا كل 5 دقائق من مهمّة فحص داخلية.
            للحوادث الكبرى، يرجى مراجعة <a href="/trust" className="underline hover:text-white">مركز الثقة</a>{' '}
            أو التواصل عبر البريد <a href="mailto:status@kalmeron.com" className="underline hover:text-white">status@kalmeron.com</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
