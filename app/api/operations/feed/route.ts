// @ts-nocheck
/**
 * Operations Room feed.
 *
 * GET /api/operations/feed?limit=50
 *   Returns: {
 *     integrations: { meta: { configured, pageConfigured } },
 *     summary: { pending, executed, executed_noop, failed, rejected },
 *     pending: [...]      // approval queue
 *     recent: [...]       // last N items (any status), newest first
 *   }
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { metaIntegrationStatus } from '@/src/ai/actions/registry';

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

function toMillis(ts: unknown): number | null {
  if (!ts) return null;
  if (typeof ts === 'number') return ts;
  if (typeof ts?._seconds === 'number') return ts._seconds * 1000;
  return null;
}

export async function GET(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || '60'), 200);

  const integrations = { meta: metaIntegrationStatus() };

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

  const rows: unknown[] = [];
  snap.forEach((d: unknown) => rows.push({ id: d.id, ...d.data() }));

  const summary = { pending: 0, executed: 0, executed_noop: 0, failed: 0, rejected: 0 };
  const safe = rows
    .map((r) => {
      if (summary[r.status] !== undefined) summary[r.status]++;
      return {
        id: r.id,
        actionId: r.actionId,
        label: r.label,
        input: r.input,
        rationale: r.rationale || null,
        requestedBy: r.requestedBy || 'agent',
        status: r.status,
        result: r.result || null,
        error: r.error || null,
        createdAt: toMillis(r.createdAt),
        decidedAt: toMillis(r.decidedAt),
        executedAt: toMillis(r.executedAt),
      };
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const pending = safe.filter((r) => r.status === 'pending');

  return NextResponse.json({
    integrations,
    summary,
    pending,
    recent: safe.slice(0, limit),
  });
}
