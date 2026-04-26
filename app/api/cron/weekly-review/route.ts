import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { runWeeklyReview } from '@/src/ai/orchestrator/weekly-review';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorized(req: NextRequest, secret: string): boolean {
  if (req.headers.get('Authorization') === `Bearer ${secret}`) return true;
  if (req.headers.get('x-cron-secret') === secret) return true;
  return false;
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'cron_disabled_no_secret' }, { status: 503 });
  }
  if (!authorized(req, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const single = url.searchParams.get('userId');
  let userIds: string[] = [];
  if (single) userIds = [single];
  else {
    try { const snap = await adminDb.collection('twins').limit(500).get(); userIds = snap.docs.map((d) => d.id); }
    catch { userIds = []; }
  }
  const results: unknown[] = [];
  for (const uid of userIds) {
    try { const r = await runWeeklyReview(uid) as { reviewId?: string } | null; results.push({ userId: uid, reviewId: r?.reviewId ?? null }); }
    catch (e: unknown) { results.push({ userId: uid, error: e instanceof Error ? e.message : String(e) }); }
  }
  return NextResponse.json({ usersProcessed: results.length, results });
}
export async function GET(req: NextRequest) { return POST(req); }
