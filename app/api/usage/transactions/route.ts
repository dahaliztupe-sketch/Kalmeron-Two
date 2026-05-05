/**
 * GET /api/usage/transactions
 *
 * Returns last 30 days of credit_transactions for the authenticated user,
 * aggregated by agentName. Used by the usage dashboard breakdown table.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { Timestamp } from 'firebase-admin/firestore';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }
  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7).trim());
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  const thirtyDaysAgo = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const byAgent: Record<string, { credits: number; count: number }> = {};
  let totalCredits = 0;
  let totalCalls = 0;

  try {
    const snap = await adminDb
      .collection('credit_transactions')
      .where('userId', '==', uid)
      .where('timestamp', '>=', thirtyDaysAgo)
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    snap.forEach((doc: DocumentSnapshot) => {
      const d = doc.data();
      if (!d || d['type'] !== 'consume') return;
      const agent = (d['agentName'] as string) || 'غير محدد';
      const amount = (d['amount'] as number) || 0;
      if (!byAgent[agent]) byAgent[agent] = { credits: 0, count: 0 };
      byAgent[agent].credits += amount;
      byAgent[agent].count += 1;
      totalCredits += amount;
      totalCalls += 1;
    });
  } catch {
    // Firestore unavailable — return empty
  }

  const breakdown = Object.entries(byAgent)
    .map(([agent, stats]) => ({ agent, credits: stats.credits, count: stats.count }))
    .sort((a, b) => b.credits - a.credits);

  return NextResponse.json({ breakdown, totalCredits, totalCalls });
}
