import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/src/lib/firebase-admin';
import { conveneMeeting, detectCollaborationOpportunity } from '@/src/ai/orchestrator/virtual-meeting';
import { guardedRoute } from '@/src/lib/security/route-guard';

const postSchema = z.object({
  topic: z.string().min(5).max(2000),
  departmentIds: z.array(z.string().min(1).max(64)).min(1).max(12),
  context: z.record(z.any()).optional(),
});

export const GET = guardedRoute(
  async () => {
    const snap = await adminDb
      .collection('virtual_meetings')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const meetings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const opportunities = await detectCollaborationOpportunity();
    return NextResponse.json({ meetings, opportunities });
  },
  { rateLimit: { limit: 60, windowMs: 60_000 } }
);

export const POST = guardedRoute(
  async ({ body }) => {
    const meeting = await conveneMeeting(body.topic, body.departmentIds, body.context || {});
    return NextResponse.json({ meeting });
  },
  { schema: postSchema, rateLimit: { limit: 10, windowMs: 60_000 } }
);
