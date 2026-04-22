import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { getMetricsSnapshot, getAlerts } from '@/src/ai/organization/compliance/monitor';
import { listTasksForUser } from '@/src/ai/organization/tasks/task-manager';
import { getTwin } from '@/src/lib/memory/shared-memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getLatestOpportunity() {
  if (!adminDb?.collection) return null;
  try {
    const snap = await adminDb
      .collection('opportunities')
      .orderBy('deadline', 'desc')
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    const d: any = doc.data();
    return {
      id: doc.id,
      title: d.title || 'فرصة جديدة',
      type: d.type || 'opportunity',
      organizer: d.organizer || null,
      deadline: d.deadline || null,
      link: d.link || null,
    };
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  let userId = 'guest';
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
      userId = dec.uid;
    } catch { /* guest */ }
  }

  const [twin, tasks, metrics, opportunity] = await Promise.all([
    getTwin(userId),
    listTasksForUser(userId, 20),
    Promise.resolve(getMetricsSnapshot()),
    getLatestOpportunity(),
  ]);

  return NextResponse.json({
    welcome: {
      stage: twin.stage || 'idea',
      companyName: twin.companyName || null,
      industry: twin.industry || null,
    },
    teamActivity: tasks.slice(0, 10).map(t => ({
      taskId: t.taskId,
      description: t.description,
      status: t.status,
      updatedAt: t.updatedAt,
    })),
    pendingTasks: tasks.filter(t => t.status === 'awaiting_human' || t.status === 'pending').slice(0, 10),
    alerts: getAlerts(10),
    metrics: {
      dailyCostUsd: metrics.dailyCostUsd,
      dailyLimit: metrics.dailyLimit,
      agentCount: Object.keys(metrics.agents).length,
    },
    progress: {
      stage: twin.stage || 'idea',
      stages: ['idea', 'validation', 'foundation', 'growth', 'scaling'],
    },
    opportunity,
  });
}
  