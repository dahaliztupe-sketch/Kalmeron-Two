import { NextResponse } from 'next/server';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { getUsageSummary } from '@/src/lib/billing/metering';

export const runtime = 'nodejs';

export const GET = guardedRoute(
  async ({ req }) => {
    const wid = req.nextUrl.searchParams.get('workspaceId');
    if (!wid) return NextResponse.json({ error: 'workspace_required' }, { status: 400 });
    const summary = await getUsageSummary(wid);
    return NextResponse.json({ success: true, summary });
  },
  { requireAuth: true, requirePermission: 'billing:read' }
);
