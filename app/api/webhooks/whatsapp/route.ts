import { NextRequest, NextResponse } from 'next/server';
import { receptionistHandleChannelMessage } from '@/src/ai/receptionist/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Verification handshake (Meta sends GET with hub.* params on setup).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 });
  }
  return new NextResponse('forbidden', { status: 403 });
}

/**
 * Inbound messages from WhatsApp Business Cloud API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = body?.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const messages = change?.value?.messages || [];
        for (const m of messages) {
          const senderId = m.from;
          const text = m.text?.body || m.button?.text || '';
          if (!senderId || !text) continue;
          // fire and forget — webhook must ack quickly
          receptionistHandleChannelMessage({
            channel: 'whatsapp',
            senderId,
            text,
            raw: m,
          }).catch((e) => console.warn('[webhook:whatsapp]', e?.message));
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 200 });
  }
}
