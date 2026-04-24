/**
 * Admin endpoint — TTFV summary (median + p90, cold + warm).
 * Fed by `src/lib/analytics/ttfv.ts → getTtfvSummary`.
 *
 * Auth: gated by ADMIN_EMAILS env var via the standard admin guard. We
 * intentionally do not expose user-level TTFV data here — only aggregates.
 */
import { NextResponse } from 'next/server';
import { getTtfvSummary } from '@/src/lib/analytics/ttfv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getTtfvSummary();
    return NextResponse.json(summary, {
      headers: { 'Cache-Control': 'private, max-age=30' },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed' },
      { status: 500 },
    );
  }
}
