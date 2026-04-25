/**
 * Typed client for the local embeddings sidecar (`services/embeddings-worker`).
 *
 * Conventions:
 *   - Never throws — discriminated `{ ok: false, reason }`.
 *   - Zod-validated responses.
 *   - Reads `EMBEDDINGS_WORKER_URL` (default `http://localhost:8099`).
 *   - Callers should fall back to their existing Gemini path when this
 *     returns `{ ok: false }`.
 */

import { z } from 'zod';

export const EmbedOneSchema = z.object({
  model: z.string(),
  dim: z.number().int().positive(),
  vector: z.array(z.number()),
  elapsed_ms: z.number(),
  cached: z.boolean().optional(),
});
export type EmbedOne = z.infer<typeof EmbedOneSchema>;

export const EmbedBatchSchema = z.object({
  model: z.string(),
  dim: z.number().int().positive(),
  vectors: z.array(z.array(z.number())),
  count: z.number().int().nonnegative(),
  elapsed_ms: z.number(),
});
export type EmbedBatch = z.infer<typeof EmbedBatchSchema>;

export const SimilaritySchema = z.object({
  model: z.string(),
  cosine: z.number().min(-1).max(1),
});
export type SimilarityResult = z.infer<typeof SimilaritySchema>;

type Ok<T> = { ok: true; data: T };
type Err = {
  ok: false;
  reason: 'unreachable' | 'http_error' | 'invalid_response' | 'timeout';
  status?: number;
  message?: string;
};
export type EmbedResult<T> = Ok<T> | Err;

const DEFAULT_TIMEOUT_MS = 30_000;  // first call may include model download

function baseUrl(override?: string): string {
  return ((override ?? process.env.EMBEDDINGS_WORKER_URL ?? 'http://localhost:8099').trim()).replace(/\/+$/, '');
}

async function call<T>(
  endpoint: string,
  body: Record<string, unknown>,
  schema: z.ZodType<T>,
  opts: { workerUrl?: string; timeoutMs?: number } = {},
): Promise<EmbedResult<T>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl(opts.workerUrl)}${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { ok: false, reason: 'http_error', status: res.status, message: (await res.text()).slice(0, 500) };
    }
    const parsed = schema.safeParse(await res.json());
    if (!parsed.success) return { ok: false, reason: 'invalid_response', message: parsed.error.message };
    return { ok: true, data: parsed.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if ((err as { name?: string })?.name === 'AbortError') {
      return { ok: false, reason: 'timeout', message };
    }
    return { ok: false, reason: 'unreachable', message };
  } finally {
    clearTimeout(t);
  }
}

export function embedOne(text: string, opts?: { workerUrl?: string; timeoutMs?: number }) {
  return call('/embed', { text }, EmbedOneSchema, opts);
}

export function embedBatch(texts: string[], opts?: { workerUrl?: string; timeoutMs?: number }) {
  return call('/embed/batch', { texts }, EmbedBatchSchema, opts);
}

export function localCosine(a: string, b: string, opts?: { workerUrl?: string; timeoutMs?: number }) {
  return call('/similarity', { a, b }, SimilaritySchema, opts);
}

export async function isEmbeddingsWorkerHealthy(opts: { workerUrl?: string; timeoutMs?: number } = {}): Promise<{
  healthy: boolean;
  modelLoaded?: boolean;
  modelDim?: number;
}> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 2_000);
  try {
    const res = await fetch(`${baseUrl(opts.workerUrl)}/health`, { signal: ctrl.signal });
    if (!res.ok) return { healthy: false };
    const body = (await res.json()) as { ok?: boolean; model_loaded?: boolean; model_dim?: number | null };
    return {
      healthy: body?.ok === true,
      modelLoaded: body?.model_loaded === true,
      modelDim: body?.model_dim ?? undefined,
    };
  } catch {
    return { healthy: false };
  } finally {
    clearTimeout(t);
  }
}
