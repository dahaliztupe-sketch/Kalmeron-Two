import { NextRequest, NextResponse } from 'next/server';
import { receptionistHandleChannelMessage } from '@/src/ai/receptionist/agent';
import { toErrorMessage } from '@/src/lib/errors/to-message';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Telegram bot webhook. Set with:
 *   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<APP>/api/webhooks/telegram&secret_token=<SECRET>"
 */
export async function POST(req: NextRequest) {
  // Telegram secret token is verified below; this cap is a DoS shield.
  const rl = rateLimit(req, { limit: 600, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  // S005 — User-controlled bypass mitigation: we do NOT gate security on
  // NODE_ENV (which can be set externally). Instead, when the secret is
  // configured we always enforce it; when it is absent we fail-open only
  // if we are explicitly not in a production build (checked via VERCEL_ENV
  // or the Next.js NEXT_PHASE env, which are set by the build system, not
  // user input).
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) {
    const isProduction =
      process.env.VERCEL_ENV === 'production' ||
      process.env.NEXT_PHASE === 'phase-production-server';
    if (isProduction) {
      return NextResponse.json({ ok: false, error: 'webhook_not_configured' }, { status: 503 });
    }
    // Local development: allow through without a secret token.
  } else if (req.headers.get('x-telegram-bot-api-secret-token') !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const msg = body?.message || body?.edited_message || body?.channel_post;
    if (msg) {
      const senderId = String(msg.chat?.id ?? msg.from?.id ?? '');
      const text = msg.text || msg.caption || '';
      if (senderId && text) {
        receptionistHandleChannelMessage({
          channel: 'telegram',
          senderId,
          text,
          raw: msg,
        }).catch(async (e: unknown) => { const { logger } = await import('@/src/lib/logger'); logger.warn({ event: 'telegram_handler_failed', error: toErrorMessage(e) }); });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: toErrorMessage(e) }, { status: 200 });
  }
}
