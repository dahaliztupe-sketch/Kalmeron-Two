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

/**
 * Classify an error to return an appropriate HTTP status.
 * Network/embedding-service errors become 503 so the client can distinguish
 * transient unavailability from a true server bug.
 */
function classifySearchError(e: unknown): { status: number; error: string; fallback?: boolean } {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    if (
      e.name === 'AbortError' ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('etimedout') ||
      msg.includes('fetch failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('socket hang up')
    ) {
      return { status: 503, error: 'embedding_service_unavailable', fallback: true };
    }
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
      return { status: 429, error: 'embedding_quota_exceeded' };
    }
    if (msg.includes('403') || msg.includes('unauthorized') || msg.includes('api key')) {
      return { status: 503, error: 'embedding_auth_error', fallback: true };
    }
  }
  return { status: 500, error: 'search_failed' };
}

export async function POST(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000, userId, scope: 'rag-search' });
  if (!rl.success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const q = String(body.query || '').trim();
  if (!q) return NextResponse.json({ error: 'query_required' }, { status: 400 });
  const topK = Math.min(10, Math.max(1, Number(body.topK || 4)));

  try {
    const citations = await searchUserKnowledge({ userId, query: q, topK });
    return NextResponse.json({ citations });
  } catch (e: unknown) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: e }, 'rag_search_failed');
    const { status, error, fallback } = classifySearchError(e);
    return NextResponse.json(
      { error, fallback: fallback ?? false },
      { status },
    );
  }
}
