/**
 * POST /api/cap-table/save  — persist cap table to Firestore
 * GET  /api/cap-table/save  — load latest cap table for user
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import xss from 'xss';

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
      .collection('cap_tables')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) return NextResponse.json({ capTable: null });

    const doc = snap.docs[0];
    return NextResponse.json({ capTable: { id: doc.id, ...doc.data() } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await requireAuth(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = rateLimit(request, { limit: 20, windowMs: 60_000, userId, scope: 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const companyName = xss(String(body.companyName ?? '').slice(0, 200));
    const shareholders = body.shareholders ?? [];
    const history = body.history ?? [];

    if (!Array.isArray(shareholders)) {
      return NextResponse.json({ error: 'shareholders must be array' }, { status: 400 });
    }

    const snap = await adminDb
      .collection('cap_tables')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    const data = {
      userId,
      companyName,
      shareholders,
      history,
      updatedAt: Date.now(),
    };

    let docId: string;
    if (snap.empty) {
      const ref = await adminDb.collection('cap_tables').add({ ...data, createdAt: Date.now() });
      docId = ref.id;
    } else {
      docId = snap.docs[0].id;
      await adminDb.collection('cap_tables').doc(docId).set(data, { merge: true });
    }

    return NextResponse.json({ ok: true, id: docId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
