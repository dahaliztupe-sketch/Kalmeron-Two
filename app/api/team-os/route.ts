/**
 * Team OS — نقطة موحدة تجمع كل الحالة عبر OKRs + الدماغ المشترك + حالة الوكلاء.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listCurrentWeekOKRs, listOKRs } from '@/src/lib/okr/okr-store';
import { getProjectOverview, isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';
import { getMetricsSnapshot } from '@/src/ai/organization/compliance/monitor';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  let userId = 'guest';
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
      userId = dec.uid;
    } catch { /* guest */ }
  }

  const kgEnabled = await isKnowledgeGraphEnabled();
  const [weekly, recent, overview] = await Promise.all([
    listCurrentWeekOKRs(userId).catch(() => []),
    listOKRs(userId, { limit: 20 }).catch(() => []),
    kgEnabled ? getProjectOverview(userId, 100) : Promise.resolve({ nodes: [], edges: [] }),
  ]);
  const metrics = getMetricsSnapshot();

  return NextResponse.json({
    userId,
    okrs: { weekly, recent },
    knowledgeGraph: { enabled: kgEnabled, ...(overview || { nodes: [], edges: [] }) },
    agents: metrics.agents,
    cost: { dailyCostUsd: metrics.dailyCostUsd, dailyLimit: metrics.dailyLimit },
    alerts: metrics.alertsRecent,
  });
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 15, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  let userId = 'guest';
  const authH = req.headers.get('Authorization');
  if (authH?.startsWith('Bearer ')) {
    try { userId = (await adminAuth.verifyIdToken(authH.split(' ')[1]!)).uid; } catch {}
  }
  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  const payload = body?.payload || {};

  if (action === 'recordFinding') {
    if (!(await isKnowledgeGraphEnabled())) {
      return NextResponse.json({ ok: false, reason: 'kg_disabled' }, { status: 503 });
    }
    const { addEntity } = await import('@/src/lib/memory/knowledge-graph');
    const node = await addEntity(userId, payload.type || 'Finding', {
      content: payload.content,
      department: payload.department,
      source: payload.source || 'manual',
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, node });
  }

  return NextResponse.json({ ok: false, reason: 'unknown_action' }, { status: 400 });
}
