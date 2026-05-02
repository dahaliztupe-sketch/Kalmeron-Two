/**
 * GET /api/operations — summary of operations room
 * Wraps the feed endpoint for quick status checks
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!adminDb?.collection) {
    return NextResponse.json({
      summary: { pending: 0, executed: 0, failed: 0, total: 0 },
      recentActions: [],
      warning: 'firestore_unavailable',
    });
  }

  const snap = await adminDb
    .collection('agent_actions')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
    .catch(() => null);

  if (!snap || snap.empty) {
    return NextResponse.json({
      summary: { pending: 0, executed: 0, failed: 0, total: 0 },
      recentActions: [],
    });
  }

  const actions: Record<string, unknown>[] = [];
  let pending = 0, executed = 0, failed = 0;

  snap.forEach((d) => {
    const r = d.data();
    if (r['status'] === 'pending') pending++;
    if (r['status'] === 'executed' || r['status'] === 'executed_noop') executed++;
    if (r['status'] === 'failed') failed++;
    actions.push({
      id: d.id,
      label: r['label'],
      status: r['status'],
      requestedBy: r['requestedBy'] || 'agent',
      createdAt: r['createdAt'],
    });
  });

  return NextResponse.json({
    summary: { pending, executed, failed, total: snap.size },
    recentActions: actions,
  });
}
