/**
 * Admin endpoint — TTFV summary (median + p90, cold + warm).
 * Fed by `src/lib/analytics/ttfv.ts → getTtfvSummary`.
 *
 * 🔒 Platform admin only (PLATFORM_ADMIN_UIDS). The previous comment
 *    referenced a non-existent ADMIN_EMAILS guard — endpoint was effectively
 *    unauthenticated. Closed 2026-04-24 as part of the Boardroom audit.
 *    We intentionally only expose aggregates, never per-user TTFV data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getTtfvSummary } from '@/src/lib/analytics/ttfv';
import { requirePlatformAdmin } from '@/src/lib/security/require-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requirePlatformAdmin(req);
  if (admin instanceof Response) return admin;
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
