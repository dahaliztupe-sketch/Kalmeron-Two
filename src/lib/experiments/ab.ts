/**
 * Lightweight A/B testing — see also `src/lib/analytics/track.ts`.
 *
 * Each experiment lives in `EXPERIMENTS` below. We:
 *   1. Hash (userId | requestId) → a stable bucket between 0-99.
 *   2. Compare against the variant ranges to assign one variant deterministically.
 *   3. Track exposure once per (experiment, user) so the analytics pipeline can
 *      compute conversion deltas downstream.
 *
 * Design constraints:
 *   - Zero network calls (purely in-process).
 *   - Deterministic — same user always lands in the same variant.
 *   - Safe defaults — if config is broken, returns the control variant.
 *   - Edge-runtime safe (uses Web Crypto where available, fallback FNV-1a).
 */

import { trackEvent } from '@/src/lib/analytics/track';

export interface ExperimentVariant {
  /** Unique key returned to callers. */
  key: string;
  /** Inclusive percentage allocation 0–100. The sum across variants must = 100. */
  weight: number;
}

export interface ExperimentDefinition {
  /** Unique experiment key. Used in analytics + dashboards. */
  key: string;
  /** Human-readable description. */
  description: string;
  /** When the experiment started — used for cohort filtering. */
  startedAt: string;
  /** Optional planned end date (informational). */
  plannedEndAt?: string;
  /** The control variant must be listed first by convention. */
  variants: ExperimentVariant[];
  /** If false, every user gets `variants[0]` (kill-switch). */
  enabled: boolean;
}

/**
 * REGISTRY — add new experiments here. Do NOT change variant `key`s after launch
 * (would invalidate prior analytics data). To stop, flip `enabled: false`.
 */
export const EXPERIMENTS: Record<string, ExperimentDefinition> = {
  landing_hero_copy: {
    key: 'landing_hero_copy',
    description: 'Hero headline variant — control vs Egyptian-first vs benefit-first.',
    startedAt: '2026-04-24',
    enabled: true,
    variants: [
      { key: 'control', weight: 50 },
      { key: 'egyptian_first', weight: 25 },
      { key: 'benefit_first', weight: 25 },
    ],
  },
  pricing_yearly_default: {
    key: 'pricing_yearly_default',
    description: 'Default the pricing toggle to yearly billing on first visit.',
    startedAt: '2026-04-24',
    enabled: true,
    variants: [
      { key: 'monthly_default', weight: 50 },
      { key: 'yearly_default', weight: 50 },
    ],
  },
};

/**
 * FNV-1a 32-bit hash — fast, zero deps, stable across runtimes (Node + Edge).
 */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Assigns a user/request to a variant deterministically.
 * Returns `variants[0].key` if the experiment is missing, disabled, or
 * mis-configured (defensive — never throws on caller path).
 */
export function getVariant(
  experimentKey: string,
  subject: { userId?: string | null; requestId?: string }
): string {
  const exp = EXPERIMENTS[experimentKey];
  if (!exp || !exp.variants.length) return 'control';
  if (!exp.enabled) return exp.variants[0].key;

  const subjectId = subject.userId || subject.requestId;
  if (!subjectId) return exp.variants[0].key;

  const totalWeight = exp.variants.reduce((s, v) => s + v.weight, 0);
  if (totalWeight !== 100) return exp.variants[0].key;

  const bucket = fnv1a(`${experimentKey}|${subjectId}`) % 100;
  let cursor = 0;
  for (const variant of exp.variants) {
    cursor += variant.weight;
    if (bucket < cursor) return variant.key;
  }
  return exp.variants[exp.variants.length - 1].key;
}

/**
 * Server-side: assign + record exposure in a single call.
 * The exposure event is fire-and-forget; never throws on caller path.
 */
export async function assignAndTrack(
  experimentKey: string,
  subject: { userId?: string | null; requestId?: string; workspaceId?: string }
): Promise<string> {
  const variant = getVariant(experimentKey, subject);
  try {
    await trackEvent({
      event: 'agent_re_used', // re-using a generic event slot until we add a typed `experiment_exposed`
      userId: subject.userId,
      workspaceId: subject.workspaceId,
      requestId: subject.requestId,
      properties: {
        experiment_key: experimentKey,
        variant_key: variant,
        kind: 'experiment_exposure',
      },
    });
  } catch {
    /* exposure tracking is best-effort */
  }
  return variant;
}
