/**
 * /api/first-100/seats — public seat counter for the LTD landing page.
 *
 * P1-1 from Virtual Boardroom 201 (Hormozi seat).
 *
 * Reads `first_100_signups` collection (cheap count) and returns the
 * remaining seats out of 100. Cached for 60 seconds.
 */
import { NextRequest } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { rateLimit } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const revalidate = 60;

const TOTAL_SEATS = 100;

export async function GET(req: NextRequest) {
  // Per-IP rate limit — landing page polls every 60s, so 60/min is plenty.
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return new Response('Too Many Requests', { status: 429 });

  try {
    // `count()` aggregation: O(1) for billing, no doc reads.
    const snap = await adminDb.collection('first_100_signups').count().get();
    const taken = Math.min(TOTAL_SEATS, snap.data().count ?? 0);
    return Response.json(
      {
        total: TOTAL_SEATS,
        taken,
        left: Math.max(0, TOTAL_SEATS - taken),
        closed: taken >= TOTAL_SEATS,
        updatedAt: Date.now(),
      },
      {
        headers: {
          // 60s edge cache + SWR for snappy LP updates.
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        },
      },
    );
  } catch (e: any) {
    return Response.json(
      { total: TOTAL_SEATS, taken: 0, left: TOTAL_SEATS, closed: false, error: e?.message },
      { status: 200 },
    );
  }
}
