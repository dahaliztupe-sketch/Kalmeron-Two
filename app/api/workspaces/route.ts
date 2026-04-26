// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { ensureDefaultWorkspace, listUserWorkspaces, listMembers, addMember, removeMember } from '@/src/lib/workspaces/workspaces';
import { recordAudit } from '@/src/lib/workspaces/workspaces';

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
  try {
    let workspaces = await listUserWorkspaces(uid);
    if (workspaces.length === 0) {
      const w = await ensureDefaultWorkspace(uid);
      workspaces = [w];
    }
    const wid = new URL(req.url).searchParams.get('workspaceId');
    let members: unknown[] = [];
    if (wid) members = await listMembers(wid);
    return NextResponse.json({ workspaces, members });
  } catch (e: unknown) {
    return NextResponse.json({ error: e?.message || 'load_failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const uid = await authedUserId(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  let body: unknown; try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const { op, workspaceId, targetUid, role } = body || {};
  try {
    if (op === 'add_member') {
      await addMember({ workspaceId, byUid: uid, uid: targetUid, role });
      await recordAudit({ workspaceId, userId: uid, action: 'member.add', target: targetUid, details: { role } });
    } else if (op === 'remove_member') {
      await removeMember({ workspaceId, byUid: uid, uid: targetUid });
      await recordAudit({ workspaceId, userId: uid, action: 'member.remove', target: targetUid });
    } else {
      return NextResponse.json({ error: 'unknown_op' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e?.message || 'op_failed' }, { status: 400 });
  }
}
