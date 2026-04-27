// @ts-nocheck
import { NextResponse } from 'next/server';
import { getRecipes } from '@/src/ai/recipes/registry';
import { getAction } from '@/src/ai/actions/registry';

export const runtime = 'nodejs';

export async function GET() {
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
