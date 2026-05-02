/**
 * GET /api/usage — Redirect to the proper billing usage endpoint.
 * This acts as a convenience alias for /api/billing/usage/summary.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authedUid(req: NextRequest): Promise<string | null> {
  const h = req.headers.get('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  try {
    const d = await adminAuth.verifyIdToken(h.slice(7).trim());
    return d.uid;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!adminDb?.collection) {
    return NextResponse.json({
      creditsUsed: 0,
      creditsRemaining: 100,
      requestsThisMonth: 0,
      estimatedCostUsd: 0,
      byAgent: [],
      daily: [],
      warning: 'firestore_unavailable',
    });
  }

  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const snap = await adminDb
    .collection('usageEvents')
    .where('userId', '==', uid)
    .where('createdAt', '>=', since)
    .orderBy('createdAt', 'desc')
    .limit(1000)
    .get()
    .catch(() => null);

  const events = snap?.docs.map((d) => d.data() as Record<string, unknown>) ?? [];

  const byAgentMap = new Map<string, { requests: number; cost: number }>();
  const dailyMap = new Map<string, { requests: number; credits: number }>();
  let creditsUsed = 0;
  let estimatedCostUsd = 0;

  for (const e of events) {
    const agent = String(e['agent'] || 'general');
    const cost = Number(e['costUsd'] || 0);
    const credits = Number(e['credits'] || 0);
    const day = String(e['createdAt'] || '').slice(0, 10);

    creditsUsed += credits;
    estimatedCostUsd += cost;

    const a = byAgentMap.get(agent) ?? { requests: 0, cost: 0 };
    a.requests++;
    a.cost += cost;
    byAgentMap.set(agent, a);

    if (day) {
      const d = dailyMap.get(day) ?? { requests: 0, credits: 0 };
      d.requests++;
      d.credits += credits;
      dailyMap.set(day, d);
    }
  }

  const byAgent = Array.from(byAgentMap.entries())
    .map(([agent, stats]) => ({ agent, ...stats }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 20);

  const daily = Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return NextResponse.json({
    creditsUsed: Math.round(creditsUsed),
    creditsRemaining: Math.max(0, 10000 - Math.round(creditsUsed)),
    requestsThisMonth: events.length,
    estimatedCostUsd: Math.round(estimatedCostUsd * 100) / 100,
    byAgent,
    daily,
  });
}
