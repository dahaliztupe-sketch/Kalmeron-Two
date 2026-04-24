import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runCouncilSafe } from '@/src/ai/panel';
import { rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  agentName: z.string().min(1).max(64).default('general-chat'),
  agentDisplayNameAr: z.string().max(64).optional(),
  agentRoleAr: z
    .string()
    .min(1)
    .max(500)
    .default('المستشار الاستراتيجي العام لرواد الأعمال المصريين'),
  message: z.string().min(2).max(4000),
  uiContext: z.record(z.unknown()).optional(),
  draft: z.string().max(8000).optional(),
});

/**
 * POST /api/council
 * نقطة اختبار وتجربة "مجلس الإدارة الافتراضي" مباشرةً.
 * تُرجع المخرج المنظّم + Markdown + معلومات التداول الداخلي.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

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
