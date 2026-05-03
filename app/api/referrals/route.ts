import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getReferralStats, recordReferral, ensureReferralCode } from '@/src/lib/referrals/manager';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await ensureReferralCode(uid);
  const stats = await getReferralStats(uid);
  return NextResponse.json(stats);
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const code = (body.code || '').trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'code_required' }, { status: 400 });

  const ok = await recordReferral(uid, code);
  if (!ok) {
    return NextResponse.json({ ok: false, message: 'Code invalid or already used' }, { status: 200 });
  }

  return NextResponse.json({ ok: true, message: 'تم تطبيق كود الإحالة! حصلت على 500 رصيد إضافي.' });
}
