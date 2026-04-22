import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { buildFleetDriftReport, recordDriftSample } from '@/src/lib/observability/drift-detector';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function requireAdmin(req: NextRequest): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return { ok: false, res: NextResponse.json({ error: 'auth_required' }, { status: 401 }) };
  }
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    const email = (decoded.email || '').toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) {
      return { ok: false, res: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
    }
    return { ok: true };
  } catch {
    return { ok: false, res: NextResponse.json({ error: 'invalid_token' }, { status: 401 }) };
  }
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

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
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  let body: any;
  try {
    body = await req.json();
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
