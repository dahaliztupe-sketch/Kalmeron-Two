import { NextResponse } from 'next/server';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { queryAudit, type AuditAction } from '@/src/lib/audit/log';

export const runtime = 'nodejs';

export const GET = guardedRoute(
  async ({ req }) => {
    const p = req.nextUrl.searchParams;
    const entries = await queryAudit({
      workspaceId: p.get('workspaceId') || undefined,
      actorId: p.get('actorId') || undefined,
      action: (p.get('action') as AuditAction) || undefined,
      resource: p.get('resource') || undefined,
      limit: Math.min(parseInt(p.get('limit') || '100'), 500),
    });
    return NextResponse.json({ success: true, entries });
  },
  { requireAuth: true, requirePlatformAdmin: true }
);
