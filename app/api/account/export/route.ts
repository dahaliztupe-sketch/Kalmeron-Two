import { NextResponse } from 'next/server';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { adminDb } from '@/src/lib/firebase-admin';
import { writeAudit, extractClientInfo } from '@/src/lib/audit/log';

export const runtime = 'nodejs';

const COLLECTIONS = [
  'workspaces',
  'workspace_members',
  'learned_skills',
  'launch_runs',
  'meetings',
  'experts',
  'notifications',
  'api_keys',
  'webhook_subscriptions',
];

export const GET = guardedRoute(
  async ({ userId, req }) => {
    const bundle: Record<string, any[]> = {};
    for (const col of COLLECTIONS) {
      try {
        // Try common user-scope fields
        const fields = ['ownerId', 'userId', 'createdBy', 'creatorId'];
        const docs: any[] = [];
        for (const f of fields) {
          try {
            const snap = await adminDb.collection(col).where(f, '==', userId!).limit(500).get();
            snap.docs.forEach((d) => docs.push({ id: d.id, ...(d.data() as any) }));
          } catch {}
        }
        bundle[col] = docs;
      } catch {
        bundle[col] = [];
      }
    }
    writeAudit({
      actorId: userId, actorType: 'user', action: 'export', resource: 'account',
      success: true, ...extractClientInfo(req as any),
    }).catch(() => {});
    return new NextResponse(JSON.stringify({ exportedAt: Date.now(), userId, data: bundle }, null, 2), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'content-disposition': `attachment; filename="kalmeron-export-${userId}.json"`,
      },
    });
  },
  { requireAuth: true, rateLimit: { limit: 3, windowMs: 3600_000 } }
);
