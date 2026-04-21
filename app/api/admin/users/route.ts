import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

async function requireAdmin(req: NextRequest): Promise<{ uid: string; email: string } | NextResponse> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const dec = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    const email = (dec.email || '').toLowerCase();
    if (ADMIN_EMAILS.length && !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return { uid: dec.uid, email };
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  if (!adminDb?.collection) {
    return NextResponse.json({ users: [], note: 'Firebase Admin not configured.' });
  }

  try {
    const snap = await adminDb.collection('users').limit(100).get();
    const users = snap.docs.map((d: any) => {
      const data = d.data() || {};
      return {
        id: d.id,
        name: data.name || data.displayName || null,
        email: data.email || null,
        industry: data.industry || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.created_at || null,
      };
    });
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load users' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { uid } = await req.json().catch(() => ({ uid: null }));
  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'uid required' }, { status: 400 });
  }
  if (!adminDb?.collection || !adminAuth?.deleteUser) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 503 });
  }

  try {
    await Promise.allSettled([
      adminDb.collection('users').doc(uid).delete(),
      adminDb.collection('user_memory').doc(uid).delete(),
      adminDb.collection('chat_history').doc(uid).delete(),
    ]);
    await adminAuth.deleteUser(uid).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Delete failed' }, { status: 500 });
  }
}
