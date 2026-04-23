import { describe, it, expect, vi } from 'vitest';

const usage: Record<string, any> = {};
vi.mock('@/src/lib/firebase-admin', () => ({
  adminDb: {
    collection: (col: string) => ({
      doc: (id: string) => ({
        get: async () => {
          const k = `${col}/${id}`;
          return { exists: !!usage[k], data: () => usage[k] };
        },
        set: async (data: any) => {
          const k = `${col}/${id}`;
          const prev = usage[k] || {};
          // simulate FieldValue.increment
          for (const [key, val] of Object.entries(data)) {
            if (val && typeof val === 'object' && (val as any)._inc !== undefined) {
              prev[key] = (prev[key] || 0) + (val as any)._inc;
            } else {
              prev[key] = val;
            }
          }
          usage[k] = prev;
        },
      }),
    }),
  },
}));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    increment: (n: number) => ({ _inc: n }),
    serverTimestamp: () => new Date(),
  },
}));

describe('metering', () => {
  it('records and checks quota for free tier', async () => {
    const { recordUsage, checkQuota, TIER_LIMITS } = await import('@/src/lib/billing/metering');
    await recordUsage({ workspaceId: 'ws-free', outputTokens: 1000, costUSD: 0.1 });
    const q = await checkQuota('ws-free');
    expect(q.ok).toBe(true);
    expect(q.tier).toBe('free');
    expect(q.limits).toEqual(TIER_LIMITS.free);
    expect(q.usage.monthlyTokens).toBe(1000);
  });

  it('blocks when daily runs exceed free tier', async () => {
    const { recordUsage, checkQuota, TIER_LIMITS } = await import('@/src/lib/billing/metering');
    for (let i = 0; i < TIER_LIMITS.free.dailyAgentRuns; i++) {
      await recordUsage({ workspaceId: 'ws-over', outputTokens: 10 });
    }
    const q = await checkQuota('ws-over');
    expect(q.ok).toBe(false);
    expect(q.reason).toBe('daily_agent_runs_exceeded');
  });
});
