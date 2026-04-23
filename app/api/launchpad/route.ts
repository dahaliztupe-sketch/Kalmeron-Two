import { NextResponse } from 'next/server';
import { z } from 'zod';
import { launchStartup, getLaunchRun } from '@/src/ai/launchpad/pipeline';
import { guardedRoute } from '@/src/lib/security/route-guard';

const postSchema = z.object({
  idea: z.string().min(10).max(4000),
  workspaceId: z.string().min(1).max(128).default('default'),
});

export const POST = guardedRoute(
  async ({ body }) => {
    const result = await launchStartup(body);
    return NextResponse.json(result);
  },
  { schema: postSchema, rateLimit: { limit: 5, windowMs: 60_000 } }
);

export const GET = guardedRoute(
  async ({ req }) => {
    const runId = req.nextUrl.searchParams.get('runId');
    if (!runId) return NextResponse.json({ error: 'runId required' }, { status: 400 });
    const run = await getLaunchRun(runId);
    return NextResponse.json({ run });
  },
  { rateLimit: { limit: 120, windowMs: 60_000 } }
);
