// @ts-nocheck
/**
 * Workspaces (Phase 8). Firestore layout:
 *   workspaces/{wid}                       — { name, ownerUid, createdAt }
 *   workspaces/{wid}/members/{uid}         — { role, addedAt, addedBy }
 *
 * Roles: 'owner' | 'finance' | 'ops' | 'viewer'
 *   - owner: full control; only owner can add/remove members
 *   - finance/ops: can read all + write within their scope
 *   - viewer: read-only
 *
 * A user with no workspace is auto-given a personal "Default" workspace
 * on first call to `ensureDefaultWorkspace(uid)`.
 */
import { adminDb } from '@/src/lib/firebase-admin';

export type WorkspaceRole = 'owner' | 'finance' | 'ops' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  ownerUid: string;
  createdAt?: any;
}

export interface WorkspaceMember {
  uid: string;
  role: WorkspaceRole;
  addedAt?: any;
  addedBy?: string;
}

export async function ensureDefaultWorkspace(uid: string): Promise<Workspace> {
  if (!adminDb?.collection) throw new Error('firestore_unavailable');
  const existing = await listUserWorkspaces(uid);
  if (existing.length > 0) return existing[0];
  const ref = await adminDb.collection('workspaces').add({
    name: 'مساحتي الافتراضية',
    ownerUid: uid,
    createdAt: new Date(),
  });
  await ref.collection('members').doc(uid).set({
    role: 'owner',
    addedAt: new Date(),
    addedBy: uid,
  });
  return { id: ref.id, name: 'مساحتي الافتراضية', ownerUid: uid };
}

export async function listUserWorkspaces(uid: string): Promise<Workspace[]> {
  if (!adminDb?.collection) return [];
  // Two paths: workspaces I own + workspaces where I appear as a member.
  // Firestore doesn't natively support cross-collection-group + parent lookup
  // in one query, so use a CG read on `members` then load parents.
  const memberSnap = await adminDb
    .collectionGroup('members')
    .where('__name__', '>=', '')
    .get()
    .catch(() => null);
  if (!memberSnap) return [];
  const ids = new Set<string>();
  memberSnap.forEach((d: any) => {
    if (d.id !== uid) return;
    const parent = d.ref.parent.parent;
    if (parent) ids.add(parent.id);
  });
  if (ids.size === 0) return [];
  const out: Workspace[] = [];
  for (const id of ids) {
    const w = await adminDb.collection('workspaces').doc(id).get();
    if (w.exists) out.push({ id: w.id, ...(w.data() as any) });
  }
  return out.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function getMemberRole(workspaceId: string, uid: string): Promise<WorkspaceRole | null> {
  if (!adminDb?.collection) return null;
  const m = await adminDb.collection('workspaces').doc(workspaceId).collection('members').doc(uid).get();
  if (!m.exists) return null;
  return (m.data() as any)?.role || 'viewer';
}

export async function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (!adminDb?.collection) return [];
  const snap = await adminDb.collection('workspaces').doc(workspaceId).collection('members').get();
  const out: WorkspaceMember[] = [];
  snap.forEach((d: any) => out.push({ uid: d.id, ...(d.data() as any) }));
  return out;
}

export async function addMember(opts: {
  workspaceId: string;
  byUid: string;
  uid: string;
  role: WorkspaceRole;
}): Promise<void> {
  if (!adminDb?.collection) throw new Error('firestore_unavailable');
  const callerRole = await getMemberRole(opts.workspaceId, opts.byUid);
  if (callerRole !== 'owner') throw new Error('forbidden');
  await adminDb
    .collection('workspaces')
    .doc(opts.workspaceId)
    .collection('members')
    .doc(opts.uid)
    .set({ role: opts.role, addedAt: new Date(), addedBy: opts.byUid });
}

export async function removeMember(opts: {
  workspaceId: string;
  byUid: string;
  uid: string;
}): Promise<void> {
  if (!adminDb?.collection) throw new Error('firestore_unavailable');
  const callerRole = await getMemberRole(opts.workspaceId, opts.byUid);
  if (callerRole !== 'owner') throw new Error('forbidden');
  if (opts.uid === opts.byUid) throw new Error('cannot_remove_self_owner');
  await adminDb.collection('workspaces').doc(opts.workspaceId).collection('members').doc(opts.uid).delete();
}

// ---------- Audit log ----------

export interface AuditEntry {
  workspaceId?: string | null;
  userId: string;
  action: string;        // e.g. 'agent.restart', 'action.approve', 'member.add'
  target?: string | null;
  details?: Record<string, any>;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  if (!adminDb?.collection) return;
  try {
    await adminDb.collection('audit_log').add({
      ...entry,
      details: entry.details || {},
      timestamp: new Date(),
    });
  } catch {
    /* silent — audit must never throw */
  }
}

export async function listAudit(opts: {
  workspaceId?: string;
  limit?: number;
}): Promise<any[]> {
  if (!adminDb?.collection) return [];
  let q: any = adminDb.collection('audit_log');
  if (opts.workspaceId) q = q.where('workspaceId', '==', opts.workspaceId);
  const snap = await q.limit(opts.limit || 100).get().catch(() => null);
  if (!snap || snap.empty) return [];
  const rows: any[] = [];
  snap.forEach((d: any) => rows.push({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (b.timestamp?._seconds || 0) - (a.timestamp?._seconds || 0));
  return rows;
}
