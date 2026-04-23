import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { listNotifications, unreadCount, markRead, markAllRead } from '@/src/lib/notifications/center';

export const runtime = 'nodejs';

export const GET = guardedRoute(
  async ({ userId }) => {
    const [items, count] = await Promise.all([
      listNotifications(userId!, 50),
      unreadCount(userId!),
    ]);
    return NextResponse.json({ success: true, items, unread: count });
  },
  { requireAuth: true }
);

export const POST = guardedRoute(
  async ({ userId, body }) => {
    if (body.all) {
      const n = await markAllRead(userId!);
      return NextResponse.json({ success: true, marked: n });
    }
    if (body.ids && body.ids.length) {
      await markRead(userId!, body.ids);
      return NextResponse.json({ success: true, marked: body.ids.length });
    }
    return NextResponse.json({ error: 'nothing_to_do' }, { status: 400 });
  },
  {
    requireAuth: true,
    schema: z.object({
      all: z.boolean().optional(),
      ids: z.array(z.string()).optional(),
    }),
  }
);
