import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/firebase';
import { adminAuth } from '@/src/lib/firebase-admin';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const runtime = 'nodejs';

/**
 * SECURITY: Requires a valid Firebase ID token. The userId logged in the
 * deletion-request record is the authenticated UID — not a value supplied by
 * the client.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length).trim());
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    await addDoc(collection(db, 'deletion_requests'), {
      userId,
      requestedAt: serverTimestamp(),
      status: 'pending',
    });
    return NextResponse.json({ message: 'Request received. Processing...' });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
