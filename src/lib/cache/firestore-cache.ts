/**
 * FirestoreCache — TTL-based server-side cache backed by Firestore.
 *
 * Layout in Firestore:
 *   _ai_cache/{key}
 *     value   : string  (JSON-serialised payload)
 *     expiresAt: number  (Unix ms)
 *     createdAt: number  (Unix ms)
 *     hits     : number  (optional — incremented on read)
 *
 * Design decisions:
 * - Keys are caller-defined strings (use buildKey() for consistent namespacing).
 * - Expired documents are returned as misses; a background write prunes them.
 * - All I/O errors are swallowed and logged — cache must never break the caller.
 * - No distributed lock: two concurrent cold-starts may both generate and write;
 *   the last write wins, which is acceptable for AI-generated content.
 */

import { createHash } from 'crypto';
import { adminDb } from '@/src/lib/firebase-admin';
import { logger } from '@/src/lib/logger';

const COLLECTION = '_ai_cache';

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
 * Read a cached value. Returns null on miss, expiry, or any error.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(key).get();
    if (!doc.exists) return null;

    const data = doc.data() as { value: string; expiresAt: number; hits: number };
    if (Date.now() > data.expiresAt) {
      doc.ref.delete().catch(() => {});
      return null;
    }

    doc.ref.update({ hits: (data.hits || 0) + 1 }).catch(() => {});
    return JSON.parse(data.value) as T;
  } catch (err) {
    logger.warn({ event: 'cache_get_error', key, error: (err as Error).message });
    return null;
  }
}

/**
 * Write a value to the cache with a TTL in milliseconds.
 */
export async function cacheSet<T>(key: string, value: T, ttlMs: number): Promise<void> {
  try {
    const now = Date.now();
    await adminDb.collection(COLLECTION).doc(key).set({
      value: JSON.stringify(value),
      createdAt: now,
      expiresAt: now + ttlMs,
      hits: 0,
    });
  } catch (err) {
    logger.warn({ event: 'cache_set_error', key, error: (err as Error).message });
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
