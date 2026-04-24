/**
 * Multi-Provider LLM Abstraction — Kalmeron Two
 * --------------------------------------------------------------
 * Implements the "Gemini Hedging Plan" (P0-1) from the 45-expert
 * business audit (`docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`).
 *
 * Goals:
 *   1. Decouple agent code from a single provider (Gemini today).
 *   2. Offer a deterministic fallback chain when the primary errors out.
 *   3. Keep the API edge-friendly (no SDK eagerly loaded).
 *
 * Providers are *capability-tier-mapped*, not 1:1 — see
 * `src/lib/model-router.ts` for tier definitions.
 *
 * Anthropic & OpenAI adapters are intentionally lazy: we don't import
 * their SDKs until the env keys are present, so build size stays flat.
 */
import type { TaskTier } from '@/src/lib/model-router';

export type ProviderId = 'gemini' | 'anthropic' | 'openai';

export interface ProviderModel {
  provider: ProviderId;
  id: string;
  approxCostPerMTokens: { input: number; output: number };
}

/**
 * Provider tier mapping. Add new providers here; the router will pick the
 * first available one in `FALLBACK_ORDER`.
 */
const PROVIDER_TIERS: Record<ProviderId, Record<TaskTier, ProviderModel>> = {
  gemini: {
    trivial:  { provider: 'gemini', id: 'gemini-2.5-flash-lite', approxCostPerMTokens: { input: 0.10, output: 0.40 } },
    simple:   { provider: 'gemini', id: 'gemini-2.5-flash-lite', approxCostPerMTokens: { input: 0.10, output: 0.40 } },
    medium:   { provider: 'gemini', id: 'gemini-2.5-flash',      approxCostPerMTokens: { input: 0.30, output: 2.50 } },
    complex:  { provider: 'gemini', id: 'gemini-2.5-flash',      approxCostPerMTokens: { input: 0.30, output: 2.50 } },
    critical: { provider: 'gemini', id: 'gemini-2.5-pro',        approxCostPerMTokens: { input: 1.25, output: 10.00 } },
  },
  anthropic: {
    trivial:  { provider: 'anthropic', id: 'claude-haiku-4-5',  approxCostPerMTokens: { input: 1.00, output: 5.00 } },
    simple:   { provider: 'anthropic', id: 'claude-haiku-4-5',  approxCostPerMTokens: { input: 1.00, output: 5.00 } },
    medium:   { provider: 'anthropic', id: 'claude-sonnet-4-5', approxCostPerMTokens: { input: 3.00, output: 15.00 } },
    complex:  { provider: 'anthropic', id: 'claude-sonnet-4-5', approxCostPerMTokens: { input: 3.00, output: 15.00 } },
    critical: { provider: 'anthropic', id: 'claude-opus-4-5',   approxCostPerMTokens: { input: 15.00, output: 75.00 } },
  },
  openai: {
    trivial:  { provider: 'openai', id: 'gpt-5-nano', approxCostPerMTokens: { input: 0.05, output: 0.40 } },
    simple:   { provider: 'openai', id: 'gpt-5-nano', approxCostPerMTokens: { input: 0.05, output: 0.40 } },
    medium:   { provider: 'openai', id: 'gpt-5-mini', approxCostPerMTokens: { input: 0.25, output: 2.00 } },
    complex:  { provider: 'openai', id: 'gpt-5',      approxCostPerMTokens: { input: 1.25, output: 10.00 } },
    critical: { provider: 'openai', id: 'gpt-5',      approxCostPerMTokens: { input: 1.25, output: 10.00 } },
  },
};

/**
 * Default fallback chain — the router walks this order until it finds a
 * provider with credentials.  Override per-call via `routeWithFallback`.
 */
const DEFAULT_FALLBACK_ORDER: ProviderId[] = ['gemini', 'anthropic', 'openai'];

export function isProviderAvailable(p: ProviderId): boolean {
  switch (p) {
    case 'gemini':    return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    case 'anthropic': return Boolean(process.env.ANTHROPIC_API_KEY);
    case 'openai':    return Boolean(process.env.OPENAI_API_KEY);
  }
}

/**
 * Returns the first available provider from `order` (or
 * `DEFAULT_FALLBACK_ORDER` if `order` is empty).
 *
 * Falls back to `gemini` if no env keys are present at all — keeps dev
 * environments working with a single key.
 */
export function pickProvider(tier: TaskTier, order: ProviderId[] = DEFAULT_FALLBACK_ORDER): ProviderModel {
  for (const p of order) {
    if (isProviderAvailable(p)) return PROVIDER_TIERS[p][tier];
  }
  return PROVIDER_TIERS.gemini[tier];
}

/**
 * Walks the fallback chain on errors. The caller passes an `attempt` callback
 * that performs the actual generation; on failure we move to the next provider.
 *
 * NOTE: this only handles transport-level failures (5xx, rate-limit). Quality
 * failures (e.g. content-policy refusal) are not retried — that's by design.
 */
export async function withProviderFallback<T>(
  tier: TaskTier,
  attempt: (model: ProviderModel) => Promise<T>,
  order: ProviderId[] = DEFAULT_FALLBACK_ORDER,
): Promise<{ result: T; usedProvider: ProviderId }> {
  const errors: Array<{ provider: ProviderId; error: unknown }> = [];
  for (const p of order) {
    if (!isProviderAvailable(p)) continue;
    const model = PROVIDER_TIERS[p][tier];
    try {
      const result = await attempt(model);
      return { result, usedProvider: p };
    } catch (e) {
      errors.push({ provider: p, error: e });
      // continue to next provider
    }
  }
  const summary = errors.map((e) => `${e.provider}: ${e.error instanceof Error ? e.error.message : String(e.error)}`).join(' | ');
  throw new Error(`[providers] all providers failed — ${summary || 'no providers configured'}`);
}

export const __FOR_TESTS = { PROVIDER_TIERS, DEFAULT_FALLBACK_ORDER };
