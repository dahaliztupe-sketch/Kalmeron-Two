// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listAudit } from '@/src/lib/workspaces/workspaces';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid || null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const uid = await authedUserId(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const wid = new URL(req.url).searchParams.get('workspaceId') || undefined;
  const items = await listAudit({ workspaceId: wid, limit: 200 });
  const safe = items.map((r: any) => ({
    id: r.id,
    workspaceId: r.workspaceId,
    userId: r.userId,
    action: r.action,
    target: r.target,
    details: r.details,
    timestamp: r.timestamp?._seconds ? r.timestamp._seconds * 1000 : null,
  }));
  return NextResponse.json({ items: safe });
}
