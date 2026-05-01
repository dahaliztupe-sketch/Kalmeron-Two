/**
 * GET /api/usage/daily?days=7
 * Returns last N days of usage data for the consumption chart.
 * Reads from Firestore `usage_daily` collection (keyed by userId/YYYY-MM-DD).
 * Falls back to zeros when Firestore is unavailable.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return decoded.uid || null;
  } catch {
    return null;
  }
}

function dateLabel(dateStr: string, locale: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00Z');
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en', { weekday: 'short' });
  } catch {
    return dateStr.slice(5); // MM-DD fallback
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUserId(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? '7'), 1), 30);
  const locale = url.searchParams.get('locale') ?? 'ar';

  // Build list of date strings for last N days
  const dateKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dateKeys.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }

  // Map to zero defaults
  const costByDate: Record<string, number> = {};
  const tokensByDate: Record<string, number> = {};
  for (const k of dateKeys) {
    costByDate[k] = 0;
    tokensByDate[k] = 0;
  }

  // Fetch from Firestore if available
  if (adminDb?.collection) {
    try {
      const startDate = dateKeys[0]!;
      const snap = await adminDb
        .collection('usage_daily')
        .where('userId', '==', uid)
        .where('date', '>=', startDate)
        .orderBy('date', 'asc')
        .limit(days + 2)
        .get();

      snap.forEach((doc: DocumentSnapshot) => {
        const d = doc.data();
        if (!d) return;
        const date = d['date'] as string | undefined;
        if (!date || !(date in costByDate)) return;
        costByDate[date] = typeof d['costUsd'] === 'number' ? +d['costUsd'].toFixed(4) : 0;
        tokensByDate[date] = typeof d['tokens'] === 'number' ? d['tokens'] : 0;
      });
    } catch {
      // Firestore unavailable — return zeros (handled below)
    }
  }

  const chartData = dateKeys.map((date) => ({
    day: dateLabel(date, locale),
    date,
    cost: costByDate[date] ?? 0,
    tokens: tokensByDate[date] ?? 0,
  }));

  return NextResponse.json({ chartData, days });
}
