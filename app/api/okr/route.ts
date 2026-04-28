import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listOKRs, listCurrentWeekOKRs } from '@/src/lib/okr/okr-store';
import { generateWeeklyGoals } from '@/src/ai/agents/okr/agent';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function userIdFromReq(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
      return dec.uid;
    } catch { /* guest */ }
  }
  return 'guest';
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await userIdFromReq(req);
  const [weekly, all] = await Promise.all([
    listCurrentWeekOKRs(userId).catch(() => []),
    listOKRs(userId, { limit: 50 }).catch(() => []),
  ]);
  return NextResponse.json({ weekly, all });
}

export async function POST(req: NextRequest) {
  // OKR generation triggers an LLM call — keep cap low.
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await userIdFromReq(req);
  if (userId === 'guest') return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const result = await generateWeeklyGoals(userId);
  return NextResponse.json(result);
}
