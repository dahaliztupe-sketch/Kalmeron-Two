/**
 * Per-provider circuit breaker
 * --------------------------------------------------------------
 * Three states: `closed` (healthy) → `open` (skip) → `half-open` (probe).
 *
 * Trip rule: ≥ {THRESHOLD} failures within {WINDOW_MS} → trip to OPEN for
 * {OPEN_MS}. After cool-down we move to HALF_OPEN and let the next request
 * probe; success closes the circuit, failure re-opens it.
 *
 * The state is purely in-process. A multi-instance deployment will have one
 * breaker per process — that's intentional: a breaker shared via Redis would
 * couple all instances on a single bad provider. Per-process gives natural
 * jitter and self-healing.
 */
import type { ProviderId } from './providers';

const THRESHOLD = 3;            // failures within window to trip
const WINDOW_MS = 60_000;       // 60s rolling window
const OPEN_MS = 5 * 60_000;     // 5 min cool-down

type State = 'closed' | 'open' | 'half_open';

interface BreakerEntry {
  state: State;
  failures: number[];           // unix-ms timestamps of recent failures
  openedAt?: number;
}

const STATE: Map<ProviderId, BreakerEntry> = new Map();

function entry(p: ProviderId): BreakerEntry {
  let e = STATE.get(p);
  if (!e) {
    e = { state: 'closed', failures: [] };
    STATE.set(p, e);
  }
  return e;
}

/** True when the breaker is OPEN and still in cool-down. */
export function isProviderOpen(p: ProviderId): boolean {
  const e = entry(p);
  if (e.state === 'open') {
    if (e.openedAt && Date.now() - e.openedAt >= OPEN_MS) {
      // Cool-down elapsed — let the next caller probe.
      e.state = 'half_open';
      return false;
    }
    return true;
  }
  return false;
}

/** Mark a successful call → close the circuit. */
export function recordSuccess(p: ProviderId): void {
  const e = entry(p);
  e.state = 'closed';
  e.failures = [];
  e.openedAt = undefined;
}

/** Mark a failed call. Trips the circuit if we hit the threshold in the window. */
export function recordFailure(p: ProviderId, _err?: unknown): void {
  const e = entry(p);
  const now = Date.now();
  e.failures = e.failures.filter((t) => now - t < WINDOW_MS);
  e.failures.push(now);
  if (e.state === 'half_open') {
    // Probe failed → re-open.
    e.state = 'open';
    e.openedAt = now;
    return;
  }
  if (e.failures.length >= THRESHOLD) {
    e.state = 'open';
    e.openedAt = now;
  }
}

export function getCircuitSnapshot(): Array<{ provider: ProviderId; state: State; failures: number; openedAt?: number }> {
  return Array.from(STATE.entries()).map(([provider, e]) => ({
    provider,
    state: e.state,
    failures: e.failures.length,
    openedAt: e.openedAt,
  }));
}

/** Test helper — wipe all breaker state. */
export function __resetCircuits(): void {
  STATE.clear();
}

export const __FOR_TESTS = { THRESHOLD, WINDOW_MS, OPEN_MS };
