// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getRecipes } from '@/src/ai/recipes/registry';
import { getAction } from '@/src/ai/actions/registry';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Static catalog — generous cap, but still protect against scrape floods.
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const recipes = getRecipes().map((r) => ({
    ...r,
    steps: r.steps.map((s) => {
      const a = getAction(s.actionId);
      return {
        ...s,
        actionLabel: a?.label,
        requiresApproval: a?.requiresApproval ?? true,
      };
    }),
  }));
  return NextResponse.json({ recipes });
}
