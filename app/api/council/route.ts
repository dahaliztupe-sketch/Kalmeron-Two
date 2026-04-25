import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runCouncilSafe } from '@/src/ai/panel';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { adminAuth } from '@/src/lib/firebase-admin';
import { logger } from '@/src/lib/logger';

export const runtime = 'nodejs';

/**
 * Soft auth: derive userId from Bearer token if present so abuse is
 * traceable; fall back to "guest" with a stricter per-IP rate limit.
 * This endpoint runs the full multi-agent council, which is expensive,
 * so anonymous traffic is rate-limited more aggressively than authed.
 */
async function softAuth(req: NextRequest): Promise<{ userId: string; isGuest: boolean }> {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
      return { userId: dec.uid, isGuest: false };
    } catch {
      /* fall through */
    }
  }
  return { userId: 'guest', isGuest: true };
}

const bodySchema = z.object({
  agentName: z.string().min(1).max(64).default('general-chat'),
  agentDisplayNameAr: z.string().max(64).optional(),
  agentRoleAr: z
    .string()
    .min(1)
    .max(500)
    .default('المستشار الاستراتيجي العام لرواد الأعمال المصريين'),
  message: z.string().min(2).max(4000),
  uiContext: z.record(z.string(), z.unknown()).optional(),
  draft: z.string().max(8000).optional(),
  /** UX-driven mode: 'fast' skips the router for sub-3s replies. */
  mode: z.enum(['fast', 'deep']).optional(),
});

/**
 * POST /api/council
 * نقطة اختبار وتجربة "مجلس الإدارة الافتراضي" مباشرةً.
 * تُرجع المخرج المنظّم + Markdown + معلومات التداول الداخلي.
 */
export async function POST(req: NextRequest) {
  const { userId, isGuest } = await softAuth(req);
  const rl = rateLimit(req, {
    limit: isGuest ? 3 : 10,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();
  if (isGuest) {
    logger.warn({ event: 'council_guest_call', path: '/api/council' }, 'council_guest_call');
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;
  const { markdown, result, error } = await runCouncilSafe({
    agentName: body.agentName,
    agentDisplayNameAr: body.agentDisplayNameAr,
    agentRoleAr: body.agentRoleAr,
    userMessage: body.message,
    uiContext: body.uiContext,
    draft: body.draft,
    mode: body.mode,
  });

  if (error && !result) {
    return NextResponse.json({ markdown, error }, { status: 502 });
  }

  return NextResponse.json({
    markdown,
    output: result?.output,
    meta: result?.meta,
  });
}
