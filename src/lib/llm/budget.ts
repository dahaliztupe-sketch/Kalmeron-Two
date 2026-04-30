/**
 * Per-model monthly budget caps
 * --------------------------------------------------------------
 * Source-of-truth: `MODEL_BUDGETS` env var → JSON map of model id (or
 * provider id) → USD/month cap. Examples:
 *
 *   MODEL_BUDGETS='{"anthropic/claude-opus-4.5": 5, "openai": 25}'
 *
 * Spend is tracked locally inside this module (in-process counter, reset
 * monthly) plus an optional fan-out to the Token Meter sidecar. The
 * gateway calls `enforceBudget(modelOrProvider, estimatedCost)` BEFORE the
 * upstream model call; on overspend we return `{allow: false}` and the
 * caller downshifts to the next provider in its fallback chain.
 */

export interface BudgetEnforcement {
  allow: boolean;
  reason?: string;
  spentMtd: number;
  capUsd: number;
}

const MONTH_MS = 30 * 24 * 60 * 60_000;

interface SpendEntry {
  monthStartedAt: number;
  spent: number;
}

const SPEND: Map<string, SpendEntry> = new Map();
let CAPS: Record<string, number> | null = null;

function caps(): Record<string, number> {
  if (CAPS) return CAPS;
  try {
    CAPS = JSON.parse(process.env.MODEL_BUDGETS || '{}');
    if (!CAPS || typeof CAPS !== 'object') CAPS = {};
  } catch {
    CAPS = {};
  }
  return CAPS;
}

function rolloverIfNeeded(e: SpendEntry): void {
  if (Date.now() - e.monthStartedAt >= MONTH_MS) {
    e.monthStartedAt = Date.now();
    e.spent = 0;
  }
}

function getEntry(key: string): SpendEntry {
  let e = SPEND.get(key);
  if (!e) {
    e = { monthStartedAt: Date.now(), spent: 0 };
    SPEND.set(key, e);
  }
  rolloverIfNeeded(e);
  return e;
}

function lookupCap(modelId: string, provider: string): number | null {
  const c = caps();
  return c[modelId] ?? c[provider] ?? null;
}

/**
 * Decide whether a planned spend can proceed. The gateway calls this BEFORE
 * issuing the upstream request, using the per-call estimated cost.
 */
export function enforceBudget(modelId: string, provider: string, estCostUsd: number): BudgetEnforcement {
  const cap = lookupCap(modelId, provider);
  if (cap === null) return { allow: true, spentMtd: 0, capUsd: Infinity };
  const e = getEntry(modelId);
  const projected = e.spent + estCostUsd;
  if (projected > cap) {
    return {
      allow: false,
      reason: `model "${modelId}" projected ${projected.toFixed(4)} USD exceeds cap ${cap} USD MTD`,
      spentMtd: e.spent,
      capUsd: cap,
    };
  }
  return { allow: true, spentMtd: e.spent, capUsd: cap };
}

/** Record actual spend after a successful call. */
export function recordSpend(modelId: string, costUsd: number): void {
  const e = getEntry(modelId);
  e.spent += costUsd;
}

export function getBudgetSnapshot(): Array<{ model: string; spentUsd: number; capUsd: number; pct: number }> {
  const out: Array<{ model: string; spentUsd: number; capUsd: number; pct: number }> = [];
  for (const [model, entry] of SPEND.entries()) {
    rolloverIfNeeded(entry);
    const cap = lookupCap(model, '') ?? Infinity;
    const pct = Number.isFinite(cap) && cap > 0 ? (entry.spent / cap) * 100 : 0;
    out.push({ model, spentUsd: entry.spent, capUsd: cap, pct });
  }
  return out.sort((a, b) => b.pct - a.pct);
}

/** Test-only — wipe state and force re-read of MODEL_BUDGETS. */
export function __resetBudget(): void {
  SPEND.clear();
  CAPS = null;
}
