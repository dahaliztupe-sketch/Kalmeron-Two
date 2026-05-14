import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listSkills, consolidateSkills } from '@/src/lib/evolution/learning-loop';
import { guardedRoute } from '@/src/lib/security/route-guard';

const postSchema = z.object({
  workspaceId: z.string().min(1).max(128).default('default'),
});

export const GET = guardedRoute(
  async ({ req }) => {
    const raw = req.nextUrl.searchParams.get('workspaceId') || 'default';
    // S011 — Reject workspaceId values that look structurally invalid.
    // Prevents path-traversal-style values like "../other" reaching the
    // storage layer while still allowing the 'default' fallback.
    const workspaceId = /^[\w\-]{1,128}$/.test(raw) ? raw : 'default';
    const skills = await listSkills(workspaceId);
    return NextResponse.json({ skills });
  },
  { requireAuth: true, rateLimit: { limit: 60, windowMs: 60_000 } }
);

export const POST = guardedRoute(
  async ({ body }) => {
    const report = await consolidateSkills(body.workspaceId);
    return NextResponse.json({ report });
  },
  { schema: postSchema, rateLimit: { limit: 5, windowMs: 60_000 }, requireAuth: false }
);
