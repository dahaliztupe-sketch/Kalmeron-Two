/**
 * Typed client for the Python PDF worker (`services/pdf-worker`).
 *
 * Design contract:
 *   - Never throws on its own — returns `{ ok: false }` on every failure mode
 *     so callers can fall back to the in-process `pdf-parse` path.
 *   - Validates the worker's response shape with Zod; an unexpected payload
 *     is treated the same as a network error.
 *   - Honours `PDF_WORKER_URL` at runtime (defaults to localhost:5004) so the
 *     same code works in dev, in Replit, and against a remote Cloud Run URL
 *     in production.
 */

import { z } from 'zod';

export const PdfChunkSchema = z.object({
  text: z.string(),
  charCount: z.number().int().nonnegative(),
  pageHint: z.number().int().nullable().optional(),
});

export const PdfExtractSchema = z.object({
  text: z.string(),
  pageCount: z.number().int().nonnegative(),
  language: z.string(),
  charCount: z.number().int().nonnegative(),
  chunkCount: z.number().int().nonnegative(),
  chunks: z.array(PdfChunkSchema),
});

export type PdfChunk = z.infer<typeof PdfChunkSchema>;
export type PdfExtract = z.infer<typeof PdfExtractSchema>;

export type ExtractOk = { ok: true; data: PdfExtract };
export type ExtractErr = {
  ok: false;
  reason: 'unreachable' | 'http_error' | 'invalid_response' | 'timeout';
  status?: number;
  message?: string;
};
export type ExtractResult = ExtractOk | ExtractErr;

export interface ExtractOptions {
  /** Soft target chunk size (chars). Default 1200. */
  targetChars?: number;
  /** Hard ceiling per chunk. Default 1800. */
  maxChars?: number;
  /** Sliding-window overlap when sentences are huge. Default 150. */
  overlap?: number;
  /** Collapse alef/ya variants and strip diacritics. Default true. */
  aggressiveNormalize?: boolean;
  /** Per-call timeout in ms. Default 15_000. */
  timeoutMs?: number;
  /** Override the worker URL. */
  workerUrl?: string;
  /** Override the original filename sent to the worker. */
  filename?: string;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function workerBaseUrl(override?: string): string {
  const url = (override ?? process.env.PDF_WORKER_URL ?? 'http://localhost:8000').trim();
  return url.replace(/\/+$/, '');
}

/** Liveness probe. Returns true iff the worker responds 200 with `ok: true`. */
export async function isPdfWorkerHealthy(opts: { workerUrl?: string; timeoutMs?: number } = {}): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 2_000);
  try {
    const res = await fetch(`${workerBaseUrl(opts.workerUrl)}/health`, { signal: ctrl.signal });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean };
    return body?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Extract text + chunks from a PDF using the Python worker.
 * Accepts either a Web `File`/`Blob` or a Node `Buffer`/`Uint8Array`.
 */
export async function extractPdf(
  input: Blob | ArrayBuffer | Uint8Array,
  options: ExtractOptions = {},
): Promise<ExtractResult> {
  const {
    targetChars = 1200,
    maxChars = 1800,
    overlap = 150,
    aggressiveNormalize = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    workerUrl,
    filename,
  } = options;

  const url = new URL(`${workerBaseUrl(workerUrl)}/extract`);
  url.searchParams.set('target_chars', String(targetChars));
  url.searchParams.set('max_chars', String(maxChars));
  url.searchParams.set('overlap', String(overlap));
  url.searchParams.set('aggressive_normalize', String(aggressiveNormalize));

  const blob: Blob =
    input instanceof Blob
      ? input
      : new Blob([input instanceof ArrayBuffer ? input : input.buffer as ArrayBuffer], {
          type: 'application/pdf',
        });

  const form = new FormData();
  const inferredName = filename ?? (input instanceof File ? input.name : 'upload.pdf');
  form.append('file', blob, inferredName);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      body: form,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, reason: 'http_error', status: res.status, message: text.slice(0, 500) };
    }
    const json = (await res.json()) as unknown;
    const parsed = PdfExtractSchema.safeParse(json);
    if (!parsed.success) {
      return { ok: false, reason: 'invalid_response', message: parsed.error.message };
    }
    return { ok: true, data: parsed.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if ((err as { name?: string })?.name === 'AbortError') {
      return { ok: false, reason: 'timeout', message };
    }
    return { ok: false, reason: 'unreachable', message };
  } finally {
    clearTimeout(timer);
  }
}
