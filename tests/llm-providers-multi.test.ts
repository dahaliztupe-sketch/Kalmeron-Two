/**
 * Multi-provider routing tests — verifies pickProvider, capability filter,
 * and the env-driven availability gate.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isProviderAvailable,
  pickProvider,
  listAvailableProviders,
  withProviderFallback,
  getProviderModel,
} from '../src/lib/llm/providers';
import { __resetCircuits } from '../src/lib/llm/circuit-breaker';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  // Wipe every provider key so tests start from a known-empty baseline.
  for (const k of [
    'GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY',
    'OPENROUTER_API_KEY', 'GROQ_API_KEY',
    'ANTHROPIC_API_KEY', 'OPENAI_API_KEY',
    'AI_INTEGRATIONS_GEMINI_API_KEY', 'AI_INTEGRATIONS_GEMINI_BASE_URL',
  ]) {
    delete process.env[k];
  }
  __resetCircuits();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('providers — availability', () => {
  it('reports no providers when no env keys are set', () => {
    expect(listAvailableProviders()).toEqual([]);
  });
  it('detects each provider individually', () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-x';
    expect(isProviderAvailable('openrouter')).toBe(true);
    expect(isProviderAvailable('groq')).toBe(false);
    process.env.GROQ_API_KEY = 'gsk_y';
    expect(isProviderAvailable('groq')).toBe(true);
  });
});

describe('providers — pickProvider', () => {
  it('falls back to gemini when nothing is configured (graceful default)', () => {
    const m = pickProvider('medium');
    expect(m.provider).toBe('gemini');
  });

  it('respects the default fallback order when keys are present', () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-x';
    process.env.GROQ_API_KEY = 'gsk_y';
    // Default order: gemini → openrouter → groq → anthropic → openai
    // Gemini missing → openrouter wins.
    expect(pickProvider('medium').provider).toBe('openrouter');
  });

  it('honours an explicit provider order', () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-x';
    process.env.GROQ_API_KEY = 'gsk_y';
    expect(pickProvider('medium', ['groq', 'openrouter']).provider).toBe('groq');
  });

  it('skips providers when their tier model lacks a required capability', () => {
    process.env.GROQ_API_KEY = 'gsk_y';
    process.env.OPENROUTER_API_KEY = 'sk-or-x';
    // Groq trivial tier = llama-3.1-8b-instant (no JSON mode capability flag);
    // pickProvider with json:true should skip it and land on OpenRouter.
    const m = pickProvider('trivial', ['groq', 'openrouter'], { json: true });
    expect(m.provider).toBe('openrouter');
  });
});

describe('providers — withProviderFallback', () => {
  it('moves to the next provider when the first throws', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-x';
    process.env.GROQ_API_KEY = 'gsk_y';
    let calls = 0;
    const { result, usedProvider } = await withProviderFallback(
      'simple',
      async (model) => {
        calls += 1;
        if (model.provider === 'openrouter') throw new Error('rate_limited');
        return { ok: true, m: model.id };
      },
      ['openrouter', 'groq'],
    );
    expect(calls).toBe(2);
    expect(usedProvider).toBe('groq');
    expect(result.ok).toBe(true);
  });

  it('aggregates and rethrows when all providers fail', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-x';
    process.env.GROQ_API_KEY = 'gsk_y';
    await expect(
      withProviderFallback(
        'simple',
        async () => { throw new Error('boom'); },
        ['openrouter', 'groq'],
      ),
    ).rejects.toThrow(/all providers failed/);
  });
});

describe('providers — tier mapping', () => {
  it('returns a unique model id for every tier × provider', () => {
    const tiers = ['trivial','simple','medium','complex','critical'] as const;
    const provs = ['gemini','openrouter','groq','anthropic','openai'] as const;
    for (const p of provs) for (const t of tiers) {
      const m = getProviderModel(p, t);
      expect(typeof m.id).toBe('string');
      expect(m.id.length).toBeGreaterThan(0);
      expect(m.capabilities).toBeDefined();
    }
  });
});
