// @ts-nocheck
/**
 * Omnichannel Communication Gateway
 * ---------------------------------
 * بوابة موحدة لاستقبال وإرسال الرسائل عبر WhatsApp و Telegram والبريد.
 * كل قناة تعطّل تلقائياً إذا لم تتوفر بيانات اعتمادها (لا أعطال صامتة).
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type Channel = 'whatsapp' | 'telegram' | 'email';

export interface InboundMessage {
  channel: Channel;
  senderId: string;
  text: string;
  raw?: any;
  receivedAt: number;
}

export interface OutboundResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

/* ---------- shared helpers ---------- */

async function logMessage(direction: 'in' | 'out', msg: any) {
  try {
    await adminDb.collection('omnichannel_messages').add({
      direction,
      ...msg,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {/* best-effort */}
}

async function resolveUserByChannel(channel: Channel, senderId: string): Promise<string | null> {
  try {
    const snap = await adminDb
      .collection('channel_identities')
      .where('channel', '==', channel)
      .where('senderId', '==', senderId)
      .limit(1)
      .get();
    if (!snap.empty) return snap.docs[0].data().userId as string;
  } catch {}
  return null;
}

export async function receiveMessage(
  channel: Channel,
  message: { text: string; raw?: any },
  senderId: string
): Promise<InboundMessage & { userId: string | null }> {
  const inbound: InboundMessage = {
    channel,
    senderId,
    text: message.text,
    raw: message.raw,
    receivedAt: Date.now(),
  };
  const userId = await resolveUserByChannel(channel, senderId);
  await logMessage('in', { ...inbound, userId });
  return { ...inbound, userId };
}

export async function sendMessage(
  channel: Channel,
  message: { text: string; subject?: string; attachments?: any[] },
  recipientId: string
): Promise<OutboundResult> {
  let result: OutboundResult;
  try {
    if (channel === 'whatsapp') result = await sendWhatsApp(recipientId, message.text);
    else if (channel === 'telegram') result = await sendTelegram(recipientId, message.text);
    else if (channel === 'email') result = await sendEmail(recipientId, message.subject || '(no subject)', message.text);
    else result = { ok: false, error: `Unsupported channel: ${channel}` };
  } catch (err: any) {
    result = { ok: false, error: err?.message || String(err) };
  }
  await logMessage('out', { channel, recipientId, message, result });
  return result;
}

/* ---------- WhatsApp (Cloud API) ---------- */

async function sendWhatsApp(to: string, text: string): Promise<OutboundResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false, error: 'WhatsApp credentials missing' };
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  });
  if (!res.ok) return { ok: false, error: `WhatsApp HTTP ${res.status}` };
  const data = await res.json();
  return { ok: true, providerMessageId: data?.messages?.[0]?.id };
}

/* ---------- Telegram (Bot API) ---------- */

async function sendTelegram(chatId: string, text: string): Promise<OutboundResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: 'Telegram bot token missing' };
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) return { ok: false, error: `Telegram HTTP ${res.status}` };
  const data = await res.json();
  return { ok: true, providerMessageId: String(data?.result?.message_id ?? '') };
}

/* ---------- Email (SendGrid, fallback Gmail via SMTP not included) ---------- */

async function sendEmail(to: string, subject: string, body: string): Promise<OutboundResult> {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@kalmeron.app';
  if (!key) return { ok: false, error: 'SendGrid API key missing' };
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: 'text/plain', value: body }],
    }),
  });
  if (!res.ok && res.status !== 202) return { ok: false, error: `SendGrid HTTP ${res.status}` };
  return { ok: true, providerMessageId: res.headers.get('x-message-id') || undefined };
}
