/**
 * Typed client for the Python LLM-Judge sidecar (`services/llm-judge`).
 *
 * Same conventions as the other sidecar clients:
 *   - Never throws — discriminated `{ ok: false, reason }`.
 *   - Zod-validated responses.
 *   - Reads `LLM_JUDGE_URL` (default `http://localhost:8080`).
 */

import { z } from 'zod';

export const RubricName = z.enum([
  'factual_accuracy',
  'egyptian_voice',
  'safety',
  'completeness',
]);
export type RubricName = z.infer<typeof RubricName>;

export const JudgeOutSchema = z.object({
  rubric: RubricName,
  mode: z.enum(['real', 'stub']),
  score: z.number().min(0).max(1),
  criteria_scores: z.record(z.string(), z.number().min(0).max(1)),
  reasoning: z.string(),
});
export type JudgeOut = z.infer<typeof JudgeOutSchema>;

export const JudgeBatchOutSchema = z.object({
  mode: z.enum(['real', 'stub']),
  results: z.array(JudgeOutSchema),
});
export type JudgeBatchOut = z.infer<typeof JudgeBatchOutSchema>;

type Ok<T> = { ok: true; data: T };
type Err = {
  ok: false;
  reason: 'unreachable' | 'http_error' | 'invalid_response' | 'timeout';
  status?: number;
  message?: string;
};
export type JudgeResult<T> = Ok<T> | Err;

const DEFAULT_TIMEOUT_MS = 15_000;  // judge calls can take a few seconds

function baseUrl(override?: string): string {
  return ((override ?? process.env.LLM_JUDGE_URL ?? 'http://localhost:8080').trim()).replace(/\/+$/, '');
}

export interface JudgeInput {
  question: string;
  answer: string;
  rubric: RubricName;
}

export async function judgeOne(
  input: JudgeInput,
  opts: { workerUrl?: string; timeoutMs?: number } = {},
): Promise<JudgeResult<JudgeOut>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl(opts.workerUrl)}/judge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { ok: false, reason: 'http_error', status: res.status, message: (await res.text()).slice(0, 500) };
    }
    const parsed = JudgeOutSchema.safeParse(await res.json());
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

export async function judgeBatch(
  items: JudgeInput[],
  opts: { workerUrl?: string; timeoutMs?: number } = {},
): Promise<JudgeResult<JudgeBatchOut>> {
  if (items.length === 0) {
    return { ok: true, data: { mode: 'stub', results: [] } };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? Math.max(DEFAULT_TIMEOUT_MS, items.length * 1500));
  try {
    const res = await fetch(`${baseUrl(opts.workerUrl)}/judge/batch`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { ok: false, reason: 'http_error', status: res.status, message: (await res.text()).slice(0, 500) };
    }
    const parsed = JudgeBatchOutSchema.safeParse(await res.json());
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

export async function isJudgeHealthy(opts: { workerUrl?: string; timeoutMs?: number } = {}): Promise<{
  healthy: boolean;
  mode?: 'real' | 'stub';
}> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 2_000);
  try {
    const res = await fetch(`${baseUrl(opts.workerUrl)}/health`, { signal: ctrl.signal });
    if (!res.ok) return { healthy: false };
    const body = (await res.json()) as { ok?: boolean; mode?: 'real' | 'stub' };
    return { healthy: body?.ok === true, mode: body?.mode };
  } catch {
    return { healthy: false };
  } finally {
    clearTimeout(t);
  }
}
