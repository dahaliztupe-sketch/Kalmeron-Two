import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { getMetricsSnapshot } from '@/src/ai/organization/compliance/monitor';
import { listTasksForUser } from '@/src/ai/organization/tasks/task-manager';
import { getTwin } from '@/src/lib/memory/shared-memory';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import type { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Returns the nearest upcoming opportunity (deadline ascending, filtered to
 * future deadlines only so imminent records are never skipped in favour of
 * far-future ones).  An opportunity is considered "imminent" if its deadline
 * falls within the next 7 days, but we always return the nearest future one
 * regardless so the banner can decide whether to display.
 */
/** Normalises a Firestore deadline field that may be a string or Timestamp. */
function deadlineToString(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  // Firestore admin Timestamp (has .toDate()) or plain seconds object
  if (typeof (raw as Timestamp).toDate === 'function') {
    return (raw as Timestamp).toDate().toISOString().slice(0, 10);
  }
  if (typeof (raw as { seconds?: number }).seconds === 'number') {
    return new Date((raw as { seconds: number }).seconds * 1000).toISOString().slice(0, 10);
  }
  return String(raw).slice(0, 10);
}

async function getLatestOpportunity() {
  if (!adminDb?.collection) return null;
  try {
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Attempt 1: string-stored deadlines (most common in this codebase)
    let snap = await adminDb
      .collection('opportunities')
      .orderBy('deadline', 'asc')
      .startAt(todayStr)
      .limit(1)
      .get()
      .catch(() => null);

    // Attempt 2: fall back to unfiltered fetch and filter in JS
    // (handles Timestamp-stored deadlines that can't be compared to a string)
    if (!snap || snap.empty) {
      const raw = await adminDb
        .collection('opportunities')
        .orderBy('deadline', 'asc')
        .limit(20)
        .get()
        .catch(() => null);
      if (raw && !raw.empty) {
        const future = raw.docs.filter(d => {
          const dl = deadlineToString(d.data()?.deadline);
          return dl ? dl >= todayStr : false;
        });
        if (future.length > 0) {
          const doc = future[0];
          const d = doc.data() as Record<string, unknown>;
          return {
            id: doc.id,
            title: (d.title as string) || 'فرصة جديدة',
            type: (d.type as string) || 'opportunity',
            organizer: (d.organizer as string | null) ?? null,
            deadline: deadlineToString(d.deadline),
            link: (d.link as string | null) ?? null,
          };
        }
      }
      return null;
    }

    const doc = snap.docs[0];
    const d = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      title: (d.title as string) || 'فرصة جديدة',
      type: (d.type as string) || 'opportunity',
      organizer: (d.organizer as string | null) ?? null,
      deadline: deadlineToString(d.deadline),
      link: (d.link as string | null) ?? null,
    };
  } catch { return null; }
}

async function getFirestoreUserProfile(uid: string): Promise<{
  name: string | null;
  company_name: string | null;
  startup_stage: string | null;
  industry: string | null;
  governorate: string | null;
  goals: string[];
} | null> {
  if (!adminDb?.collection) return null;
  try {
    const snap = await adminDb.collection('users').doc(uid).get();
    if (!snap.exists) return null;
    const d = snap.data() as Record<string, unknown>;
    return {
      name:          (d['name'] as string | null) ?? null,
      company_name:  (d['company_name'] as string | null) ?? null,
      startup_stage: (d['startup_stage'] as string | null) ?? null,
      industry:      (d['industry'] as string | null) ?? null,
      governorate:   (d['governorate'] as string | null) ?? null,
      goals:         Array.isArray(d['goals']) ? (d['goals'] as string[]) : [],
    };
  } catch { return null; }
}

interface DashboardAlert {
  severity: 'info' | 'warn' | 'error';
  source: string;
  message: string;
  timestamp: string;
}

/**
 * Derives threshold-based alerts for `userId` from real Firestore signals:
 *   - High AI cost day (> 80 % of daily limit)
 *   - Consecutive zero-usage days (profile may be stale / onboarding incomplete)
 *   - Incomplete onboarding (missing industry / stage)
 *
 * Falls back to an empty array on any Firestore error so the dashboard never
 * breaks due to missing data.
 */
async function getFirestoreAlerts(userId: string, profile: {
  startup_stage: string | null;
  industry: string | null;
} | null): Promise<DashboardAlert[]> {
  const alerts: DashboardAlert[] = [];
  if (!adminDb?.collection) return alerts;

  try {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const snap = await adminDb
      .collection('usage_daily')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(7)
      .get()
      .catch(() => null);

    if (snap && !snap.empty) {
      const recent = snap.docs.map(d => d.data() as {
        date?: string; requests?: number; costUsd?: number; credits?: number;
      });

      // High cost alert — yesterday's cost > 80 % of $5 daily budget
      const DAILY_LIMIT_USD = 5;
      const latestDay = recent[0];
      if (latestDay.date === yesterdayStr && (latestDay.costUsd ?? 0) > DAILY_LIMIT_USD * 0.8) {
        alerts.push({
          severity: 'warn',
          source: 'usage',
          message: `تكلفة الذكاء الاصطناعي أمس بلغت ${((latestDay.costUsd ?? 0) * 100 / DAILY_LIMIT_USD).toFixed(0)} % من الحد اليومي`,
          timestamp: yesterdayStr,
        });
      }

      // Zero-usage alert — last 3 days all zero requests
      const last3 = recent.slice(0, 3);
      if (last3.length === 3 && last3.every(d => !d.requests)) {
        alerts.push({
          severity: 'info',
          source: 'engagement',
          message: 'لم يُسجَّل أي نشاط خلال آخر 3 أيام — هل تحتاج مساعدة في البدء؟',
          timestamp: new Date().toISOString().slice(0, 10),
        });
      }
    }
  } catch { /* best-effort — never throw */ }

  // Incomplete onboarding alert
  if (!profile?.startup_stage || !profile?.industry) {
    alerts.push({
      severity: 'info',
      source: 'onboarding',
      message: 'أكمل ملفك الشخصي لتحصل على توصيات مخصّصة لمشروعك',
      timestamp: new Date().toISOString().slice(0, 10),
    });
  }

  return alerts;
}

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

  const [twin, tasks, metrics, opportunity, firestoreProfile, recentConversations] = await Promise.all([
    getTwin(userId),
    listTasksForUser(userId, 20),
    Promise.resolve(getMetricsSnapshot()),
    getLatestOpportunity(),
    userId !== 'guest' ? getFirestoreUserProfile(userId) : Promise.resolve(null),
    userId !== 'guest' ? getRecentConversations(userId) : Promise.resolve([]),
  ]);

  // Firestore profile takes precedence over in-memory twin for profile fields
  const stage       = firestoreProfile?.startup_stage || twin.stage || 'idea';
  const companyName = firestoreProfile?.company_name  || twin.companyName || null;
  const industry    = firestoreProfile?.industry      || twin.industry || null;

  const alerts = userId !== 'guest'
    ? await getFirestoreAlerts(userId, firestoreProfile)
    : [];

  return NextResponse.json({
    welcome: {
      stage,
      companyName,
      industry,
      name: firestoreProfile?.name || null,
      governorate: firestoreProfile?.governorate || null,
      goals: firestoreProfile?.goals || [],
    },
    teamActivity: recentConversations,
    pendingTasks: tasks.filter(t => t.status === 'awaiting_human' || t.status === 'pending').slice(0, 10),
    alerts,
    metrics: {
      dailyCostUsd: metrics.dailyCostUsd,
      dailyLimit: metrics.dailyLimit,
      agentCount: Object.keys(metrics.agents).length,
    },
    progress: {
      stage,
      stages: ['idea', 'validation', 'foundation', 'growth', 'scaling'],
    },
    opportunity,
  });
}

/**
 * Fetches the 10 most-recent conversations from users/{uid}/chat_history,
 * ordered by updated_at descending, and returns them with direct /chat links.
 */
async function getRecentConversations(uid: string): Promise<Array<{
  convId: string;
  title: string;
  lastMessage: string;
  agentId: string | null;
  updatedAt: string | null;
  href: string;
}>> {
  if (!adminDb?.collection) return [];
  try {
    const snap = await adminDb
      .collection('users')
      .doc(uid)
      .collection('chat_history')
      .orderBy('updated_at', 'desc')
      .limit(10)
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as {
        title?: string;
        lastMessage?: string;
        agentId?: string;
        updated_at?: Timestamp | string | null;
      };
      let updatedAt: string | null = null;
      if (data.updated_at) {
        if (typeof data.updated_at === 'string') {
          updatedAt = data.updated_at;
        } else if (typeof (data.updated_at as Timestamp).toDate === 'function') {
          updatedAt = (data.updated_at as Timestamp).toDate().toISOString();
        }
      }
      return {
        convId:      d.id,
        title:       data.title      || 'محادثة',
        lastMessage: data.lastMessage || '',
        agentId:     data.agentId    || null,
        updatedAt,
        href: `/chat?conv=${d.id}`,
      };
    });
  } catch { return []; }
}
  