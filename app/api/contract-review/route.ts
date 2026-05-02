import { NextRequest, NextResponse } from 'next/server';
import { contractReviewerAction } from '@/src/ai/agents/contract-reviewer/agent';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { adminAuth } from '@/src/lib/firebase-admin';
import xss from 'xss';

async function softAuth(req: NextRequest): Promise<{ userId: string; isGuest: boolean }> {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
      return { userId: dec.uid, isGuest: false };
    } catch { /* fall through */ }
  }
  return { userId: 'guest', isGuest: true };
}

export async function POST(request: NextRequest) {
  const { userId, isGuest } = await softAuth(request);
  const rl = rateLimit(request, { limit: isGuest ? 2 : 10, windowMs: 60_000, userId: isGuest ? undefined : userId, scope: isGuest ? 'guest' : 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const contractText = xss(String(body.contractText ?? '').slice(0, 15000));
    const contractType = body.contractType ? xss(String(body.contractType).slice(0, 200)) : undefined;
    const partyRole = body.partyRole as string | undefined;
    const specificConcerns = body.specificConcerns ? xss(String(body.specificConcerns).slice(0, 1000)) : undefined;

    if (!contractText.trim() || contractText.length < 50) {
      return NextResponse.json({ error: 'contractText is required (min 50 chars)' }, { status: 400 });
    }

    const result = await contractReviewerAction({ contractText, contractType, partyRole: partyRole as never, specificConcerns });
    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
