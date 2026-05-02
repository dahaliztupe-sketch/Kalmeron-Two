/**
 * GET /api/investor
 * Investor dashboard metrics — aggregates platform KPIs, health scores,
 * and key business metrics for the investor-facing board view.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function softAuth(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return dec.uid || null;
  } catch {
    return null;
  }
}

interface PlatformMetrics {
  totalAgentsRegistered: number;
  demoReadyAgents: number;
  betaAgents: number;
  supportedLanguages: string[];
  targetMarkets: string[];
  sidecars: number;
  llmProviders: string[];
  defaultDailyBudgetUsd: number;
  observabilityStack: string[];
  complianceModules: string[];
}

function buildPlatformMetrics(): PlatformMetrics {
  return {
    totalAgentsRegistered: 57,
    demoReadyAgents: 12,
    betaAgents: 45,
    supportedLanguages: ['ar', 'en'],
    targetMarkets: ['مصر', 'السعودية', 'الإمارات', 'المغرب', 'الأردن'],
    sidecars: 5,
    llmProviders: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash'],
    defaultDailyBudgetUsd: 5,
    observabilityStack: ['Firestore', 'Edge Analytics', 'LLM Judge'],
    complianceModules: ['PII Redactor', 'Rate Limiting', 'RBAC', 'Audit Log'],
  };
}

const DEMO_AGENTS = [
  { slug: 'idea-validator',      displayNameAr: 'محلل الأفكار',        pitchAr: 'يقيّم الأفكار بإطار علمي من 12 معياراً',     readiness: 'ready', order: 1, href: '/ideas/analyze' },
  { slug: 'plan-builder',        displayNameAr: 'بانٍ خطط العمل',     pitchAr: 'يولّد خطة عمل كاملة مخصصة للسوق العربي',   readiness: 'ready', order: 2, href: '/chat' },
  { slug: 'mistake-shield',      displayNameAr: 'درع الأخطاء القاتلة', pitchAr: 'يكشف الأخطاء القاتلة الشائعة قبل وقوعها', readiness: 'ready', order: 3, href: '/chat' },
  { slug: 'opportunity-radar',   displayNameAr: 'رادار الفرص',         pitchAr: 'يرصد فرص التمويل والفعاليات في MENA',       readiness: 'ready', order: 4, href: '/opportunities' },
  { slug: 'cfo-agent',           displayNameAr: 'المستشار المالي',     pitchAr: 'تحليل مالي عميق مع نموذج EgyptCalc',       readiness: 'ready', order: 5, href: '/cash-runway' },
  { slug: 'market-lab',          displayNameAr: 'مختبر السوق',         pitchAr: 'اختبر فرضياتك مع شخصيات عملاء افتراضية',  readiness: 'ready', order: 6, href: '/market-lab' },
  { slug: 'legal-guide',         displayNameAr: 'المستشار القانوني',   pitchAr: 'قانون الشركات المصري وعقود المؤسسين',      readiness: 'ready', order: 7, href: '/chat' },
  { slug: 'brand-voice',         displayNameAr: 'صوت العلامة التجارية','pitchAr': 'يبني هوية صوتية متسقة عبر القنوات',      readiness: 'ready', order: 8, href: '/brand-voice' },
  { slug: 'daily-brief',         displayNameAr: 'إيجاز الصباح',       pitchAr: 'تقرير يومي ذكي في 5 دقائق',                readiness: 'ready', order: 9, href: '/daily-brief' },
  { slug: 'okr-agent',           displayNameAr: 'مدير OKR',            pitchAr: 'يولّد أهداف أسبوعية قابلة للقياس',         readiness: 'ready', order: 10, href: '/okr' },
  { slug: 'company-builder',     displayNameAr: 'محاكي الشركات',       pitchAr: 'يبني شركة افتراضية كاملة بوكلاء متخصصين', readiness: 'ready', order: 11, href: '/company-builder' },
  { slug: 'launchpad',           displayNameAr: 'منصة الإطلاق',        pitchAr: 'تحوّل الفكرة إلى خطة إطلاق كاملة',         readiness: 'ready', order: 12, href: '/launchpad' },
];

const SIDECARS = [
  { name: 'PDF Worker', role: 'تحليل المستندات وراف', critical: true },
  { name: 'Embeddings Worker', role: 'توليد التمثيلات الدلالية', critical: true },
  { name: 'LLM Judge', role: 'تقييم جودة المخرجات', critical: false },
  { name: 'Egypt Calc', role: 'حسابات الضرائب والتكاليف المصرية', critical: false },
];

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await softAuth(req);

  // Pull live user stats from Firestore if available
  let activeUsers = 0;
  let totalCompanies = 0;
  let totalOKRs = 0;
  let totalChats = 0;

  if (adminDb?.collection && userId) {
    try {
      const [companiesSnap, okrsSnap] = await Promise.allSettled([
        adminDb.collection('companies').where('ownerId', '==', userId).count().get(),
        adminDb.collection('okrs').where('userId', '==', userId).count().get(),
      ]);

      if (companiesSnap.status === 'fulfilled') {
        totalCompanies = companiesSnap.value.data().count;
      }
      if (okrsSnap.status === 'fulfilled') {
        totalOKRs = okrsSnap.value.data().count;
      }
    } catch { /* best-effort */ }
  }

  const platform = buildPlatformMetrics();

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    platform,
    demoPath: DEMO_AGENTS,
    sidecars: SIDECARS,
    userMetrics: userId ? {
      activeUsers,
      totalCompanies,
      totalOKRs,
      totalChats,
    } : null,
    traction: {
      tam: '6M+ رائد أعمال في MENA',
      ttfv: '< 5 دقائق من التسجيل',
      revenueModel: 'SaaS — اشتراك شهري / سنوي',
      languages: 'عربي + إنجليزي',
    },
  });
}
