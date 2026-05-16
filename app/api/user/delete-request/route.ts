import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

/**
 * SECURITY: Requires a valid Firebase ID token. The userId logged in the
 * deletion-request record is the authenticated UID — not a value supplied by
 * the client. Uses Admin SDK so Firestore security rules are bypassed and the
 * write is guaranteed even when the client-side rules deny direct access.
 */
export async function POST(req: NextRequest) {
  // Pre-deletion grace flow — allow a small flurry but block scripted abuse.
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

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
    await adminDb.collection('deletion_requests').add({
      userId,
      requestedAt: FieldValue.serverTimestamp(),
      status: 'pending',
    });
    return NextResponse.json({ message: 'Request received. Processing...' });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
