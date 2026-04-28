// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { runRecipe } from '@/src/ai/recipes/runner';
import { RecipeRunSchema } from '@/src/ai/recipes/registry';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  if (!adminAuth?.verifyIdToken) return null;
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const d = await adminAuth.verifyIdToken(token);
    return d.uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Recipe execution is the most expensive endpoint (multi-step LLM calls).
  // Cap aggressively per IP/user to protect downstream cost + token quota.
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const parsed = RecipeRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 });
  }
  const r = await runRecipe({ userId, ...parsed.data });
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json(r);
}
