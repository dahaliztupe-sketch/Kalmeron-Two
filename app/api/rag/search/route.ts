import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { searchUserKnowledge } from '@/src/lib/rag/user-rag';
import { rateLimit } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid || null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000, userId, scope: 'rag-search' });
  if (!rl.success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  let body: Record<string, unknown>; try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const q = String(body.query || '').trim();
  if (!q) return NextResponse.json({ error: 'query_required' }, { status: 400 });
  const topK = Math.min(10, Math.max(1, Number(body.topK || 4)));

  try {
    const citations = await searchUserKnowledge({ userId, query: q, topK });
    return NextResponse.json({ citations });
  } catch {
    return NextResponse.json({ error: 'search_failed' }, { status: 500 });
  }
}
