import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runCoordinator } from '@/src/ai/supervisor/coordinator';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitAgent, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  goal: z.string().min(1).max(2_000),
});

/**
 * POST /api/supervisor — runs the AI coordinator on a user-supplied goal.
 *
 * SECURITY: Requires a Firebase ID token. Per-IP and per-user rate limits
 * are conservative because each invocation can fan out to multiple agents
 * and consume model tokens. Goal is hard-bounded to 2 KB to prevent
 * prompt-stuffing attacks (LLM01 / LLM04 — OWASP LLM Top 10).
 */
export async function POST(req: NextRequest) {
  // 1) Per-IP rate limit (anonymous abuse defense)
  const ipRl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!ipRl.success) return rateLimitResponse();

  // 2) Authenticate
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length).trim());
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // 3) Per-user rate limit (coordinator runs are expensive)
  const userRl = rateLimitAgent(userId, 'supervisor_run', { limit: 5, windowMs: 60_000 });
  if (!userRl.allowed) return rateLimitResponse();

  // 4) Validate body
  let parsed: z.infer<typeof bodySchema>;
  try {
    const raw = await req.json();
    const out = bodySchema.safeParse(raw);
    if (!out.success) {
      return NextResponse.json(
        { error: 'invalid_body', details: out.error.flatten() },
        { status: 400 },
      );
    }
    parsed = out.data;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  try {
    const result = await runCoordinator(parsed.goal);
    return NextResponse.json({ result });
  } catch (error) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: error, userId }, 'Supervisor Engine Error');
    return NextResponse.json(
      { error: 'Failed to process coordinator task' },
      { status: 500 },
    );
  }
}
