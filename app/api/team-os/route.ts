/**
 * Team OS — نقطة موحدة تجمع كل الحالة عبر OKRs + حالة الوكلاء.
 * Knowledge Graph / Neo4j has been removed — knowledgeGraph is always disabled.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listCurrentWeekOKRs, listOKRs } from '@/src/lib/okr/okr-store';
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

  const [weekly, recent] = await Promise.all([
    listCurrentWeekOKRs(userId).catch(() => []),
    listOKRs(userId, { limit: 20 }).catch(() => []),
  ]);
  const metrics = getMetricsSnapshot();

  return NextResponse.json({
    userId,
    okrs: { weekly, recent },
    knowledgeGraph: { enabled: false, nodes: [], edges: [] },
    agents: metrics.agents,
    cost: { dailyCostUsd: metrics.dailyCostUsd, dailyLimit: metrics.dailyLimit },
    alerts: metrics.alertsRecent,
  });
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 15, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  return NextResponse.json({ ok: false, reason: 'kg_disabled' }, { status: 503 });
}
