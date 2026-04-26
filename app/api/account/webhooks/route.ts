import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { createSubscription, listSubscriptions, type WebhookEvent } from '@/src/lib/webhooks/dispatcher';

export const runtime = 'nodejs';

const schema = z.object({
  workspaceId: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

export const POST = guardedRoute(
  async ({ userId, body }) => {
    const sub = await createSubscription({
      ownerId: userId!,
      workspaceId: body.workspaceId,
      url: body.url,
      events: body.events as WebhookEvent[],
    });
    return NextResponse.json({ success: true, subscription: sub });
  },
  {
    requireAuth: true,
    schema,
    requirePermission: 'webhook:manage',
    audit: { action: 'create', resource: 'webhook' },
  }
);

export const GET = guardedRoute(
  async ({ req }) => {
    const wid = req.nextUrl.searchParams.get('workspaceId');
    if (!wid) return NextResponse.json({ error: 'workspace_required' }, { status: 400 });
    const subs = await listSubscriptions(wid);
    return NextResponse.json({ success: true, subscriptions: subs });
  },
  { requireAuth: true, requirePermission: 'webhook:manage' }
);
