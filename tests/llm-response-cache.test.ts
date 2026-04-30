/**
 * Semantic-cache tests — exercise the cosine-similarity hit path with a
 * stubbed embeddings worker (no network).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { llmCacheGet, llmCacheSet, getLlmCacheStats, __resetLlmCache } from '../src/lib/llm/llm-response-cache';

const ORIGINAL_FETCH = globalThis.fetch;

function mockEmbed(vector: number[]): void {
  globalThis.fetch = vi.fn(async () => new Response(
    JSON.stringify({ embedding: vector }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )) as unknown as typeof fetch;
}

beforeEach(() => __resetLlmCache());
afterEach(() => { globalThis.fetch = ORIGINAL_FETCH; });

describe('semantic-cache', () => {
  it('returns null when the cache is empty', async () => {
    mockEmbed([1, 0, 0]);
    expect(await llmCacheGet('hello', 'b')).toBeNull();
  });

  it('returns a hit when similarity ≥ threshold (identical vectors)', async () => {
    mockEmbed([1, 0, 0]);
    await llmCacheSet('hello world', { text: 'hi' }, 'b');
    const got = await llmCacheGet<{ text: string }>('hello world', 'b');
    expect(got?.value.text).toBe('hi');
    expect(got?.similarity).toBeGreaterThanOrEqual(0.95);
  });

  it('isolates results across buckets', async () => {
    mockEmbed([1, 0, 0]);
    await llmCacheSet('hello', { text: 'A' }, 'agent-1');
    expect(await llmCacheGet('hello', 'agent-2')).toBeNull();
  });

  it('reports stats with the configured capacity', () => {
    const stats = getLlmCacheStats();
    expect(stats.capacity).toBeGreaterThan(0);
    expect(stats.threshold).toBeGreaterThan(0);
  });

  it('returns null when the embeddings worker is unreachable', async () => {
    globalThis.fetch = vi.fn(async () => { throw new Error('ECONNREFUSED'); }) as unknown as typeof fetch;
    expect(await llmCacheGet('hello', 'b')).toBeNull();
  });
});
