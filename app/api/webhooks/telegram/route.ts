import { NextRequest, NextResponse } from 'next/server';
import { receptionistHandleChannelMessage } from '@/src/ai/receptionist/agent';
import { toErrorMessage } from '@/src/lib/errors/to-message';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Telegram bot webhook. Set with:
 *   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<APP>/api/webhooks/telegram&secret_token=<SECRET>"
 */
export async function POST(req: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) {
    // In production a secret must be configured; otherwise anyone can spam the bot.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ ok: false, error: 'webhook_not_configured' }, { status: 503 });
    }
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
        }).catch((e: unknown) => console.warn('[webhook:telegram]', toErrorMessage(e)));
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: toErrorMessage(e) }, { status: 200 });
  }
}
