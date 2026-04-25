/**
 * Hard budget enforcement (cost runaway protection).
 *
 * Reads the current calendar-month spend for a workspace from the cost-ledger
 * (`queryMonthlyTotal`) and compares it against the workspace's configured
 * monthly cap. If the cap is exceeded, returns `{ ok: false, blocked: true }`
 * so the caller can short-circuit the agent run before any model call is
 * issued.
 *
 * Resolution order for the cap:
 *   1. `workspaces/{id}.budgetUsdMonthly` (Firestore, admin-set per workspace).
 *   2. `KALMERON_DEFAULT_BUDGET_USD` env var.
 *   3. Hard fallback: `Number.POSITIVE_INFINITY` (no enforcement).
 *
 * The guard never throws — it logs and returns a safe shape so a telemetry
 * outage cannot accidentally turn into a denial-of-service for paying users.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { queryMonthlyTotal } from '@/src/lib/observability/cost-ledger';
import { logger } from '@/src/lib/logger';

export interface BudgetCheck {
  ok: boolean;
  blocked: boolean;
  spentUsd: number;
  budgetUsd: number;
  remainingUsd: number;
  reason?: 'over_budget' | 'lookup_failed' | null;
}

const guardLogger = logger.child({ component: 'budget-guard' });

const DEFAULT_BUDGET = Number(process.env.KALMERON_DEFAULT_BUDGET_USD || '0');

async function resolveBudgetUsd(workspaceId: string): Promise<number> {
  try {
    const snap = await adminDb.collection('workspaces').doc(workspaceId).get();
    if (snap.exists) {
      const data = snap.data() as { budgetUsdMonthly?: number } | undefined;
      const v = data?.budgetUsdMonthly;
      if (typeof v === 'number' && v > 0) return v;
    }
  } catch (err) {
    guardLogger.warn(
      { event: 'budget_lookup_failed', workspaceId, err: err instanceof Error ? err.message : String(err) },
      'budget_lookup_failed',
    );
  }
  return DEFAULT_BUDGET > 0 ? DEFAULT_BUDGET : Number.POSITIVE_INFINITY;
}

export async function enforceBudget(workspaceId: string): Promise<BudgetCheck> {
  if (!workspaceId) {
    return { ok: true, blocked: false, spentUsd: 0, budgetUsd: 0, remainingUsd: 0, reason: null };
  }
  const budgetUsd = await resolveBudgetUsd(workspaceId);
  if (!Number.isFinite(budgetUsd)) {
    return { ok: true, blocked: false, spentUsd: 0, budgetUsd, remainingUsd: budgetUsd, reason: null };
  }
  let spentUsd = 0;
  try {
    const monthly = await queryMonthlyTotal(workspaceId);
    spentUsd = Number(monthly.totalUsd ?? 0);
  } catch (err) {
    guardLogger.warn(
      { event: 'spend_lookup_failed', workspaceId, err: err instanceof Error ? err.message : String(err) },
      'spend_lookup_failed',
    );
    return {
      ok: true,
      blocked: false,
      spentUsd: 0,
      budgetUsd,
      remainingUsd: budgetUsd,
      reason: 'lookup_failed',
    };
  }
  const remainingUsd = Math.max(0, budgetUsd - spentUsd);
  if (spentUsd >= budgetUsd) {
    guardLogger.warn(
      { event: 'budget_exceeded', workspaceId, spentUsd, budgetUsd },
      'budget_exceeded',
    );
    return {
      ok: false,
      blocked: true,
      spentUsd,
      budgetUsd,
      remainingUsd: 0,
      reason: 'over_budget',
    };
  }
  return { ok: true, blocked: false, spentUsd, budgetUsd, remainingUsd, reason: null };
}

/**
 * Pure-logic helper exported for unit tests. Same shape as `enforceBudget`
 * but takes the budget and spend as inputs so tests don't need Firestore.
 */
export function evaluateBudget(spentUsd: number, budgetUsd: number): BudgetCheck {
  if (!Number.isFinite(budgetUsd) || budgetUsd <= 0) {
    return {
      ok: true,
      blocked: false,
      spentUsd,
      budgetUsd: budgetUsd || 0,
      remainingUsd: Number.POSITIVE_INFINITY,
      reason: null,
    };
  }
  const remainingUsd = Math.max(0, budgetUsd - spentUsd);
  if (spentUsd >= budgetUsd) {
    return { ok: false, blocked: true, spentUsd, budgetUsd, remainingUsd: 0, reason: 'over_budget' };
  }
  return { ok: true, blocked: false, spentUsd, budgetUsd, remainingUsd, reason: null };
}
