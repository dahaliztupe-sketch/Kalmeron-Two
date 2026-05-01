import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import {
  ensureDefaultWorkspace,
  listUserWorkspaces,
  listMembers,
  addMember,
  removeMember,
  recordAudit,
} from '@/src/lib/workspaces/workspaces';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'unknown_error';
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUserId(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  try {
    let workspaces = await listUserWorkspaces(uid);
    if (workspaces.length === 0) {
      const w = await ensureDefaultWorkspace(uid);
      workspaces = [w];
    }
    const wid = new URL(req.url).searchParams.get('workspaceId');
    const members = wid ? await listMembers(wid) : [];
    return NextResponse.json({ workspaces, members });
  } catch (e: unknown) {
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 15, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await authedUserId(req);
  if (!uid) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { op, workspaceId, targetUid, role } = body;

  if (typeof workspaceId !== 'string' || !workspaceId) {
    return NextResponse.json({ error: 'workspaceId_required' }, { status: 400 });
  }

  try {
    if (op === 'add_member') {
      if (typeof targetUid !== 'string' || !targetUid) {
        return NextResponse.json({ error: 'targetUid_required' }, { status: 400 });
      }
      await addMember({ workspaceId, byUid: uid, uid: targetUid, role: typeof role === 'string' ? role : 'viewer' });
      await recordAudit({ workspaceId, userId: uid, action: 'member.add', target: targetUid, details: { role } });
    } else if (op === 'remove_member') {
      if (typeof targetUid !== 'string' || !targetUid) {
        return NextResponse.json({ error: 'targetUid_required' }, { status: 400 });
      }
      await removeMember({ workspaceId, byUid: uid, uid: targetUid });
      await recordAudit({ workspaceId, userId: uid, action: 'member.remove', target: targetUid });
    } else {
      return NextResponse.json({ error: 'unknown_op' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: errMsg(e) }, { status: 400 });
  }
}
