/**
 * Prompt Cache — Kalmeron Two
 * --------------------------------------------------------------
 * Implements P0-2 (Prompt Cache + Multi-Model Routing) from the
 * 45-expert business audit. Targets the hot-path classes of prompts
 * that repeat across users:
 *   - System prompts (long, identical, expensive on Anthropic/Gemini Pro).
 *   - Top-N FAQ-style user questions ("ما هو كلميرون؟", etc.).
 *   - Onboarding scripted prompts that the receptionist re-issues.
 *
 * Two layers:
 *   L1: in-memory LRU (per-process, sub-ms hit, capped at 500 entries).
 *   L2: Firestore `prompt_cache` (cross-process, capped TTL = 24h).
 *
 * Both layers are *strict by hash* — the key is the SHA-256 of
 * (provider | model | tier | normalized-prompt). We never collapse
 * semantically-similar prompts; that would require an embedding lookup
 * which we'll add in P1 (RAG Lite).
 */
import { createHash } from 'node:crypto';

export interface CacheKeyParts {
  provider: string;
  model: string;
  tier: string;
  prompt: string;
  /** Optional namespace, e.g. agent name — keeps caches isolated. */
  scope?: string;
}

export interface CachedResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
  storedAt: number;
}

/**
 * Normalize a prompt to maximize cache-hit rate without losing meaning:
 *  - trim
 *  - collapse whitespace
 *  - lowercase ASCII only (Arabic preserved)
 */
function normalizePrompt(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[A-Z]/g, (c) => c.toLowerCase());
}

export function cacheKey(parts: CacheKeyParts): string {
  const norm = normalizePrompt(parts.prompt);
  const raw = `${parts.scope ?? '_'}|${parts.provider}|${parts.model}|${parts.tier}|${norm}`;
  return createHash('sha256').update(raw).digest('hex');
}

// ─────────────────────────────────────────────
// L1: in-memory LRU
// ─────────────────────────────────────────────

const L1_MAX_ENTRIES = 500;
const L1_TTL_MS = 6 * 60 * 60 * 1000; // 6h

interface LruEntry {
  value: CachedResponse;
  expiresAt: number;
}

const lru = new Map<string, LruEntry>();

function lruGet(key: string): CachedResponse | null {
  const entry = lru.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    lru.delete(key);
    return null;
  }
  // refresh recency
  lru.delete(key);
  lru.set(key, entry);
  return entry.value;
}

function lruSet(key: string, value: CachedResponse): void {
  if (lru.size >= L1_MAX_ENTRIES) {
    const oldest = lru.keys().next().value;
    if (oldest) lru.delete(oldest);
  }
  lru.set(key, { value, expiresAt: Date.now() + L1_TTL_MS });
}

// ─────────────────────────────────────────────
// L2: Firestore (lazy, fire-and-forget on writes)
// ─────────────────────────────────────────────

const L2_TTL_MS = 24 * 60 * 60 * 1000;

async function l2Get(key: string): Promise<CachedResponse | null> {
  try {
    const { adminDb } = await import('@/src/lib/firebase-admin');
    const snap = await adminDb.collection('prompt_cache').doc(key).get();
    if (!snap.exists) return null;
    const data = snap.data() as CachedResponse | undefined;
    if (!data) return null;
    if (Date.now() - data.storedAt > L2_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function l2Set(key: string, value: CachedResponse): void {
  // fire-and-forget — never block the request path
  void (async () => {
    try {
      const { adminDb } = await import('@/src/lib/firebase-admin');
      await adminDb.collection('prompt_cache').doc(key).set(value);
    } catch {
      /* swallow — cache writes are best-effort */
    }
  })();
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export async function getCachedPrompt(parts: CacheKeyParts): Promise<CachedResponse | null> {
  const key = cacheKey(parts);
  const l1 = lruGet(key);
  if (l1) return l1;
  const l2 = await l2Get(key);
  if (l2) {
    lruSet(key, l2);
    return l2;
  }
  return null;
}

export function setCachedPrompt(parts: CacheKeyParts, value: Omit<CachedResponse, 'storedAt'>): void {
  const key = cacheKey(parts);
  const stored: CachedResponse = { ...value, storedAt: Date.now() };
  lruSet(key, stored);
  l2Set(key, stored);
}

/** Stats helper for the admin cost dashboard. */
export function getCacheStats(): { l1Size: number; l1Max: number } {
  return { l1Size: lru.size, l1Max: L1_MAX_ENTRIES };
}

/** Clears L1 only — use from tests or admin debug endpoint. */
export function _clearL1(): void {
  lru.clear();
}
