import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

const schema = z.object({
  emailMarketing: z.boolean().optional(),
  emailProduct: z.boolean().optional(),
  inappMentions: z.boolean().optional(),
  inappWeekly: z.boolean().optional(),
});

export const GET = guardedRoute(
  async ({ userId }) => {
    const doc = await adminDb.collection('users').doc(userId!).get();
    const prefs = doc.data()?.notificationPrefs ?? {
      emailMarketing: true,
      emailProduct: true,
      inappMentions: true,
      inappWeekly: false,
    };
    return NextResponse.json({ ok: true, prefs });
  },
  { requireAuth: true }
);

export const POST = guardedRoute(
  async ({ userId, body }) => {
    await adminDb.collection('users').doc(userId!).update({
      notificationPrefs: body,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  },
  { requireAuth: true, schema }
);
