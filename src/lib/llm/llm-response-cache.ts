/**
 * LLM response cache — short-circuits identical-meaning prompts.
 *
 * Distinct from `semantic-cache.ts`:
 *   • `semantic-cache.ts` is a Firestore-backed L1+L2 cache used by the
 *     pre-existing semantic prompt layer (with a pluggable embedder).
 *   • This module is a *gateway-side* response cache used only by the new
 *     `safeGenerateTextSmart` API. It calls the local Embeddings Worker
 *     directly, so it works in environments without Firestore or Gemini
 *     embeddings access (e.g. when the only configured provider is Groq).
 *
 * Pipeline:
 *   1. Embed the incoming prompt via the Embeddings Worker (port 8099).
 *   2. Compare against an in-memory LRU of recent (embedding, response) pairs.
 *   3. If best cosine similarity ≥ {THRESHOLD}, return the cached response.
 *
 * The cache is intentionally process-local: in serverless we want minimum
 * cold-start latency and no inter-instance fanout traffic. A miss that
 * later succeeds populates the cache for the *current* instance only —
 * this bounds maximum staleness without external invalidation.
 */
const THRESHOLD = Number(process.env.LLM_CACHE_SIM_THRESHOLD ?? '0.95');
const CAPACITY = Number(process.env.LLM_CACHE_CAPACITY ?? '500');
const TTL_MS = Number(process.env.LLM_CACHE_TTL_MS ?? `${30 * 60_000}`); // 30 min
const EMBEDDINGS_URL = (process.env.EMBEDDINGS_URL || 'http://localhost:8099').replace(/\/$/, '');

interface CacheEntry<T> {
  ts: number;
  prompt: string;
  embedding: number[];
  value: T;
  bucket: string;
}

const STORE: Array<CacheEntry<unknown>> = [];

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}

async function embed(text: string): Promise<number[] | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(`${EMBEDDINGS_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = (await res.json()) as { embedding?: number[] };
    return Array.isArray(data.embedding) ? data.embedding : null;
  } catch {
    return null;
  }
}

function evictExpired(): void {
  const now = Date.now();
  for (let i = STORE.length - 1; i >= 0; i--) {
    if (now - STORE[i].ts > TTL_MS) STORE.splice(i, 1);
  }
}

/**
 * Look up a semantically-equivalent cached response.
 * Returns `null` when no entry crosses the similarity threshold or when
 * the embeddings worker is unavailable (so the caller falls through to the
 * real LLM path).
 */
export async function llmCacheGet<T>(
  prompt: string,
  bucket = 'default',
): Promise<{ value: T; similarity: number } | null> {
  evictExpired();
  if (STORE.length === 0) return null;
  const emb = await embed(prompt);
  if (!emb) return null;

  let best: { value: T; similarity: number } | null = null;
  for (const entry of STORE) {
    if (entry.bucket !== bucket) continue;
    const sim = cosine(emb, entry.embedding);
    if (sim >= THRESHOLD && (!best || sim > best.similarity)) {
      best = { value: entry.value as T, similarity: sim };
    }
  }
  return best;
}

/** Insert / update an entry. The bucket lets callers segment caches per-agent. */
export async function llmCacheSet<T>(
  prompt: string,
  value: T,
  bucket = 'default',
): Promise<void> {
  const emb = await embed(prompt);
  if (!emb) return;
  STORE.push({ ts: Date.now(), prompt, embedding: emb, value, bucket });
  while (STORE.length > CAPACITY) STORE.shift();
}

export function getLlmCacheStats(): { entries: number; capacity: number; threshold: number; ttlMs: number } {
  return { entries: STORE.length, capacity: CAPACITY, threshold: THRESHOLD, ttlMs: TTL_MS };
}

/** Test-only — wipe the cache. */
export function __resetLlmCache(): void {
  STORE.splice(0, STORE.length);
}
