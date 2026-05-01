import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { requestAction } from '@/src/ai/actions/registry';
import { rateLimit } from '@/src/lib/security/rate-limit';

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

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'request_failed';
}

export async function POST(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, userId, scope: 'action-request' });
  if (!rl.success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { actionId, input, rationale } = body;
  if (typeof actionId !== 'string' || !actionId) {
    return NextResponse.json({ error: 'actionId_required' }, { status: 400 });
  }

  try {
    const r = await requestAction({
      userId,
      actionId,
      input: (input && typeof input === 'object' ? input : {}) as Record<string, unknown>,
      rationale: typeof rationale === 'string' ? rationale : undefined,
      requestedBy: 'user',
    });
    return NextResponse.json({ ok: true, ...r });
  } catch (e: unknown) {
    return NextResponse.json({ error: errMsg(e) }, { status: 400 });
  }
}
