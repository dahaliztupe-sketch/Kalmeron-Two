/**
 * Startup validation — runs once on first server request.
 * Performs non-fatal reachability probes for all worker URLs and logs
 * clear warnings so the main app always starts, even when workers are down.
 */

let _checked = false;

const WORKER_CONFIGS: Array<{ key: string; fallback: string; label: string }> = [
  { key: 'PDF_WORKER_URL', fallback: 'http://localhost:8000', label: 'PDF Worker' },
  { key: 'EGYPT_CALC_URL', fallback: 'http://localhost:8008', label: 'Egypt Calc' },
  { key: 'LLM_JUDGE_URL', fallback: 'http://localhost:8080', label: 'LLM Judge' },
  { key: 'EMBEDDINGS_WORKER_URL', fallback: 'http://localhost:8099', label: 'Embeddings Worker' },
];

const CRITICAL_ENV: Array<{ key: string; label: string }> = [
  { key: 'FIREBASE_SERVICE_ACCOUNT_KEY', label: 'Firebase Admin' },
];

const PROBE_TIMEOUT_MS = 3_000;

async function probeWorker(label: string, baseUrl: string): Promise<void> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(`${baseUrl}/health`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`[kalmeron:startup] ${label} responded with HTTP ${res.status} — may be degraded`);
    } else {
      const body = (await res.json()) as { ok?: boolean; status?: string };
      if (body?.status === 'warming_up') {
        console.info(`[kalmeron:startup] ${label} is warming up (model loading) — first requests may be slow`);
      }
    }
  } catch {
    console.warn(`[kalmeron:startup] ${label} is unreachable at ${baseUrl} — worker may need to start`);
  }
}

export function validateStartup(): void {
  if (_checked) return;
  _checked = true;

  const prefix = '[kalmeron:startup]';

  for (const { key, label } of CRITICAL_ENV) {
    if (!process.env[key]) {
      console.warn(`${prefix} MISSING ${label} (${key}). Some features will be unavailable.`);
    }
  }

  const workerChecks = WORKER_CONFIGS.map(({ key, fallback, label }) => {
    const url = (process.env[key] ?? fallback).trim().replace(/\/+$/, '');
    if (!process.env[key]) {
      console.warn(`${prefix} ${label} URL not set (${key}). Using fallback: ${fallback}`);
    }
    return probeWorker(label, url);
  });

  void Promise.allSettled(workerChecks).then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.info(`${prefix} Worker reachability probes complete. Node ${process.version}`);
    }
  });
}
