import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { runWeeklyPlanning } from '@/src/ai/orchestrator/weekly-planning';

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
  const results: any[] = [];
  for (const uid of userIds) {
    try { const r: any = await runWeeklyPlanning(uid); results.push({ userId: uid, planId: r?.planId ?? null }); }
    catch (e: any) { results.push({ userId: uid, error: e?.message }); }
  }
  return NextResponse.json({ usersProcessed: results.length, results });
}
export async function GET(req: NextRequest) { return POST(req); }
