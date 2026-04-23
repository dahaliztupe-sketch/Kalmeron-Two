/**
 * Usage metering & quota enforcement.
 * Records agent runs, token usage, and $ cost per workspace per day/month.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type Tier = 'free' | 'pro' | 'enterprise';

export interface TierLimits {
  dailyAgentRuns: number;
  monthlyTokens: number;
  monthlyCostUSD: number;
  maxWebhooks: number;
  maxApiKeys: number;
  maxExperts: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    dailyAgentRuns: 50,
    monthlyTokens: 500_000,
    monthlyCostUSD: 5,
    maxWebhooks: 1,
    maxApiKeys: 2,
    maxExperts: 3,
  },
  pro: {
    dailyAgentRuns: 1000,
    monthlyTokens: 10_000_000,
    monthlyCostUSD: 100,
    maxWebhooks: 10,
    maxApiKeys: 20,
    maxExperts: 50,
  },
  enterprise: {
    dailyAgentRuns: 1_000_000,
    monthlyTokens: 1_000_000_000,
    monthlyCostUSD: 100_000,
    maxWebhooks: 1000,
    maxApiKeys: 1000,
    maxExperts: 10_000,
  },
};

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function monthKey(d = new Date()) {
  return d.toISOString().slice(0, 7); // YYYY-MM
}

export async function getWorkspaceTier(workspaceId: string): Promise<Tier> {
  try {
    const doc = await adminDb.collection('workspaces').doc(workspaceId).get();
    if (!doc.exists) return 'free';
    return ((doc.data() as any).tier as Tier) ?? 'free';
  } catch {
    return 'free';
  }
}

export async function recordUsage(args: {
  workspaceId: string;
  userId?: string;
  agent?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUSD?: number;
}) {
  const dk = dayKey();
  const mk = monthKey();
  const totalTokens = (args.inputTokens || 0) + (args.outputTokens || 0);

  const dailyRef = adminDb
    .collection('usage_daily')
    .doc(`${args.workspaceId}_${dk}`);
  const monthlyRef = adminDb
    .collection('usage_monthly')
    .doc(`${args.workspaceId}_${mk}`);

  const inc = {
    workspaceId: args.workspaceId,
    runs: FieldValue.increment(1),
    inputTokens: FieldValue.increment(args.inputTokens || 0),
    outputTokens: FieldValue.increment(args.outputTokens || 0),
    totalTokens: FieldValue.increment(totalTokens),
    costUSD: FieldValue.increment(args.costUSD || 0),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await Promise.all([
    dailyRef.set({ ...inc, day: dk }, { merge: true }),
    monthlyRef.set({ ...inc, month: mk }, { merge: true }),
  ]);
}

export async function checkQuota(workspaceId: string): Promise<{
  ok: boolean;
  reason?: string;
  usage: {
    dailyRuns: number;
    monthlyTokens: number;
    monthlyCostUSD: number;
  };
  limits: TierLimits;
  tier: Tier;
}> {
  const tier = await getWorkspaceTier(workspaceId);
  const limits = TIER_LIMITS[tier];
  const dk = dayKey();
  const mk = monthKey();
  const [daily, monthly] = await Promise.all([
    adminDb.collection('usage_daily').doc(`${workspaceId}_${dk}`).get(),
    adminDb.collection('usage_monthly').doc(`${workspaceId}_${mk}`).get(),
  ]);
  const d = (daily.data() as any) || {};
  const m = (monthly.data() as any) || {};
  const usage = {
    dailyRuns: d.runs || 0,
    monthlyTokens: m.totalTokens || 0,
    monthlyCostUSD: m.costUSD || 0,
  };
  if (usage.dailyRuns >= limits.dailyAgentRuns) {
    return { ok: false, reason: 'daily_agent_runs_exceeded', usage, limits, tier };
  }
  if (usage.monthlyTokens >= limits.monthlyTokens) {
    return { ok: false, reason: 'monthly_tokens_exceeded', usage, limits, tier };
  }
  if (usage.monthlyCostUSD >= limits.monthlyCostUSD) {
    return { ok: false, reason: 'monthly_cost_exceeded', usage, limits, tier };
  }
  return { ok: true, usage, limits, tier };
}

export async function getUsageSummary(workspaceId: string) {
  const { usage, limits, tier } = await checkQuota(workspaceId);
  return {
    tier,
    limits,
    usage,
    percent: {
      dailyRuns: Math.round((usage.dailyRuns / limits.dailyAgentRuns) * 100),
      monthlyTokens: Math.round((usage.monthlyTokens / limits.monthlyTokens) * 100),
      monthlyCostUSD: Math.round((usage.monthlyCostUSD / limits.monthlyCostUSD) * 100),
    },
  };
}
