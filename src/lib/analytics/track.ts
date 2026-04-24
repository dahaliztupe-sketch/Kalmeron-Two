/**
 * Analytics — see `docs/FUNNEL_ANALYTICS.md` for the canonical event taxonomy.
 *
 * Single helper that:
 *  1. Always writes to Firestore `analytics_events` (our source of truth).
 *  2. Best-effort fires to PostHog if POSTHOG_KEY is set.
 *
 * PII never leaves Kalmeron — only opaque IDs go to PostHog.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type AnalyticsEvent =
  | 'landing_visited'
  | 'signup_started'
  | 'signup_completed'
  | 'onboarding_step_completed'
  | 'first_idea_validated'
  | 'first_chat_message_sent'
  | 'weekly_active'
  | 'agent_re_used'
  | 'trial_started'
  | 'subscription_activated'
  | 'subscription_cancelled';

export interface TrackArgs {
  event: AnalyticsEvent;
  userId?: string | null;
  workspaceId?: string;
  requestId?: string;
  properties?: Record<string, unknown>;
}

const PII_KEYS = new Set(['email', 'name', 'fullName', 'phone', 'ip', 'address']);

function stripPii(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (PII_KEYS.has(k)) continue;
    out[k] = v;
  }
  return out;
}

async function sendToPostHog(args: TrackArgs): Promise<void> {
  const key = process.env.POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';
  if (!key) return;
  const distinctId = args.userId || args.requestId || 'anonymous';
  try {
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event: args.event,
        distinct_id: distinctId,
        properties: {
          $lib: 'kalmeron-server',
          workspaceId: args.workspaceId,
          requestId: args.requestId,
          ...stripPii(args.properties ?? {}),
        },
      }),
      // Don't block the request path on telemetry.
      signal: AbortSignal.timeout(2_000),
    });
  } catch {
    // intentionally swallowed
  }
}

/**
 * Track an event. Never throws — analytics must NEVER break a user-facing path.
 */
export async function trackEvent(args: TrackArgs): Promise<void> {
  // 1) Source of truth: Firestore.
  try {
    await adminDb.collection('analytics_events').add({
      event: args.event,
      userId: args.userId ?? null,
      workspaceId: args.workspaceId ?? null,
      requestId: args.requestId ?? null,
      properties: args.properties ?? {},
      occurredAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('[analytics] firestore write failed', e instanceof Error ? e.message : e);
  }

  // 2) Best-effort mirror to PostHog (PII-stripped).
  void sendToPostHog(args);
}

/**
 * Edge-friendly fire-and-forget variant — returns immediately and lets the
 * underlying writes happen in the background.
 */
export function trackEventAsync(args: TrackArgs): void {
  void trackEvent(args);
}
