import { NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';
import { toErrorMessage } from '@/src/lib/errors/to-message';
import { listAvailableProviders } from '@/src/lib/llm/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
} as const;

type CheckStatus = 'connected' | 'unreachable' | 'disabled' | 'configured' | 'unconfigured' | 'protected' | 'unprotected';

async function withTimeout<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  return await Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout_${ms}ms`)), ms),
    ),
  ]);
}

async function safe<T>(label: string, fn: () => Promise<T>): Promise<[string, CheckStatus, unknown?]> {
  try {
    const v = await withTimeout(3_000, fn);
    return [label, 'connected', v];
  } catch (e: unknown) {
    return [label, 'unreachable', toErrorMessage(e)];
  }
}

/** Ping a Python sidecar's /health endpoint and return its JSON payload. */
async function pingService(url: string): Promise<{ ok: boolean; [k: string]: unknown }> {
  const res = await fetch(`${url}/health`, {
    signal: AbortSignal.timeout(3_000),
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{ ok: boolean; [k: string]: unknown }>;
}

export async function GET() {
  const timestamp = new Date().toISOString();

  const isMockMode =
    process.env.MOCK_AUTH === 'true' ||
    process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' ||
    process.env.NODE_ENV === 'test';

  if (isMockMode) {
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp,
        version: process.env.npm_package_version || '0.1.0',
        mock: true,
        checks: {
          firestore: 'disabled',
          knowledgeGraph: 'disabled',
          learningLoop: 'connected',
          virtualMeeting: 'connected',
          launchpad: 'connected',
          expertFactory: 'connected',
          pdfWorker: 'disabled',
          egyptCalc: 'disabled',
          llmJudge: 'disabled',
          embeddingsWorker: 'disabled',
        } as Record<string, CheckStatus>,
        meta: { mode: 'mock' },
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  }

  const checks: Record<string, CheckStatus> = {};
  const meta: Record<string, unknown> = {};

  // ── Core infrastructure ───────────────────────────────────────────────────
  const [firestoreLabel, firestoreStatus] = await safe('firestore', async () => {
    await adminDb.collection('_health').doc('ping').get();
    return true;
  });
  checks[firestoreLabel] = firestoreStatus;

  try {
    checks.knowledgeGraph = (await isKnowledgeGraphEnabled()) ? 'connected' : 'disabled';
  } catch {
    checks.knowledgeGraph = 'unreachable';
  }

  // ── Feature subsystems ────────────────────────────────────────────────────
  checks.learningLoop = 'connected';
  checks.virtualMeeting = 'connected';
  checks.launchpad = 'connected';
  checks.expertFactory = 'connected';

  // ── Python sidecars ───────────────────────────────────────────────────────
  const PDF_WORKER_URL = process.env.PDF_WORKER_URL || 'http://localhost:8000';
  const EGYPT_CALC_URL = process.env.EGYPT_CALC_URL || 'http://localhost:8008';
  const LLM_JUDGE_URL  = process.env.LLM_JUDGE_URL  || 'http://localhost:8080';
  const EMB_WORKER_URL = process.env.EMBEDDINGS_WORKER_URL || 'http://localhost:8099';

  const [, pdfStatus, pdfData]   = await safe('pdfWorker', () => pingService(PDF_WORKER_URL));
  const [, calcStatus, calcData] = await safe('egyptCalc', () => pingService(EGYPT_CALC_URL));
  const [, judgeStatus, judgeData] = await safe('llmJudge', () => pingService(LLM_JUDGE_URL));
  const [, embStatus, embData]   = await safe('embeddingsWorker', () => pingService(EMB_WORKER_URL));

  checks.pdfWorker        = pdfStatus;
  checks.egyptCalc        = calcStatus;
  checks.llmJudge         = judgeStatus;
  checks.embeddingsWorker = embStatus;

  // Surface sidecar metadata (version, mode, model loaded, etc.)
  if (pdfData && typeof pdfData === 'object')   meta.pdfWorker        = pdfData;
  if (calcData && typeof calcData === 'object')  meta.egyptCalc        = calcData;
  if (judgeData && typeof judgeData === 'object') meta.llmJudge        = judgeData;
  if (embData && typeof embData === 'object')    meta.embeddingsWorker = embData;

  // ── LLM providers ─────────────────────────────────────────────────────────
  try {
    const availableProviders = listAvailableProviders();
    checks.llmProviders = availableProviders.length > 0 ? 'configured' : 'unconfigured';
    meta.llmProviders = availableProviders;
  } catch {
    checks.llmProviders = 'unconfigured';
  }

  // ── VM providers ──────────────────────────────────────────────────────────
  const hasE2B = !!process.env.E2B_API_KEY;
  const hasDaytona = !!(process.env.DAYTONA_API_KEY && process.env.DAYTONA_API_URL);
  checks.virtualOffice = hasE2B || hasDaytona ? 'configured' : 'unconfigured';
  meta.virtualOfficeProvider = hasE2B ? 'e2b' : hasDaytona ? 'daytona' : 'stub';

  // ── Omnichannel ───────────────────────────────────────────────────────────
  checks.whatsapp = process.env.WHATSAPP_ACCESS_TOKEN ? 'configured' : 'unconfigured';
  checks.telegram = process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'unconfigured';
  // Primary email provider is Resend (RESEND_API_KEY); fallback channel uses SENDGRID_API_KEY
  checks.email = (process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY) ? 'configured' : 'unconfigured';
  meta.emailProvider = process.env.RESEND_API_KEY ? 'resend' : process.env.SENDGRID_API_KEY ? 'sendgrid' : 'none';

  // ── Billing ───────────────────────────────────────────────────────────────
  checks.stripe = process.env.STRIPE_SECRET_KEY ? 'configured' : 'unconfigured';
  checks.fawry = (process.env.FAWRY_MERCHANT_CODE && process.env.FAWRY_SECURITY_KEY) ? 'configured' : 'unconfigured';

  // ── Secrets & auth ────────────────────────────────────────────────────────
  checks.cron = process.env.CRON_SECRET ? 'protected' : 'unprotected';
  checks.firebaseAdmin = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'configured' : 'unconfigured';

  // ── Recent launch runs ────────────────────────────────────────────────────
  try {
    const snap = await adminDb.collection('launch_runs').orderBy('updatedAt', 'desc').limit(5).get();
    meta.recentLaunchRuns = snap.docs.map((d) => ({ id: d.id, status: (d.data() as { status?: string }).status }));
  } catch {
    meta.recentLaunchRuns = [];
  }

  // ── Overall status ────────────────────────────────────────────────────────
  const criticalDown = [
    checks.firestore,
    checks.pdfWorker,
    checks.egyptCalc,
    checks.embeddingsWorker,
  ].some((s) => s === 'unreachable');

  const degraded =
    criticalDown ||
    checks.knowledgeGraph === 'unreachable' ||
    checks.firebaseAdmin === 'unconfigured' ||
    checks.llmProviders === 'unconfigured';

  return NextResponse.json(
    {
      status: degraded ? 'degraded' : 'healthy',
      timestamp,
      version: process.env.npm_package_version || '0.1.0',
      checks,
      meta,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}
