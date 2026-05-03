import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/src/lib/firebase-admin';
import { provisionVM, runTaskOnVM } from '@/src/lib/virtual-office/vm-manager';
import { guardedRoute } from '@/src/lib/security/route-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('provision'),
    agentId: z.string().min(1).max(128),
    departmentId: z.string().min(1).max(64).default('general'),
  }),
  z.object({
    action: z.literal('run'),
    vmId: z.string().min(1).max(128),
    task: z.object({
      kind: z.enum(['shell', 'browse', 'email', 'fs-read', 'fs-write', 'custom']),
      payload: z.record(z.string(), z.any()),
    }),
    timeoutMs: z.number().int().min(1000).max(300_000).default(60_000),
  }),
]);

export const GET = guardedRoute(
  async ({ userId }) => {
    const snap = await adminDb
      .collection('virtual_office_vms')
      .where('userId', '==', userId)
      .limit(100)
      .get();
    const vms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ vms });
  },
  { requireAuth: true, rateLimit: { limit: 60, windowMs: 60_000 } }
);

export const POST = guardedRoute(
  async ({ body, userId }) => {
    if (body.action === 'provision') {
      const vm = await provisionVM(body.agentId, body.departmentId);
      await adminDb.collection('virtual_office_vms').doc(vm.id ?? body.agentId).set({ ...vm, userId }, { merge: true });
      return NextResponse.json({ vm });
    }
    const vmDoc = await adminDb.collection('virtual_office_vms').doc(body.vmId).get();
    if (!vmDoc.exists || (vmDoc.data() as Record<string, unknown>)['userId'] !== userId) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    const result = await runTaskOnVM(body.vmId, body.task, body.timeoutMs);
    return NextResponse.json({ result });
  },
  { schema: postSchema, requireAuth: true, rateLimit: { limit: 30, windowMs: 60_000 } }
);
