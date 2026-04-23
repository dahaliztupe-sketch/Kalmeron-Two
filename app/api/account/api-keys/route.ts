import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { createApiKey, listApiKeys } from '@/src/lib/security/api-keys';

export const runtime = 'nodejs';

const createSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(64),
  scopes: z.array(z.string()).min(1).max(20),
});

export const POST = guardedRoute(
  async ({ userId, body }) => {
    const key = await createApiKey({
      ownerId: userId!,
      workspaceId: body.workspaceId,
      name: body.name,
      scopes: body.scopes,
    });
    return NextResponse.json({ success: true, key });
  },
  {
    requireAuth: true,
    schema: createSchema,
    requirePermission: 'apikey:manage',
    audit: { action: 'create', resource: 'api_key' },
    rateLimit: { limit: 10, windowMs: 60_000 },
  }
);

export const GET = guardedRoute(
  async ({ userId, req }) => {
    const workspaceId = req.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) return NextResponse.json({ error: 'workspace_required' }, { status: 400 });
    const keys = await listApiKeys(workspaceId, userId!);
    return NextResponse.json({ success: true, keys });
  },
  { requireAuth: true, requirePermission: 'apikey:manage' }
);
