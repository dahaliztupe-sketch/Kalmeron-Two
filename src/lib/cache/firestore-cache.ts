/**
 * In-memory TTL cache — server-side, process-local.
 *
 * Replaces the former Firestore `_ai_cache` collection. A `Map` with expiry
 * timestamps is sufficient for AI response caching: resets on restart (fine),
 * zero latency on read/write, and no extra Firestore reads/writes per request.
 *
 * Design decisions:
 * - Keys are caller-defined strings (use buildKey() for consistent namespacing).
 * - Expired entries are returned as misses; stale entries are pruned lazily.
 * - All errors are swallowed — cache must never break the caller.
 * - No distributed lock: two concurrent cold-starts may both compute; last
 *   write wins, which is acceptable for AI-generated content.
 */

import { createHash } from 'crypto';

interface CacheCell<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

const _store = new Map<string, CacheCell<unknown>>();

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

/**
 * Build a namespaced, URL-safe cache key.
 * e.g. buildKey('daily-brief', userId, date) → "daily-brief:abc123:2026-05-03"
 */
export function buildKey(...parts: string[]): string {
  return parts.map((p) => p.replace(/[^a-zA-Z0-9_\-:.]/g, '_')).join(':');
}

/**
 * Hash arbitrary inputs into a short, stable cache key component.
 * Useful for POST bodies where the inputs are user-supplied strings.
 */
export function hashInputs(...inputs: string[]): string {
  return createHash('sha256').update(inputs.join('|')).digest('hex').slice(0, 16);
}

/**
 * Read a cached value. Returns null on miss or expiry.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const cell = _store.get(key) as CacheCell<T> | undefined;
    if (!cell) return null;
    if (Date.now() > cell.expiresAt) {
      _store.delete(key);
      return null;
    }
    cell.hits += 1;
    return cell.value;
  } catch {
    return null;
  }
}

/**
 * Write a value to the cache with a TTL in milliseconds.
 */
export async function cacheSet<T>(key: string, value: T, ttlMs: number): Promise<void> {
  try {
    const now = Date.now();
    _store.set(key, { value, createdAt: now, expiresAt: now + ttlMs, hits: 0 });
  } catch {
    // swallow
  }
}

/**
 * get-or-compute helper.
 *
 * Usage:
 *   const result = await withCache('my-key', 6 * 3600_000, () => expensiveFn());
 *
 * @param key     Cache key (use buildKey / hashInputs)
 * @param ttlMs   Time-to-live in milliseconds
 * @param compute Function that produces the value on a cache miss
 * @returns       Cached or freshly computed value
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>,
): Promise<{ value: T; hit: boolean }> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return { value: cached, hit: true };
  }

  const value = await compute();
  await cacheSet(key, value, ttlMs);
  return { value, hit: false };
}

export const TTL = {
  ONE_HOUR:       1 * 60 * 60_000,
  SIX_HOURS:      6 * 60 * 60_000,
  TWELVE_HOURS:  12 * 60 * 60_000,
  ONE_DAY:       24 * 60 * 60_000,
  THREE_DAYS:    72 * 60 * 60_000,
} as const;
