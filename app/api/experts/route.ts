import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createExpertFromDescription,
  saveExpert,
  listExperts,
  invokeExpert,
} from '@/src/ai/experts/expert-factory';
import { guardedRoute } from '@/src/lib/security/route-guard';

const postSchema = z.union([
  z.object({
    action: z.literal('invoke'),
    expertId: z.string().min(1).max(128),
    message: z.string().min(1).max(4000),
  }),
  z.object({
    description: z.string().min(10).max(2000),
    creatorId: z.string().min(1).max(128).default('anonymous'),
    workspaceId: z.string().min(1).max(128).optional(),
  }),
]);

export const GET = guardedRoute(
  async ({ req }) => {
    const workspaceId = req.nextUrl.searchParams.get('workspaceId') || undefined;
    const experts = await listExperts({ workspaceId });
    return NextResponse.json({ experts });
  },
  { rateLimit: { limit: 60, windowMs: 60_000 } }
);

export const POST = guardedRoute(
  async ({ body }) => {
    if ('action' in body && body.action === 'invoke') {
      const output = await invokeExpert(body.expertId, body.message);
      return NextResponse.json({ output });
    }
    const b = body as Extract<typeof body, { description: string }>;
    const expert = await createExpertFromDescription(b.description, b.creatorId, {
      workspaceId: b.workspaceId,
    });
    const id = await saveExpert(expert);
    return NextResponse.json({ expert: { ...expert, id } });
  },
  { schema: postSchema, rateLimit: { limit: 15, windowMs: 60_000 } }
);
