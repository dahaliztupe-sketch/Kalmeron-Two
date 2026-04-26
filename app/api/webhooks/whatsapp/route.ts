import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
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
 * Verify Meta's `X-Hub-Signature-256` header against the raw body using
 * the WhatsApp App Secret. Constant-time comparison prevents timing leaks.
 * Returns true when the signature is missing AND the secret is missing
 * only in non-production (so local development without a secret still
 * works); in production we always require the signature.
 */
function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    // In production we must have a secret configured.
    return process.env.NODE_ENV !== 'production';
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  const provided = signatureHeader.slice('sha256='.length);
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  // Both buffers must be the same length for timingSafeEqual.
  if (provided.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Inbound messages from WhatsApp Business Cloud API.
 *
 * SECURITY: Validates Meta's HMAC-SHA256 signature so attackers cannot
 * inject arbitrary `receptionistHandleChannelMessage` calls.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verifyMetaSignature(rawBody, req.headers.get('x-hub-signature-256'))) {
      return new NextResponse('invalid signature', { status: 401 });
    }

    let body: { entry?: Array<{ changes?: Array<{ value?: { messages?: Array<Record<string, unknown>> } }> }> };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

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
  } catch (e: unknown) {
    // Return 200 so Meta does not retry on transient app bugs.
    return NextResponse.json({ ok: false, error: e?.message }, { status: 200 });
  }
}
