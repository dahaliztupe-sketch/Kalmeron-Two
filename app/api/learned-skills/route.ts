/**
 * Learned Skills API — Tenant-scoped (per workspace).
 *
 *  GET   /api/learned-skills?workspaceId=...  — list skills in caller's workspace
 *  PATCH /api/learned-skills                  — { workspaceId, id, enabled }
 *  POST  /api/learned-skills                  — { workspaceId } run consolidation
 *
 * All routes require:
 *   1. Bearer token (Firebase ID token)
 *   2. Caller is a member of the requested workspace (verified server-side)
 *
 * For PATCH and POST: caller must additionally have an "owner" role in that
 * workspace (consolidation is destructive; toggling affects shared knowledge).
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getMemberRole, type WorkspaceRole } from '@/src/lib/workspaces/workspaces';
import {
  listSkills,
  setSkillEnabled,
  consolidateSkills,
  type LearnedSkill,
} from '@/src/lib/learning/loop';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WRITE_ROLES: WorkspaceRole[] = ['owner'];

interface AuthOk { ok: true; uid: string }
interface AuthErr { ok: false; res: NextResponse }
type AuthResult = AuthOk | AuthErr;

async function authenticate(req: NextRequest): Promise<AuthResult> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return { ok: false, res: NextResponse.json({ error: 'auth_required' }, { status: 401 }) };
  }
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return { ok: true, uid: decoded.uid };
  } catch {
    return { ok: false, res: NextResponse.json({ error: 'invalid_token' }, { status: 401 }) };
  }
}

async function requireMembership(
  uid: string,
  workspaceId: string,
  needWriteRole: boolean
): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
  if (!workspaceId) {
    return { ok: false, res: NextResponse.json({ error: 'workspace_required' }, { status: 400 }) };
  }
  const role = await getMemberRole(workspaceId, uid);
  if (!role) {
    return { ok: false, res: NextResponse.json({ error: 'forbidden_not_member' }, { status: 403 }) };
  }
  if (needWriteRole && !WRITE_ROLES.includes(role)) {
    return { ok: false, res: NextResponse.json({ error: 'forbidden_role' }, { status: 403 }) };
  }
  return { ok: true };
}

interface SkillTimestamp { _seconds?: number }
function tsToMs(ts: unknown): number | null {
  const t = ts as SkillTimestamp | undefined;
  return t?._seconds ? t._seconds * 1000 : null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await authenticate(req);
  if (!guard.ok) return guard.res;

  const workspaceId = new URL(req.url).searchParams.get('workspaceId') || '';
  const member = await requireMembership(guard.uid, workspaceId, false);
  if (!member.ok) return member.res;

  const skills = await listSkills(workspaceId);
  const trimmed = skills.map((s: LearnedSkill) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    agentType: s.agentType,
    steps: s.steps || [],
    parameters: s.parameters || {},
    successRate: s.successRate ?? 0,
    timesUsed: s.timesUsed ?? 0,
    successes: s.successes ?? 0,
    failures: s.failures ?? 0,
    lastFailureReason: s.lastFailureReason || null,
    enabled: s.enabled !== false,
    parentId: s.parentId || null,
    generation: s.generation ?? 0,
    source: s.source || 'extracted',
    updatedAt: tsToMs(s.updatedAt),
    createdAt: tsToMs(s.createdAt),
  }));
  return NextResponse.json({ skills: trimmed });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const guard = await authenticate(req);
  if (!guard.ok) return guard.res;

  const body = (await req.json().catch(() => ({}))) as {
    workspaceId?: unknown;
    id?: unknown;
    enabled?: unknown;
  };
  const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
  const id = typeof body.id === 'string' ? body.id : '';
  const enabled = typeof body.enabled === 'boolean' ? body.enabled : null;
  if (!id || enabled === null) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const member = await requireMembership(guard.uid, workspaceId, true);
  if (!member.ok) return member.res;

  const ok = await setSkillEnabled(workspaceId, id, enabled);
  if (!ok) {
    return NextResponse.json({ error: 'not_found_or_forbidden' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await authenticate(req);
  if (!guard.ok) return guard.res;

  const body = (await req.json().catch(() => ({}))) as { workspaceId?: unknown };
  const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
  const member = await requireMembership(guard.uid, workspaceId, true);
  if (!member.ok) return member.res;

  const report = await consolidateSkills(workspaceId);
  return NextResponse.json({ ok: true, report });
}
