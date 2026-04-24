/**
 * Cost ledger — every model call writes a `cost_events` row.
 *
 * See `docs/COST_DASHBOARD.md` for the full architecture.
 *
 * - `recordCost`: write a single event from inside the model router.
 * - `aggregateRollup`: invoked by `/api/cron/aggregate-costs` to materialize
 *   `cost_rollups/{ymdh}` and `cost_rollups_daily/{ymd}`.
 * - `queryDailyRollup` / `queryMonthlyTotal`: read paths used by the admin
 *   cost dashboard and per-workspace usage page.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue, type Timestamp } from 'firebase-admin/firestore';

export type Provider = 'gemini' | 'openai' | 'anthropic' | 'web-llm' | 'other';

export interface CostEvent {
  workspaceId: string;
  agent: string;
  provider: Provider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  requestId?: string;
  occurredAt?: Timestamp;
}

export interface DailyRollup {
  ymd: string;                   // 2026-04-24
  totalUsd: number;
  totalEvents: number;
  byAgent: Record<string, number>;
  byProvider: Record<string, number>;
  byWorkspace: Record<string, number>;
}

const EVENTS = 'cost_events';
const HOURLY = 'cost_rollups';
const DAILY = 'cost_rollups_daily';

function ymdh(d = new Date()): string {
  const iso = d.toISOString();
  return iso.slice(0, 13).replace('T', '-'); // 2026-04-24-15
}
function ymd(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
function ym(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

/** Write one cost event. Never throws — telemetry must not break the request. */
export async function recordCost(e: Omit<CostEvent, 'occurredAt'>): Promise<void> {
  try {
    await adminDb.collection(EVENTS).add({
      ...e,
      occurredAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[cost-ledger] write failed', err instanceof Error ? err.message : err);
  }
}

/**
 * Aggregate the last `hoursBack` hours of `cost_events` into hourly + daily
 * rollup documents. Designed to be idempotent — overwriting existing rollup
 * docs.
 */
export async function aggregateRollup(hoursBack = 2): Promise<{
  hourlyKeys: string[];
  dailyKeys: string[];
  events: number;
}> {
  const since = new Date(Date.now() - hoursBack * 3_600_000);
  const snap = await adminDb
    .collection(EVENTS)
    .where('occurredAt', '>=', since)
    .get();

  const hourly: Record<string, DailyRollup> = {};
  const daily: Record<string, DailyRollup> = {};

  for (const doc of snap.docs) {
    const e = doc.data() as Partial<CostEvent> & { occurredAt?: Timestamp };
    const d = e.occurredAt?.toDate?.() ?? new Date();
    const hk = ymdh(d);
    const dk = ymd(d);
    for (const map of [hourly[hk] ?? null, daily[dk] ?? null] as (DailyRollup | null)[]) { void map; }

    if (!hourly[hk]) {
      hourly[hk] = { ymd: hk, totalUsd: 0, totalEvents: 0, byAgent: {}, byProvider: {}, byWorkspace: {} };
    }
    if (!daily[dk]) {
      daily[dk] = { ymd: dk, totalUsd: 0, totalEvents: 0, byAgent: {}, byProvider: {}, byWorkspace: {} };
    }

    const cost = Number(e.costUsd ?? 0);
    const agent = String(e.agent ?? 'unknown');
    const provider = String(e.provider ?? 'other');
    const workspace = String(e.workspaceId ?? 'unknown');

    for (const r of [hourly[hk]!, daily[dk]!]) {
      r.totalUsd += cost;
      r.totalEvents += 1;
      r.byAgent[agent] = (r.byAgent[agent] ?? 0) + cost;
      r.byProvider[provider] = (r.byProvider[provider] ?? 0) + cost;
      r.byWorkspace[workspace] = (r.byWorkspace[workspace] ?? 0) + cost;
    }
  }

  await Promise.all([
    ...Object.entries(hourly).map(([k, v]) =>
      adminDb.collection(HOURLY).doc(k).set({ ...v, updatedAt: FieldValue.serverTimestamp() }),
    ),
    ...Object.entries(daily).map(([k, v]) =>
      adminDb.collection(DAILY).doc(k).set({ ...v, updatedAt: FieldValue.serverTimestamp() }),
    ),
  ]);

  return {
    hourlyKeys: Object.keys(hourly),
    dailyKeys: Object.keys(daily),
    events: snap.size,
  };
}

/** Read the rollup for a single day. */
export async function queryDailyRollup(date: Date | string = new Date()): Promise<DailyRollup | null> {
  const key = typeof date === 'string' ? date : ymd(date);
  const doc = await adminDb.collection(DAILY).doc(key).get();
  if (!doc.exists) return null;
  return doc.data() as DailyRollup;
}

/** Sum daily rollups for the current calendar month. */
export async function queryMonthlyTotal(workspaceId?: string): Promise<{
  ym: string;
  totalUsd: number;
  byAgent: Record<string, number>;
  days: number;
}> {
  const month = ym();
  const snap = await adminDb
    .collection(DAILY)
    .where('ymd', '>=', `${month}-01`)
    .where('ymd', '<', `${month}-32`)
    .get();
  let totalUsd = 0;
  const byAgent: Record<string, number> = {};
  for (const d of snap.docs) {
    const r = d.data() as DailyRollup;
    if (workspaceId) {
      totalUsd += r.byWorkspace?.[workspaceId] ?? 0;
    } else {
      totalUsd += r.totalUsd ?? 0;
      for (const [a, v] of Object.entries(r.byAgent ?? {})) {
        byAgent[a] = (byAgent[a] ?? 0) + (v as number);
      }
    }
  }
  return { ym: month, totalUsd, byAgent, days: snap.size };
}

/** Most recent N daily rollups for sparklines. */
export async function recentDaily(n = 14): Promise<DailyRollup[]> {
  const snap = await adminDb
    .collection(DAILY)
    .orderBy('ymd', 'desc')
    .limit(n)
    .get();
  return snap.docs.map((d) => d.data() as DailyRollup).reverse();
}
