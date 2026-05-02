import { NextRequest, NextResponse } from 'next/server';
import { wellbeingCoachAction, quickCheckInAction } from '@/src/ai/agents/wellbeing-coach/agent';
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
  const rl = rateLimit(request, { limit: isGuest ? 3 : 15, windowMs: 60_000, userId: isGuest ? undefined : userId, scope: isGuest ? 'guest' : 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = body.mode as string;

    if (mode === 'checkin') {
      const mood = xss(String(body.mood ?? '').slice(0, 500));
      if (!mood.trim()) return NextResponse.json({ error: 'mood is required' }, { status: 400 });
      const result = await quickCheckInAction(mood);
      return NextResponse.json({ result });
    }

    const scores = body.scores as Record<string, number>;
    const context = body.context ? xss(String(body.context).slice(0, 1000)) : undefined;
    if (!scores || typeof scores !== 'object') return NextResponse.json({ error: 'scores required' }, { status: 400 });

    const result = await wellbeingCoachAction({ scores: scores as never, context });
    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
