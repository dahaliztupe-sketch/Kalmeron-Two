/**
 * /api/admin/funnel — activation & monetization funnel metrics.
 *
 * 🔒 Platform admin only.
 *
 * Reads from the `analytics_events` Firestore collection (written by
 * `src/lib/analytics/track.ts`) and computes the canonical Kalmeron funnel:
 *
 *   landing_visited
 *      └─ signup_started
 *           └─ signup_completed
 *                └─ first_chat_message_sent      (Activation)
 *                     └─ agent_re_used           (Habit)
 *                          └─ trial_started
 *                               └─ subscription_activated   (Monetization)
 *
 * For each pair we report:
 *   - count(stage)
 *   - conversion-rate(stage / previous stage)
 *   - 7-day, 30-day windows
 *
 * Privacy: aggregates only. No userId, no email, no IP addresses leak out.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { requirePlatformAdmin } from '@/src/lib/security/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAGES = [
  'landing_visited',
  'signup_started',
  'signup_completed',
  'first_chat_message_sent',
  'agent_re_used',
  'trial_started',
  'subscription_activated',
] as const;

type Stage = (typeof STAGES)[number];

const STAGE_LABELS_AR: Record<Stage, string> = {
  landing_visited: 'زائر الصفحة الرئيسية',
  signup_started: 'بدأ التسجيل',
  signup_completed: 'أكمل التسجيل',
  first_chat_message_sent: 'أوّل رسالة مع وكيل',
  agent_re_used: 'استخدم الوكيل مجدّداً',
  trial_started: 'بدأ التجربة',
  subscription_activated: 'اشترك في خطة مدفوعة',
};

interface StageRow {
  stage: Stage;
  labelAr: string;
  count7d: number;
  count30d: number;
  conversionFromPrev7d: number | null;  // 0..1, null for first stage
  conversionFromPrev30d: number | null;
}

async function countDistinctUsersByEvent(
  event: Stage,
  sinceMs: number,
): Promise<number> {
  // Aggregate count of unique userIds in `analytics_events` since `sinceMs`.
  // For unauthenticated stages (landing_visited, signup_started) we count
  // distinct requestIds instead.
  const snap = await adminDb
    .collection('analytics_events')
    .where('event', '==', event)
    .where('occurredAt', '>=', new Date(sinceMs))
    .select('userId', 'requestId')
    .get();

  const ids = new Set<string>();
  snap.forEach((doc) => {
    const d = doc.data() as { userId?: string | null; requestId?: string | null };
    const id = d.userId || d.requestId;
    if (id) ids.add(id);
  });
  return ids.size;
}

export async function GET(req: NextRequest) {
  const admin = await requirePlatformAdmin(req);
  if (admin instanceof Response) return admin;

  const now = Date.now();
  const since7d = now - 7 * 24 * 60 * 60 * 1000;
  const since30d = now - 30 * 24 * 60 * 60 * 1000;

  try {
    const counts7 = await Promise.all(STAGES.map((s) => countDistinctUsersByEvent(s, since7d)));
    const counts30 = await Promise.all(STAGES.map((s) => countDistinctUsersByEvent(s, since30d)));

    const rows: StageRow[] = STAGES.map((stage, i) => {
      const c7 = counts7[i] ?? 0;
      const c30 = counts30[i] ?? 0;
      const prev7 = i === 0 ? null : counts7[i - 1] ?? 0;
      const prev30 = i === 0 ? null : counts30[i - 1] ?? 0;
      return {
        stage,
        labelAr: STAGE_LABELS_AR[stage],
        count7d: c7,
        count30d: c30,
        conversionFromPrev7d: prev7 == null || prev7 === 0 ? null : c7 / prev7,
        conversionFromPrev30d: prev30 == null || prev30 === 0 ? null : c30 / prev30,
      };
    });

    // Top-of-funnel → activation overall
    const visitsToActivation7 =
      counts7[0] && counts7[3]
        ? counts7[3] / counts7[0]
        : null;
    const visitsToActivation30 =
      counts30[0] && counts30[3]
        ? counts30[3] / counts30[0]
        : null;
    const activationToPaid7 =
      counts7[3] && counts7[6]
        ? counts7[6] / counts7[3]
        : null;
    const activationToPaid30 =
      counts30[3] && counts30[6]
        ? counts30[6] / counts30[3]
        : null;

    return NextResponse.json(
      {
        generatedAt: new Date(now).toISOString(),
        windows: { d7: '7 days', d30: '30 days' },
        rows,
        summary: {
          visitsToActivation: { d7: visitsToActivation7, d30: visitsToActivation30 },
          activationToPaid: { d7: activationToPaid7, d30: activationToPaid30 },
        },
      },
      { headers: { 'Cache-Control': 'private, max-age=300' } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: 'funnel_query_failed',
        message: e instanceof Error ? e.message : 'unknown',
      },
      { status: 500 },
    );
  }
}
