import { NextResponse } from 'next/server';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

export const GET = guardedRoute(
  async () => {
    const [ws, users, runs, audits] = await Promise.all([
      adminDb.collection('workspaces').limit(100).get(),
      adminDb.collection('users').limit(100).get().catch(() => ({ size: 0, docs: [] } as any)),
      adminDb.collection('launch_runs').limit(100).get().catch(() => ({ size: 0, docs: [] } as any)),
      adminDb.collection('audit_logs').orderBy('createdAt', 'desc').limit(25).get().catch(() => ({ docs: [] } as any)),
    ]);
    const workspaces = ws.docs.map((d) => {
      const data = d.data() as any;
      return { id: d.id, name: data.name || d.id, tier: data.tier || 'free' };
    });
    const recentAudit = audits.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
    return NextResponse.json({
      success: true,
      stats: {
        workspaces: ws.size,
        users: users.size,
        launchRuns: runs.size,
      },
      workspaces,
      recentAudit,
    });
  },
  { requireAuth: true, requirePlatformAdmin: true }
);
