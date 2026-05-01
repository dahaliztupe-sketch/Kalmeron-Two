// @ts-nocheck
/**
 * router-cache — Hybrid panel-router with embedding-based memoization.
 *
 * Strategy (Phase B5):
 *   1) Hash-keyed exact-match cache (zero-cost lookup) for identical queries.
 *   2) Embedding-keyed nearest-neighbour cache: if a previously-seen message
 *      has cosine similarity ≥ SIM_THRESHOLD with the new one, we reuse its
 *      route. This catches paraphrases like "كيف أحسب الضريبة؟" vs
 *      "ازاي أحسب الضرائب على دخلي؟" without burning a LITE call.
 *   3) On miss, we delegate to the original LITE router and store the result
 *      keyed by both the raw text and its embedding.
 *
 * The cache is in-memory + bounded (500 entries, LRU-ish via insertion order)
 * so it can never leak unbounded memory in long-running serverless instances.
 *
 * P50 latency target on cache hit: < 200ms (no LLM call → just cosine math).
 */

import { embedOne } from '@/src/lib/embed-helper';
import { routePanel as routePanelLite } from './router';
import type { PanelRoute } from './types';

const MAX_ENTRIES = 500;
const SIM_THRESHOLD = 0.92; // tuned for Arabic/English paraphrases on gemini-embedding-001

interface CacheEntry {
  text: string;
  agentName: string;
  embedding: number[] | null;
  route: PanelRoute;
  hits: number;
  ts: number;
}

const exactCache = new Map<string, CacheEntry>(); // key: `${agentName}::${text}`
const embeddingCache: CacheEntry[] = [];

interface RouteCacheStats {
  totalCalls: number;
  exactHits: number;
  semanticHits: number;
  misses: number;
  lastLatencyMs: number;
}

const stats: RouteCacheStats = {
  totalCalls: 0,
  exactHits: 0,
  semanticHits: 0,
  misses: 0,
  lastLatencyMs: 0,
};

export function getRouterCacheStats(): RouteCacheStats & {
  hitRatio: number;
  size: number;
} {
  const hits = stats.exactHits + stats.semanticHits;
  return {
    ...stats,
    hitRatio: stats.totalCalls ? hits / stats.totalCalls : 0,
    size: embeddingCache.length,
  };
}

export function clearRouterCache(): void {
  exactCache.clear();
  embeddingCache.length = 0;
  stats.totalCalls = 0;
  stats.exactHits = 0;
  stats.semanticHits = 0;
  stats.misses = 0;
  stats.lastLatencyMs = 0;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function evictIfNeeded(): void {
  if (embeddingCache.length <= MAX_ENTRIES) return;
  // Evict the lowest-hits entry (simple LFU with FIFO tie-break).
  let worstIdx = 0;
  for (let i = 1; i < embeddingCache.length; i++) {
    if (embeddingCache[i].hits < embeddingCache[worstIdx].hits) worstIdx = i;
  }
  const removed = embeddingCache.splice(worstIdx, 1)[0];
  exactCache.delete(`${removed.agentName}::${removed.text}`);
}

async function safeEmbed(text: string): Promise<number[] | null> {
  try {
    return await embedOne(text.slice(0, 2000));
  } catch {
    return null;
  }
}

/**
 * Drop-in replacement for `routePanel` with embedding-based memoization.
 * Falls back to the original LITE-router on miss or embed failure.
 */
export async function routePanelHybrid(
  agentName: string,
  userMessage: string,
  uiContext?: unknown,
): Promise<PanelRoute & { _cache?: 'exact' | 'semantic' | 'miss' }> {
  const t0 = Date.now();
  stats.totalCalls += 1;
  const trimmed = userMessage.trim();

  // 1) Exact match.
  const exactKey = `${agentName}::${trimmed}`;
  const exactHit = exactCache.get(exactKey);
  if (exactHit) {
    exactHit.hits += 1;
    stats.exactHits += 1;
    stats.lastLatencyMs = Date.now() - t0;
    return { ...exactHit.route, _cache: 'exact' };
  }

  // 2) Semantic match (only if we have at least one prior entry).
  let queryEmbedding: number[] | null = null;
  if (embeddingCache.length > 0) {
    queryEmbedding = await safeEmbed(trimmed);
    if (queryEmbedding) {
      let bestIdx = -1;
      let bestSim = SIM_THRESHOLD;
      for (let i = 0; i < embeddingCache.length; i++) {
        const e = embeddingCache[i];
        if (e.agentName !== agentName || !e.embedding) continue;
        const sim = cosine(queryEmbedding, e.embedding);
        if (sim > bestSim) {
          bestSim = sim;
          bestIdx = i;
        }
      }
      if (bestIdx >= 0) {
        const hit = embeddingCache[bestIdx];
        hit.hits += 1;
        stats.semanticHits += 1;
        stats.lastLatencyMs = Date.now() - t0;
        return { ...hit.route, _cache: 'semantic' };
      }
    }
  }

  // 3) Miss → real LITE router, then memoize.
  const route = await routePanelLite(agentName, trimmed, uiContext);
  stats.misses += 1;
  stats.lastLatencyMs = Date.now() - t0;
  // Embed lazily if we didn't already (so we don't pay on every miss when
  // EMBEDDING is unreachable — a null embedding still gets stored as exact-only).
  if (!queryEmbedding) queryEmbedding = await safeEmbed(trimmed);
  const entry: CacheEntry = {
    text: trimmed,
    agentName,
    embedding: queryEmbedding,
    route,
    hits: 0,
    ts: Date.now(),
  };
  exactCache.set(exactKey, entry);
  embeddingCache.push(entry);
  evictIfNeeded();
  return { ...route, _cache: 'miss' };
}
