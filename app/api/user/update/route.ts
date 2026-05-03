import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().max(120).optional(),
  startup_stage: z.string().max(60).optional(),
  industry: z.string().max(80).optional(),
  companyName: z.string().max(120).optional(),
  bio: z.string().max(400).optional(),
});

export const POST = guardedRoute(
  async ({ userId, body }) => {
    const updates: Record<string, string> = { updatedAt: new Date().toISOString() };
    const b = body as z.infer<typeof schema>;
    if (b.name !== undefined) updates.name = b.name;
    if (b.startup_stage !== undefined) updates.startup_stage = b.startup_stage;
    if (b.industry !== undefined) updates.industry = b.industry;
    if (b.companyName !== undefined) updates.companyName = b.companyName;
    if (b.bio !== undefined) updates.bio = b.bio;

    await adminDb.collection('users').doc(userId!).update(updates);
    return NextResponse.json({ ok: true, message: 'تم حفظ التغييرات بنجاح.' });
  },
  { requireAuth: true, schema }
);
