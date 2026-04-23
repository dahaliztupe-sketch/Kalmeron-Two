import { NextResponse } from 'next/server';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { queryAudit } from '@/src/lib/audit/log';

export const runtime = 'nodejs';

export const GET = guardedRoute(
  async ({ req }) => {
    const wid = req.nextUrl.searchParams.get('workspaceId');
    if (!wid) return NextResponse.json({ error: 'workspace_required' }, { status: 400 });
    const entries = await queryAudit({ workspaceId: wid, limit: 100 });
    return NextResponse.json({ success: true, entries });
  },
  { requireAuth: true, requirePermission: 'audit:read' }
);
