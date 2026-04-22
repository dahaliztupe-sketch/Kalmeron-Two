import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { observe } from '@/src/ai/admin/observer.agent';
import { analyze } from '@/src/ai/admin/analyst.agent';
import { plan } from '@/src/ai/admin/planner.agent';
import { buildFleetDriftReport } from '@/src/lib/observability/drift-detector';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
      const email = (dec.email || '').toLowerCase();
      if (ADMIN_EMAILS.length && !ADMIN_EMAILS.includes(email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (ADMIN_EMAILS.length) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [report, drift] = await Promise.all([observe(), buildFleetDriftReport(7)]);
  const risks = analyze(report);
  const plans = plan(risks);
  const driftAlerts = drift.filter((d) => d.driftScore >= 0.4).map((d) => ({
    agent: d.agent,
    driftScore: Number(d.driftScore.toFixed(2)),
    successRate: Number(d.successRate.toFixed(3)),
    avgLatencyMs: Math.round(d.avgLatencyMs),
    samples: d.samples,
  }));

  return NextResponse.json({ report, risks, plans, drift: { alerts: driftAlerts, total: drift.length } });
}
