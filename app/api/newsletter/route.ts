import { NextRequest, NextResponse } from 'next/server';
import { subscribe, unsubscribe, isValidEmail } from '@/src/lib/newsletter/subscribers';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  let body: { email?: string; source?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const email = (body.email || '').trim();
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    undefined;

  const result = await subscribe({
    email,
    source: body.source || 'unknown',
    locale: body.locale || 'ar',
    ip,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason || 'failed' }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    alreadySubscribed: result.alreadySubscribed || false,
    message: result.alreadySubscribed
      ? 'أنت مشترك بالفعل في النشرة'
      : 'تم اشتراكك بنجاح! ترقب أول رسالة قريباً.',
  });
}

export async function DELETE(req: NextRequest) {
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const { searchParams } = new URL(req.url);
  const email = (searchParams.get('email') || '').trim();
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }
  const ok = await unsubscribe(email);
  return NextResponse.json({ ok });
}
