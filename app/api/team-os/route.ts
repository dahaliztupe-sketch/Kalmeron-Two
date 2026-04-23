/**
 * Team OS — نقطة موحدة تجمع كل الحالة عبر OKRs + الدماغ المشترك + حالة الوكلاء.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listCurrentWeekOKRs, listOKRs } from '@/src/lib/okr/okr-store';
import { getProjectOverview, isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';
import { getMetricsSnapshot } from '@/src/ai/organization/compliance/monitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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
