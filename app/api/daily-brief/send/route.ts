// @ts-nocheck
/**
 * POST /api/daily-brief/send
 * Body: { channels?: ("whatsapp"|"email")[], dryRun?: boolean }
 * Generates today's brief and sends to user via configured channels.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { generateDailyBrief, formatBriefForChannel } from '@/src/lib/daily-brief/generator';
import { sendMessage as sendOmnichannelMessage } from '@/src/lib/integrations/omnichannel';
import { rateLimit, rateLimitAgent } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

async function authedUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return decoded.uid || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ipRl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!ipRl.success) return new NextResponse('Too Many Requests', { status: 429 });

  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const userRl = rateLimitAgent(uid, 'daily_brief_send', { limit: 5, windowMs: 60_000 });
  if (!userRl.allowed) return new NextResponse('Too Many Requests', { status: 429 });

  let body: { channels?: unknown; dryRun?: unknown } = {};
  try { body = await req.json(); } catch {}
  const requestedChannels: string[] = Array.isArray(body.channels) && body.channels.length > 0
    ? (body.channels as string[])
    : ['whatsapp', 'email'];
  const dryRun = !!body.dryRun;

  const prefSnap = await adminDb.collection('users').doc(uid).collection('preferences').doc('daily_brief').get().catch(() => null);
  const prefs = prefSnap?.data() || {};

  const brief = await generateDailyBrief(uid);
  const results: Record<string, { ok?: boolean; dryRun?: boolean; preview?: string; error?: string }> = {};
  const targets: Array<{ channel: 'whatsapp' | 'email'; recipient: string }> = [];

  if (requestedChannels.includes('whatsapp') && (prefs.whatsapp ?? false) && prefs.phoneE164) {
    targets.push({ channel: 'whatsapp', recipient: prefs.phoneE164 });
  }
  if (requestedChannels.includes('email') && (prefs.email ?? true) && prefs.emailAddress) {
    targets.push({ channel: 'email', recipient: prefs.emailAddress });
  }

  if (targets.length === 0) {
    return NextResponse.json({
      ok: false,
      error: 'no_destination_configured',
      hint: 'فعّل قناة (واتساب أو إيميل) وأدخل رقم/عنوان من الإعدادات أوّلاً.',
      brief,
    }, { status: 400 });
  }

  for (const t of targets) {
    const text = formatBriefForChannel(brief, t.channel);
    if (dryRun) {
      results[t.channel] = { ok: true, dryRun: true, preview: text };
      continue;
    }
    const r = await sendOmnichannelMessage(
      t.channel,
      { subject: 'إيجاز كلميرون اليومي', text },
      t.recipient,
    ).catch((e: unknown) => ({ ok: false, error: (e as Error)?.message || String(e) }));
    results[t.channel] = r;
  }

  try {
    await adminDb.collection('daily_brief_deliveries').add({
      userId: uid,
      generatedAt: brief.generatedAt,
      channels: targets.map((t) => t.channel),
      results,
      sentAt: new Date(),
      dryRun,
    });
  } catch {}

  const anyOk = Object.values(results).some((r) => r?.ok);
  return NextResponse.json({ ok: anyOk, results, brief });
}
