import { NextRequest, NextResponse } from 'next/server';
import { observe } from '@/src/ai/admin/observer.agent';
import { analyze } from '@/src/ai/admin/analyst.agent';
import { plan } from '@/src/ai/admin/planner.agent';
import { buildFleetDriftReport } from '@/src/lib/observability/drift-detector';
import { requirePlatformAdmin } from '@/src/lib/security/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requirePlatformAdmin(req);
  if (guard instanceof Response) return guard;

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
