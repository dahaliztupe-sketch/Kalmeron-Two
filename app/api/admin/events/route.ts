import { NextResponse } from 'next/server';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { queryAudit } from '@/src/lib/audit/log';

export const runtime = 'nodejs';

export const GET = guardedRoute(
  async () => {
    const entries = await queryAudit({ action: 'agent_run', limit: 50 });
    return NextResponse.json({ success: true, entries });
  },
  { requireAuth: true, requirePlatformAdmin: true }
);
