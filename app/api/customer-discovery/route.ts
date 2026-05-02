import { NextRequest, NextResponse } from 'next/server';
import { customerDiscoveryAction, generateInterviewScriptAction } from '@/src/ai/agents/customer-discovery/agent';
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
  const rl = rateLimit(request, { limit: isGuest ? 3 : 10, windowMs: 60_000, userId: isGuest ? undefined : userId, scope: isGuest ? 'guest' : 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = body.mode as string;

    if (mode === 'script') {
      const businessIdea = xss(String(body.businessIdea ?? '').slice(0, 2000));
      const targetSegment = xss(String(body.targetSegment ?? '').slice(0, 500));
      if (!businessIdea.trim()) return NextResponse.json({ error: 'businessIdea required' }, { status: 400 });
      const result = await generateInterviewScriptAction(businessIdea, targetSegment);
      return NextResponse.json({ result });
    }

    const businessIdea = xss(String(body.businessIdea ?? '').slice(0, 3000));
    const targetSegment = xss(String(body.targetSegment ?? '').slice(0, 500));
    const hypotheses = (body.hypotheses as string[] ?? []).map((h: string) => xss(String(h).slice(0, 500)));
    const interviewAnswers = body.interviewAnswers ?? [];

    if (!businessIdea.trim()) return NextResponse.json({ error: 'businessIdea required' }, { status: 400 });
    if (hypotheses.length === 0) return NextResponse.json({ error: 'At least 1 hypothesis required' }, { status: 400 });

    const result = await customerDiscoveryAction({ businessIdea, targetSegment, hypotheses, interviewAnswers });
    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
