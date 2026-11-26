import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export const POST = guardedRoute(
  async ({ userId }) => {
    const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await adminDb.collection('account_deletions').doc(userId!).set({
      userId,
      requestedAt: FieldValue.serverTimestamp(),
      scheduledFor: until,
      status: 'pending',
    });
    return NextResponse.json({
      success: true,
      scheduledFor: until.toISOString(),
      message: 'سُجّل طلب الحذف فقط. لا توجد مهمة آلية تنفّذه بعد، فللحذف الفوري لبياناتك المحفوظة استخدم «حذف بياناتي» في الإعدادات.',
    });
  },
  {
    requireAuth: true,
    schema: z.object({ confirm: z.literal(true) }),
    audit: { action: 'delete', resource: 'account' },
    rateLimit: { limit: 3, windowMs: 3600_000 },
  }
);
