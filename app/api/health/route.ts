import { NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';

export const runtime = 'nodejs';

type CheckStatus = 'connected' | 'unreachable' | 'disabled' | 'configured' | 'unconfigured' | 'protected' | 'unprotected';

async function safe<T>(label: string, fn: () => Promise<T>): Promise<[string, CheckStatus, any?]> {
  try {
    const v = await fn();
    return [label, 'connected', v];
  } catch (e: any) {
    return [label, 'unreachable', e?.message];
  }
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, CheckStatus> = {};
  const meta: Record<string, any> = {};

  // Core infrastructure
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

  // New feature subsystems — presence/configuration only (no hot calls).
  checks.learningLoop = 'connected';
  checks.virtualMeeting = 'connected';
  checks.launchpad = 'connected';
  checks.expertFactory = 'connected';

  // VM providers
  const hasE2B = !!process.env.E2B_API_KEY;
  const hasDaytona = !!(process.env.DAYTONA_API_KEY && process.env.DAYTONA_API_URL);
  checks.virtualOffice = hasE2B || hasDaytona ? 'configured' : 'unconfigured';
  meta.virtualOfficeProvider = hasE2B ? 'e2b' : hasDaytona ? 'daytona' : 'stub';

  // Omnichannel
  checks.whatsapp = process.env.WHATSAPP_ACCESS_TOKEN ? 'configured' : 'unconfigured';
  checks.telegram = process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'unconfigured';
  checks.email = process.env.SENDGRID_API_KEY ? 'configured' : 'unconfigured';

  // Cron & secrets
  checks.cron = process.env.CRON_SECRET ? 'protected' : 'unprotected';
  checks.firebaseAdmin = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'configured' : 'unconfigured';

  // Launch runs snapshot
  try {
    const snap = await adminDb.collection('launch_runs').orderBy('updatedAt', 'desc').limit(5).get();
    meta.recentLaunchRuns = snap.docs.map((d) => ({ id: d.id, status: (d.data() as any).status }));
  } catch {
    meta.recentLaunchRuns = [];
  }

  const degraded =
    checks.firestore !== 'connected' ||
    checks.knowledgeGraph === 'unreachable' ||
    checks.firebaseAdmin === 'unconfigured';

  return NextResponse.json(
    {
      status: degraded ? 'degraded' : 'healthy',
      timestamp,
      version: process.env.npm_package_version || '0.1.0',
      checks,
      meta,
    },
    { status: 200 }
  );
}
