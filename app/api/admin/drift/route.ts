import { NextRequest, NextResponse } from 'next/server';
import { buildFleetDriftReport, recordDriftSample } from '@/src/lib/observability/drift-detector';
import { requireAuth } from '@/src/lib/security/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof Response) return guard;

  const url = new URL(req.url);
  const windowDays = Math.max(1, Math.min(30, Number(url.searchParams.get('days') || 7)));
  const reports = await buildFleetDriftReport(windowDays);

  return NextResponse.json({
    windowDays,
    agents: reports,
    summary: {
      total: reports.length,
      drifting: reports.filter((r) => r.driftScore >= 0.4).length,
      avgSuccessRate:
        reports.length === 0
          ? 1
          : reports.reduce((s, r) => s + r.successRate, 0) / reports.length,
    },
  });
}

/**
 * Endpoint داخلي لتدفّق العيّنات من خوادم الوكلاء — محمية بنفس
 * فحص الإدارة لأنها تكتب بيانات قياسية حسّاسة.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard instanceof Response) return guard;

  interface DriftSampleBody {
    agent?: string;
    toolsUsed?: unknown[];
    responseLength?: number;
    latencyMs?: number;
    success?: boolean;
    errorCode?: string;
    policyId?: string;
    observed?: unknown;
    expected?: unknown;
    severity?: string;
  }
  let body: DriftSampleBody;
  try {
    body = (await req.json()) as DriftSampleBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body?.agent) return NextResponse.json({ error: 'agent_required' }, { status: 400 });

  await recordDriftSample({
    agent: String(body.agent),
    toolsUsed: Array.isArray(body.toolsUsed) ? body.toolsUsed.map(String) : [],
    responseLength: Number(body.responseLength) || 0,
    latencyMs: Number(body.latencyMs) || 0,
    success: body.success !== false,
    errorCode: body.errorCode ? String(body.errorCode) : undefined,
  });
  return NextResponse.json({ ok: true });
}
