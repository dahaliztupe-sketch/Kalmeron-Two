import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listOKRs, listCurrentWeekOKRs } from '@/src/lib/okr/okr-store';
import { generateWeeklyGoals } from '@/src/ai/agents/okr/agent';

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
  const userId = await userIdFromReq(req);
  const [weekly, all] = await Promise.all([
    listCurrentWeekOKRs(userId).catch(() => []),
    listOKRs(userId, { limit: 50 }).catch(() => []),
  ]);
  return NextResponse.json({ weekly, all });
}

export async function POST(req: NextRequest) {
  const userId = await userIdFromReq(req);
  if (userId === 'guest') return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const result = await generateWeeklyGoals(userId);
  return NextResponse.json(result);
}
