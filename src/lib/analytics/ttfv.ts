/**
 * Time-to-First-Value (TTFV) instrumentation — Kalmeron Two
 * --------------------------------------------------------------
 * Implements P0-3 from the 45-expert business audit.
 *
 * "First Value" for Kalmeron = first AI response that the user actually
 * read (i.e. an `agent_message_received` event). We measure two things:
 *
 *   1. TTFV-cold:  signup_completed → first_chat_message_sent
 *   2. TTFV-warm:  first_chat_message_sent → first_value_delivered
 *
 * These two halves let Product see whether onboarding friction or
 * agent latency is the bottleneck.
 *
 * Targets (from KPI table in the audit):
 *   - 6mo:  ≤ 8 minutes (cold), ≤ 30s (warm)
 *   - 12mo: ≤ 4 minutes (cold), ≤ 15s (warm)
 *
 * The implementation is fire-and-forget and additive — it never throws on
 * the user-facing path.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { trackEvent } from '@/src/lib/analytics/track';
import { FieldValue } from 'firebase-admin/firestore';

export type TtfvStage = 'signup' | 'first_message' | 'first_value';

export interface TtfvMarkArgs {
  userId: string;
  stage: TtfvStage;
  /** Optional: workspace bucket for cohort filtering. */
  workspaceId?: string;
  /** Optional: extra props (agent name, intent, etc.). */
  properties?: Record<string, unknown>;
}

interface TtfvDoc {
  userId: string;
  workspaceId?: string;
  signupAt?: number;
  firstMessageAt?: number;
  firstValueAt?: number;
  ttfvColdMs?: number;
  ttfvWarmMs?: number;
  updatedAt: number;
}

/**
 * Records a TTFV stage marker. Idempotent per (user, stage) — calling twice
 * with the same stage will *not* overwrite the original timestamp.
 *
 * Once `first_value` is reached, computes `ttfvColdMs` and `ttfvWarmMs`
 * derivatives and emits a typed analytics event for the funnel dashboard.
 */
export async function markTtfvStage(args: TtfvMarkArgs): Promise<void> {
  if (!args.userId) return;
  const now = Date.now();
  try {
    const ref = adminDb.collection('ttfv').doc(args.userId);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const existing = (snap.exists ? snap.data() : null) as TtfvDoc | null;
      const next: TtfvDoc = existing
        ? { ...existing, updatedAt: now }
        : { userId: args.userId, workspaceId: args.workspaceId, updatedAt: now };

      if (args.stage === 'signup' && !next.signupAt) next.signupAt = now;
      if (args.stage === 'first_message' && !next.firstMessageAt) next.firstMessageAt = now;
      if (args.stage === 'first_value' && !next.firstValueAt) next.firstValueAt = now;

      if (next.signupAt && next.firstMessageAt && !next.ttfvColdMs) {
        next.ttfvColdMs = next.firstMessageAt - next.signupAt;
      }
      if (next.firstMessageAt && next.firstValueAt && !next.ttfvWarmMs) {
        next.ttfvWarmMs = next.firstValueAt - next.firstMessageAt;
      }
      tx.set(ref, next, { merge: true });
    });

    // Emit a daily aggregate doc for the admin funnel dashboard.
    if (args.stage === 'first_value') {
      const day = new Date().toISOString().slice(0, 10);
      const aggRef = adminDb.collection('ttfv_daily').doc(day);
      await aggRef.set(
        {
          day,
          firstValueCount: FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true },
      );
    }

    void trackEvent({
      event: 'agent_re_used', // re-using analytics slot until typed `ttfv_marked` is added
      userId: args.userId,
      workspaceId: args.workspaceId,
      properties: { kind: 'ttfv', stage: args.stage, ...(args.properties ?? {}) },
    });
  } catch (e) {
    console.error('[ttfv] mark failed', e instanceof Error ? e.message : e);
  }
}

export interface TtfvSummary {
  totalUsersWithSignup: number;
  totalUsersWithFirstValue: number;
  medianColdMs: number | null;
  medianWarmMs: number | null;
  p90ColdMs: number | null;
  p90WarmMs: number | null;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

/**
 * Reads the `ttfv` collection and computes summary stats for the admin
 * dashboard. Suitable for tens of thousands of docs; for larger scale
 * we would precompute a `ttfv_summary` rollup nightly.
 */
export async function getTtfvSummary(maxDocs = 5000): Promise<TtfvSummary> {
  try {
    const snap = await adminDb.collection('ttfv').limit(maxDocs).get();
    const colds: number[] = [];
    const warms: number[] = [];
    let signupCount = 0;
    let valueCount = 0;
    snap.forEach((doc) => {
      const d = doc.data() as TtfvDoc;
      if (d.signupAt) signupCount++;
      if (d.firstValueAt) valueCount++;
      if (typeof d.ttfvColdMs === 'number') colds.push(d.ttfvColdMs);
      if (typeof d.ttfvWarmMs === 'number') warms.push(d.ttfvWarmMs);
    });
    colds.sort((a, b) => a - b);
    warms.sort((a, b) => a - b);
    return {
      totalUsersWithSignup: signupCount,
      totalUsersWithFirstValue: valueCount,
      medianColdMs: percentile(colds, 50),
      medianWarmMs: percentile(warms, 50),
      p90ColdMs: percentile(colds, 90),
      p90WarmMs: percentile(warms, 90),
    };
  } catch (e) {
    console.error('[ttfv] summary failed', e instanceof Error ? e.message : e);
    return {
      totalUsersWithSignup: 0,
      totalUsersWithFirstValue: 0,
      medianColdMs: null,
      medianWarmMs: null,
      p90ColdMs: null,
      p90WarmMs: null,
    };
  }
}
