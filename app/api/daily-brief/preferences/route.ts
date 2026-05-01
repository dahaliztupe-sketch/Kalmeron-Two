/**
 * Daily Brief delivery preferences.
 * GET  → current preferences for the authed user
 * PUT  → update preferences { whatsapp, email, phoneE164, emailAddress, sendAtHour, timezone }
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

const DEFAULTS = {
  whatsapp: false,
  email: true,
  phoneE164: '',
  emailAddress: '',
  sendAtHour: 8,
  timezone: 'Africa/Cairo',
};

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

export async function GET(req: NextRequest) {
  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  try {
    const snap = await adminDb
      .collection('users')
      .doc(uid)
      .collection('preferences')
      .doc('daily_brief')
      .get();
    const data = snap.exists ? { ...DEFAULTS, ...(snap.data() ?? {}) } : DEFAULTS;
    return NextResponse.json({ preferences: data });
  } catch {
    return NextResponse.json({ preferences: DEFAULTS });
  }
}

export async function PUT(req: NextRequest) {
  const uid = await authedUid(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const cleaned: Record<string, unknown> = {};
  if (typeof body['whatsapp'] === 'boolean') cleaned['whatsapp'] = body['whatsapp'];
  if (typeof body['email'] === 'boolean') cleaned['email'] = body['email'];
  if (typeof body['phoneE164'] === 'string') {
    cleaned['phoneE164'] = (body['phoneE164'] as string).replace(/[^\d+]/g, '').slice(0, 20);
  }
  if (typeof body['emailAddress'] === 'string') {
    cleaned['emailAddress'] = (body['emailAddress'] as string).trim().slice(0, 200);
  }
  if (
    typeof body['sendAtHour'] === 'number' &&
    body['sendAtHour'] >= 0 &&
    body['sendAtHour'] <= 23
  ) {
    cleaned['sendAtHour'] = Math.floor(body['sendAtHour'] as number);
  }
  if (typeof body['timezone'] === 'string') {
    cleaned['timezone'] = (body['timezone'] as string).slice(0, 64);
  }
  cleaned['updatedAt'] = new Date();

  try {
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('preferences')
      .doc('daily_brief')
      .set(cleaned, { merge: true });
    const snap = await adminDb
      .collection('users')
      .doc(uid)
      .collection('preferences')
      .doc('daily_brief')
      .get();
    return NextResponse.json({ ok: true, preferences: { ...DEFAULTS, ...(snap.data() ?? {}) } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'save_failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
