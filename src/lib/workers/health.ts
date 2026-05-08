/**
 * Worker health checker — pings all 4 Python sidecar /health endpoints
 * in parallel and caches results for 30 seconds to avoid hammering the
 * workers on every page load.
 */

export type WorkerStatus = 'ok' | 'warming_up' | 'unreachable' | 'degraded';

export interface WorkerHealth {
  name: string;
  key: 'pdfWorker' | 'egyptCalc' | 'llmJudge' | 'embeddingsWorker';
  url: string;
  status: WorkerStatus;
  version?: string;
  uptime_seconds?: number;
  latency_ms?: number;
  detail?: Record<string, unknown>;
  checkedAt: number;
}

export interface WorkersHealthResult {
  workers: WorkerHealth[];
  allOk: boolean;
  checkedAt: number;
}

const CACHE_TTL_MS = 30_000;
const PING_TIMEOUT_MS = 4_000;

let _cache: WorkersHealthResult | null = null;
let _cacheTs = 0;

function workerUrl(envKey: string, fallback: string): string {
  return (process.env[envKey] ?? fallback).trim().replace(/\/+$/, '');
}

async function pingWorker(
  key: WorkerHealth['key'],
  name: string,
  baseUrl: string,
): Promise<WorkerHealth> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${baseUrl}/health`, {
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const latency_ms = Date.now() - t0;
    if (!res.ok) {
      return { name, key, url: baseUrl, status: 'degraded', latency_ms, checkedAt: t0 };
    }
    const body = (await res.json()) as Record<string, unknown>;
    const workerStatus = (body.status as string) ?? (body.ok ? 'ok' : 'degraded');
    return {
      name,
      key,
      url: baseUrl,
      status: workerStatus as WorkerStatus,
      version: body.version as string | undefined,
      uptime_seconds: body.uptime_seconds as number | undefined,
      latency_ms,
      detail: body,
      checkedAt: t0,
    };
  } catch {
    return {
      name,
      key,
      url: baseUrl,
      status: 'unreachable',
      latency_ms: Date.now() - t0,
      checkedAt: t0,
    };
  }
}

/** Ping all 4 workers in parallel. Uses a 30-second in-memory cache. */
export async function checkAllWorkers(opts: { force?: boolean } = {}): Promise<WorkersHealthResult> {
  const now = Date.now();
  if (!opts.force && _cache && now - _cacheTs < CACHE_TTL_MS) {
    return _cache;
  }

  const workers = await Promise.all([
    pingWorker('pdfWorker', 'PDF Worker', workerUrl('PDF_WORKER_URL', 'http://localhost:8000')),
    pingWorker('egyptCalc', 'Egypt Calc', workerUrl('EGYPT_CALC_URL', 'http://localhost:8008')),
    pingWorker('llmJudge', 'LLM Judge', workerUrl('LLM_JUDGE_URL', 'http://localhost:8080')),
    pingWorker('embeddingsWorker', 'Embeddings Worker', workerUrl('EMBEDDINGS_WORKER_URL', 'http://localhost:8099')),
  ]);

  const result: WorkersHealthResult = {
    workers,
    allOk: workers.every((w) => w.status === 'ok' || w.status === 'warming_up'),
    checkedAt: now,
  };

  _cache = result;
  _cacheTs = now;
  return result;
}

/** Invalidate the cache so the next call re-pings all workers. */
export function invalidateWorkerHealthCache(): void {
  _cache = null;
  _cacheTs = 0;
}
