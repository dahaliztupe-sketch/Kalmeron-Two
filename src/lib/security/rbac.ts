/**
 * Role-Based Access Control.
 * Roles are stored per-workspace in `workspace_members/{workspaceId}_{userId}`.
 */
import { adminDb } from '@/src/lib/firebase-admin';

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type Permission =
  | 'workspace:read'
  | 'workspace:write'
  | 'workspace:delete'
  | 'members:read'
  | 'members:invite'
  | 'members:remove'
  | 'agent:run'
  | 'agent:configure'
  | 'launchpad:run'
  | 'meeting:convene'
  | 'expert:create'
  | 'expert:delete'
  | 'skills:read'
  | 'skills:write'
  | 'vm:provision'
  | 'vm:execute'
  | 'webhook:manage'
  | 'apikey:manage'
  | 'billing:read'
  | 'billing:write'
  | 'audit:read'
  | 'data:export';

const MATRIX: Record<Role, Permission[]> = {
  owner: [
    'workspace:read', 'workspace:write', 'workspace:delete',
    'members:read', 'members:invite', 'members:remove',
    'agent:run', 'agent:configure',
    'launchpad:run', 'meeting:convene', 'expert:create', 'expert:delete',
    'skills:read', 'skills:write',
    'vm:provision', 'vm:execute',
    'webhook:manage', 'apikey:manage',
    'billing:read', 'billing:write',
    'audit:read', 'data:export',
  ],
  admin: [
    'workspace:read', 'workspace:write',
    'members:read', 'members:invite', 'members:remove',
    'agent:run', 'agent:configure',
    'launchpad:run', 'meeting:convene', 'expert:create', 'expert:delete',
    'skills:read', 'skills:write',
    'vm:provision', 'vm:execute',
    'webhook:manage', 'apikey:manage',
    'billing:read',
    'audit:read', 'data:export',
  ],
  member: [
    'workspace:read',
    'members:read',
    'agent:run',
    'launchpad:run', 'meeting:convene', 'expert:create',
    'skills:read', 'skills:write',
    'vm:provision', 'vm:execute',
    'data:export',
  ],
  viewer: [
    'workspace:read',
    'members:read',
    'skills:read',
  ],
};

export function can(role: Role, perm: Permission): boolean {
  return MATRIX[role]?.includes(perm) ?? false;
}

export async function getUserRole(userId: string, workspaceId: string): Promise<Role | null> {
  try {
    const doc = await adminDb
      .collection('workspace_members')
      .doc(`${workspaceId}_${userId}`)
      .get();
    if (!doc.exists) {
      // Legacy fallback: owner record may live on the workspace doc itself.
      const ws = await adminDb.collection('workspaces').doc(workspaceId).get();
      if (ws.exists && (ws.data() as any)?.ownerId === userId) return 'owner';
      return null;
    }
    return ((doc.data() as any).role as Role) ?? null;
  } catch {
    return null;
  }
}

export async function requirePermission(
  userId: string,
  workspaceId: string,
  perm: Permission
): Promise<{ allowed: boolean; role: Role | null; reason?: string }> {
  const role = await getUserRole(userId, workspaceId);
  if (!role) return { allowed: false, role: null, reason: 'not_a_member' };
  if (!can(role, perm)) return { allowed: false, role, reason: 'insufficient_role' };
  return { allowed: true, role };
}

export async function setRole(
  userId: string,
  workspaceId: string,
  role: Role,
  setBy: string
) {
  await adminDb
    .collection('workspace_members')
    .doc(`${workspaceId}_${userId}`)
    .set(
      {
        userId,
        workspaceId,
        role,
        updatedAt: new Date(),
        updatedBy: setBy,
      },
      { merge: true }
    );
}

export function isPlatformAdmin(userId: string | null): boolean {
  if (!userId) return false;
  const list = (process.env.PLATFORM_ADMIN_UIDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return list.includes(userId);
}
