// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listInbox, decideAction, listActions } from '@/src/ai/actions/registry';
import { recordAudit } from '@/src/lib/workspaces/workspaces';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid || null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const status = new URL(req.url).searchParams.get('status') || undefined;
  const items = await listInbox(userId, status as unknown);
  const safe = items.map((r) => ({
    id: r.id,
    actionId: r.actionId,
    label: r.label,
    input: r.input,
    rationale: r.rationale,
    requestedBy: r.requestedBy,
    status: r.status,
    result: r.result || null,
    error: r.error || null,
    createdAt: r.createdAt?._seconds ? r.createdAt._seconds * 1000 : null,
    decidedAt: r.decidedAt?._seconds ? r.decidedAt._seconds * 1000 : null,
  }));
  return NextResponse.json({ items: safe, registry: listActions() });
}

export async function POST(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  let body: unknown; try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const { actionDocId, decision, editedInput } = body || {};
  if (!actionDocId || (decision !== 'approve' && decision !== 'reject')) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  try {
    const r = await decideAction({ userId, actionDocId, decision, editedInput });
    await recordAudit({
      userId,
      action: decision === 'approve' ? 'action.approve' : 'action.reject',
      target: actionDocId,
      details: { status: r.status, error: r.error || null },
    });
    return NextResponse.json({ ok: true, ...r });
  } catch (e: unknown) {
    return NextResponse.json({ error: e?.message || 'decide_failed' }, { status: 400 });
  }
}
