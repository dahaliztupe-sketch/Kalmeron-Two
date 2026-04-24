/**
 * /api/auth/mark-signup — TTFV stage marker for new signups.
 *
 * Called once by the client immediately after Firebase Auth sign-up
 * (Google or email). Idempotent: calling again is a no-op because
 * `markTtfvStage` only writes the timestamp on first hit.
 *
 * P0-3 from Virtual Boardroom 201.
 */
import { NextRequest } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { markTtfvStage } from '@/src/lib/analytics/ttfv';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token!);
    userId = decoded.uid;
  } catch {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  await markTtfvStage({ userId, stage: 'signup' });
  return Response.json({ ok: true });
}
