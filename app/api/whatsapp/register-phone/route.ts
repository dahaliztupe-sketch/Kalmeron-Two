import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import xss from 'xss';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function requireAuth(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return dec.uid;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = await requireAuth(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = rateLimit(request, { limit: 20, windowMs: 60_000, userId, scope: 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const snap = await adminDb.collection('whatsapp_registrations').doc(userId).get();
    if (!snap.exists) return NextResponse.json({ registration: null });
    const data = snap.data();
    const { otpCode: _otp, ...safe } = data ?? {};
    return NextResponse.json({ registration: safe });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await requireAuth(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = rateLimit(request, { limit: 5, windowMs: 60_000, userId, scope: 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const rawPhone = xss(String(body.phone ?? '').slice(0, 30)).trim();
    if (!rawPhone) {
      return NextResponse.json({ error: 'phone required' }, { status: 400 });
    }

    const normalized = rawPhone.replace(/[\s\-().]/g, '');
    if (!/^\+?\d{7,15}$/.test(normalized)) {
      return NextResponse.json({ error: 'رقم هاتف غير صالح' }, { status: 400 });
    }

    const existing = await adminDb
      .collection('whatsapp_registrations')
      .where('normalizedPhone', '==', normalized)
      .where('verified', '==', true)
      .limit(1)
      .get();

    if (!existing.empty && existing.docs[0].id !== userId) {
      return NextResponse.json({ error: 'هذا الرقم مسجَّل ومُفعَّل لحساب آخر' }, { status: 409 });
    }

    const otpCode = String(crypto.randomInt(100000, 999999));
    const otpExpiresAt = Date.now() + OTP_TTL_MS;

    const data = {
      userId,
      phone: rawPhone,
      normalizedPhone: normalized,
      twilioPhone: normalized.startsWith('whatsapp:') ? normalized : `whatsapp:${normalized}`,
      otpCode,
      otpExpiresAt,
      verified: false,
      registeredAt: Date.now(),
      updatedAt: Date.now(),
    };

    await adminDb.collection('whatsapp_registrations').doc(userId).set(data, { merge: true });

    return NextResponse.json({
      ok: true,
      otpCode,
      message: `أرسل الرمز التالي عبر WhatsApp إلى رقم كلميرون للتحقق من ملكيتك للرقم: ${otpCode}`,
      expiresInMinutes: 15,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}
