/**
 * Multi-Provider LLM Abstraction — Kalmeron Two
 * --------------------------------------------------------------
 * Implements the "Provider hedging" plan (P0-1) from the 45-expert
 * business audit (`docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`).
 *
 * Goals:
 *   1. Decouple agent code from a single provider (Gemini today).
 *   2. Offer a deterministic fallback chain when the primary errors out.
 *   3. Keep the API edge-friendly (no SDK eagerly loaded).
 *   4. Prefer FREE tiers (OpenRouter free models, Groq free, Gemini Studio
 *      free) before any paid endpoint kicks in.
 *
 * Providers are *capability-tier-mapped*, not 1:1 — see
 * `src/lib/model-router.ts` for tier definitions.
 *
 * Anthropic & OpenAI adapters are intentionally lazy: we don't import
 * their SDKs until the env keys are present, so build size stays flat.
 */
import type { TaskTier } from '@/src/lib/model-router';

export type ProviderId = 'gemini' | 'openrouter' | 'groq' | 'anthropic' | 'openai';

/**
 * Capability flags surface model-level constraints to the router so it can
 * skip a provider when the task needs a feature it does not support
 * (e.g. vision input, JSON-mode output, tool-calling, streaming).
 */
export interface ProviderCapabilities {
  vision: boolean;
  json: boolean;
  tools: boolean;
  streaming: boolean;
}

export interface ProviderModel {
  provider: ProviderId;
  id: string;
  approxCostPerMTokens: { input: number; output: number };
  capabilities: ProviderCapabilities;
  /** True when the model is offered on a $0/free tier (e.g. `:free` on OpenRouter). */
  free?: boolean;
}

const FULL: ProviderCapabilities = { vision: true, json: true, tools: true, streaming: true };
const TEXT_JSON_TOOLS: ProviderCapabilities = { vision: false, json: true, tools: true, streaming: true };
const TEXT_STREAM_ONLY: ProviderCapabilities = { vision: false, json: false, tools: false, streaming: true };

/**
 * Provider tier mapping. Add new providers here; the router will pick the
 * first available one in `FALLBACK_ORDER`.
 *
 * Cost tip: OpenRouter `:free` models cost $0 but are rate-limited (~20/min
 * per key). They are perfect for development and trivial/simple production
 * tiers; we degrade to paid providers only for medium+.
 */
const PROVIDER_TIERS: Record<ProviderId, Record<TaskTier, ProviderModel>> = {
  gemini: {
    trivial:  { provider: 'gemini', id: 'gemini-2.5-flash-lite', approxCostPerMTokens: { input: 0.10, output: 0.40 }, capabilities: FULL },
    simple:   { provider: 'gemini', id: 'gemini-2.5-flash-lite', approxCostPerMTokens: { input: 0.10, output: 0.40 }, capabilities: FULL },
    medium:   { provider: 'gemini', id: 'gemini-2.5-flash',      approxCostPerMTokens: { input: 0.30, output: 2.50 },  capabilities: FULL },
    complex:  { provider: 'gemini', id: 'gemini-2.5-flash',      approxCostPerMTokens: { input: 0.30, output: 2.50 },  capabilities: FULL },
    critical: { provider: 'gemini', id: 'gemini-2.5-pro',        approxCostPerMTokens: { input: 1.25, output: 10.00 }, capabilities: FULL },
  },
  openrouter: {
    // FREE tier — DeepSeek + Llama on OpenRouter cost $0 with rate limits.
    trivial:  { provider: 'openrouter', id: 'meta-llama/llama-3.3-70b-instruct:free', approxCostPerMTokens: { input: 0,    output: 0    }, capabilities: TEXT_JSON_TOOLS, free: true },
    simple:   { provider: 'openrouter', id: 'meta-llama/llama-3.3-70b-instruct:free', approxCostPerMTokens: { input: 0,    output: 0    }, capabilities: TEXT_JSON_TOOLS, free: true },
    medium:   { provider: 'openrouter', id: 'deepseek/deepseek-r1:free',              approxCostPerMTokens: { input: 0,    output: 0    }, capabilities: TEXT_JSON_TOOLS, free: true },
    // Paid above medium (when caller needs vision/tools or top quality).
    complex:  { provider: 'openrouter', id: 'anthropic/claude-sonnet-4.5',            approxCostPerMTokens: { input: 3.00, output: 15.00 }, capabilities: FULL },
    critical: { provider: 'openrouter', id: 'anthropic/claude-opus-4.5',              approxCostPerMTokens: { input: 15.00, output: 75.00 }, capabilities: FULL },
  },
  groq: {
    // Groq free tier: extremely fast (300+ tok/s) but rate-limited.
    trivial:  { provider: 'groq', id: 'llama-3.1-8b-instant',     approxCostPerMTokens: { input: 0, output: 0 }, capabilities: TEXT_STREAM_ONLY, free: true },
    simple:   { provider: 'groq', id: 'llama-3.3-70b-versatile',  approxCostPerMTokens: { input: 0, output: 0 }, capabilities: TEXT_JSON_TOOLS,  free: true },
    medium:   { provider: 'groq', id: 'llama-3.3-70b-versatile',  approxCostPerMTokens: { input: 0, output: 0 }, capabilities: TEXT_JSON_TOOLS,  free: true },
    complex:  { provider: 'groq', id: 'llama-3.3-70b-versatile',  approxCostPerMTokens: { input: 0, output: 0 }, capabilities: TEXT_JSON_TOOLS,  free: true },
    critical: { provider: 'groq', id: 'llama-3.3-70b-versatile',  approxCostPerMTokens: { input: 0, output: 0 }, capabilities: TEXT_JSON_TOOLS,  free: true },
  },
  anthropic: {
    trivial:  { provider: 'anthropic', id: 'claude-haiku-4-5',  approxCostPerMTokens: { input: 1.00, output: 5.00 },  capabilities: FULL },
    simple:   { provider: 'anthropic', id: 'claude-haiku-4-5',  approxCostPerMTokens: { input: 1.00, output: 5.00 },  capabilities: FULL },
    medium:   { provider: 'anthropic', id: 'claude-sonnet-4-5', approxCostPerMTokens: { input: 3.00, output: 15.00 }, capabilities: FULL },
    complex:  { provider: 'anthropic', id: 'claude-sonnet-4-5', approxCostPerMTokens: { input: 3.00, output: 15.00 }, capabilities: FULL },
    critical: { provider: 'anthropic', id: 'claude-opus-4-5',   capabilities: FULL, approxCostPerMTokens: { input: 15.00, output: 75.00 } },
  },
  openai: {
    trivial:  { provider: 'openai', id: 'gpt-5-nano', approxCostPerMTokens: { input: 0.05, output: 0.40 }, capabilities: FULL },
    simple:   { provider: 'openai', id: 'gpt-5-nano', approxCostPerMTokens: { input: 0.05, output: 0.40 }, capabilities: FULL },
    medium:   { provider: 'openai', id: 'gpt-5-mini', approxCostPerMTokens: { input: 0.25, output: 2.00 }, capabilities: FULL },
    complex:  { provider: 'openai', id: 'gpt-5',      approxCostPerMTokens: { input: 1.25, output: 10.00 }, capabilities: FULL },
    critical: { provider: 'openai', id: 'gpt-5',      approxCostPerMTokens: { input: 1.25, output: 10.00 }, capabilities: FULL },
  },
};

/**
 * Default fallback chain — the router walks this order until it finds a
 * provider with credentials.  Override per-call via `routeWithFallback` or
 * globally via `KALMERON_PROVIDER_ORDER` env (comma-separated).
 *
 * Order rationale: Gemini Studio free → OpenRouter free → Groq free →
 * Anthropic paid → OpenAI paid. Free tiers come first so cost stays at $0
 * until the caller explicitly opts into a paid model.
 */
const DEFAULT_FALLBACK_ORDER: ProviderId[] = ['gemini', 'openrouter', 'groq', 'anthropic', 'openai'];

export function isProviderAvailable(p: ProviderId): boolean {
  switch (p) {
    case 'gemini':
      return Boolean(
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        // Replit AI Integrations proxy works as a Gemini provider too.
        (process.env.AI_INTEGRATIONS_GEMINI_API_KEY && process.env.AI_INTEGRATIONS_GEMINI_BASE_URL)
      );
    case 'openrouter': return Boolean(process.env.OPENROUTER_API_KEY);
    case 'groq':       return Boolean(process.env.GROQ_API_KEY);
    case 'anthropic':  return Boolean(process.env.ANTHROPIC_API_KEY);
    case 'openai':     return Boolean(process.env.OPENAI_API_KEY);
  }
}

export function getProviderModel(provider: ProviderId, tier: TaskTier): ProviderModel {
  return PROVIDER_TIERS[provider][tier];
}

/**
 * Capability filter — narrow the fallback list to providers whose tier model
 * supports every required capability. When `requiredCaps` is omitted (or all
 * flags are false), every provider passes.
 */
function meetsCapabilities(model: ProviderModel, required?: Partial<ProviderCapabilities>): boolean {
  if (!required) return true;
  const caps = model.capabilities;
  return (!required.vision    || caps.vision) &&
         (!required.json      || caps.json) &&
         (!required.tools     || caps.tools) &&
         (!required.streaming || caps.streaming);
}

/**
 * Returns the first available provider from `order` (or
 * `DEFAULT_FALLBACK_ORDER` if `order` is empty) whose tier model meets the
 * requested capabilities.
 *
 * Falls back to `gemini` if no env keys are present at all — keeps dev
 * environments working with a single key.
 */
export function pickProvider(
  tier: TaskTier,
  order: ProviderId[] = DEFAULT_FALLBACK_ORDER,
  requiredCaps?: Partial<ProviderCapabilities>,
): ProviderModel {
  for (const p of order) {
    if (!isProviderAvailable(p)) continue;
    const model = PROVIDER_TIERS[p][tier];
    if (!meetsCapabilities(model, requiredCaps)) continue;
    return model;
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
  requiredCaps?: Partial<ProviderCapabilities>,
): Promise<{ result: T; usedProvider: ProviderId }> {
  // Lazy import keeps the circuit-breaker module out of bundles that never
  // call into the multi-provider router (e.g. simple Gemini-only edge routes).
  const { isProviderOpen, recordSuccess, recordFailure } = await import('./circuit-breaker');
  const errors: Array<{ provider: ProviderId; error: unknown }> = [];
  for (const p of order) {
    if (!isProviderAvailable(p)) continue;
    if (isProviderOpen(p)) {
      errors.push({ provider: p, error: new Error('circuit_open') });
      continue;
    }
    const model = PROVIDER_TIERS[p][tier];
    if (!meetsCapabilities(model, requiredCaps)) continue;
    try {
      const result = await attempt(model);
      recordSuccess(p);
      return { result, usedProvider: p };
    } catch (e) {
      recordFailure(p, e);
      errors.push({ provider: p, error: e });
      // continue to next provider
    }
  }
  const summary = errors
    .map((e) => `${e.provider}: ${e.error instanceof Error ? e.error.message : String(e.error)}`)
    .join(' | ');
  throw new Error(`[providers] all providers failed — ${summary || 'no providers configured'}`);
}

/**
 * List every provider whose env credentials are configured. Used by the
 * admin dashboard, audit module, and the Token Meter UI.
 */
export function listAvailableProviders(): ProviderId[] {
  return (Object.keys(PROVIDER_TIERS) as ProviderId[]).filter(isProviderAvailable);
}

export const __FOR_TESTS = { PROVIDER_TIERS, DEFAULT_FALLBACK_ORDER };
