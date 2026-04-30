/**
 * /api/admin/mission-control — operational metrics snapshot.
 *
 * 🔒 Platform admin only (gated by PLATFORM_ADMIN_UIDS env).
 *    Previously this route was unauthenticated and exposed agent metrics
 *    publicly. Closed 2026-04-24 as part of the Boardroom audit.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSnapshot } from '@/src/ai/organization/compliance/monitor';
import { requireAuth } from '@/src/lib/security/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireAuth(req);
  if (admin instanceof Response) return admin;
  return NextResponse.json(getMetricsSnapshot(), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
