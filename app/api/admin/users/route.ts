import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { requirePlatformAdmin } from '@/src/lib/security/require-admin';
import { toErrorMessage } from '@/src/lib/errors/to-message';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requirePlatformAdmin(req);
  if (guard instanceof Response) return guard;

  if (!adminDb?.collection) {
    return NextResponse.json({ users: [], note: 'Firebase Admin not configured.' });
  }

  try {
    const snap = await adminDb.collection('users').limit(100).get();
    const users = snap.docs.map((d) => {
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
  } catch (e: unknown) {
    return NextResponse.json({ error: toErrorMessage(e, 'Failed to load users') }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requirePlatformAdmin(req);
  if (guard instanceof Response) return guard;

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
  } catch (e: unknown) {
    return NextResponse.json({ error: toErrorMessage(e, 'Delete failed') }, { status: 500 });
  }
}
