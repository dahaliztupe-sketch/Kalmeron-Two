import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const rl = rateLimit(request, { limit: 30, windowMs: 60_000, userId, scope: 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const snap = await adminDb
      .collection('whatsapp_conversations')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const conversations = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    }));

    return NextResponse.json({ conversations });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
