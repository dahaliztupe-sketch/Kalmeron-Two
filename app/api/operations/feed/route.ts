/**
 * Operations Room feed.
 *
 * GET /api/operations/feed?limit=50
 *   Returns: {
 *     integrations: { meta, all },
 *     summary: { pending, executed, executed_noop, failed, rejected },
 *     pending: [...]      // approval queue
 *     recent: [...]       // last N items (any status), newest first
 *   }
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { metaIntegrationStatus, integrationsStatus } from '@/src/ai/actions/registry';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

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

interface TimestampLike { _seconds: number }

function toMillis(ts: unknown): number | null {
  if (!ts) return null;
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'object' && ts !== null && typeof (ts as TimestampLike)._seconds === 'number') {
    return (ts as TimestampLike)._seconds * 1000;
  }
  return null;
}

type SummaryKey = 'pending' | 'executed' | 'executed_noop' | 'failed' | 'rejected';
const SUMMARY_KEYS = new Set<string>(['pending', 'executed', 'executed_noop', 'failed', 'rejected']);

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || '60'), 200);

  const integrations = { meta: metaIntegrationStatus(), all: integrationsStatus() };

  if (!adminDb?.collection) {
    return NextResponse.json({
      integrations,
      summary: { pending: 0, executed: 0, executed_noop: 0, failed: 0, rejected: 0 },
      pending: [],
      recent: [],
      warning: 'firestore_unavailable',
    });
  }

  const snap = await adminDb
    .collection('agent_actions')
    .where('userId', '==', userId)
    .limit(limit)
    .get()
    .catch(() => null);

  if (!snap || snap.empty) {
    return NextResponse.json({
      integrations,
      summary: { pending: 0, executed: 0, executed_noop: 0, failed: 0, rejected: 0 },
      pending: [],
      recent: [],
    });
  }

  const summary: Record<SummaryKey, number> = {
    pending: 0, executed: 0, executed_noop: 0, failed: 0, rejected: 0,
  };

  const safe: Array<Record<string, unknown>> = [];
  snap.forEach((d: DocumentSnapshot) => {
    const r = d.data() ?? {};
    const status = typeof r['status'] === 'string' ? r['status'] : '';
    if (SUMMARY_KEYS.has(status)) summary[status as SummaryKey]++;
    safe.push({
      id: d.id,
      actionId: r['actionId'],
      label: r['label'],
      input: r['input'],
      rationale: r['rationale'] || null,
      requestedBy: r['requestedBy'] || 'agent',
      status,
      result: r['result'] || null,
      error: r['error'] || null,
      createdAt: toMillis(r['createdAt']),
      decidedAt: toMillis(r['decidedAt']),
      executedAt: toMillis(r['executedAt']),
    });
  });

  safe.sort((a, b) => ((b.createdAt as number) || 0) - ((a.createdAt as number) || 0));
  const pending = safe.filter((r) => r.status === 'pending');

  return NextResponse.json({ integrations, summary, pending, recent: safe.slice(0, limit) });
}
