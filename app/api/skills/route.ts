import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listSkills, consolidateSkills } from '@/src/lib/evolution/learning-loop';
import { guardedRoute } from '@/src/lib/security/route-guard';

const postSchema = z.object({
  workspaceId: z.string().min(1).max(128).default('default'),
});

export const GET = guardedRoute(
  async ({ req }) => {
    const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'default';
    const skills = await listSkills(workspaceId);
    return NextResponse.json({ skills });
  },
  { rateLimit: { limit: 60, windowMs: 60_000 } }
);

export const POST = guardedRoute(
  async ({ body }) => {
    const report = await consolidateSkills(body.workspaceId);
    return NextResponse.json({ report });
  },
  { schema: postSchema, rateLimit: { limit: 5, windowMs: 60_000 }, requireAuth: false }
);
