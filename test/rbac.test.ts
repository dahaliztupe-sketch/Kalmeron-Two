import { describe, it, expect, vi } from 'vitest';

vi.mock('@/src/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => {
          if (name === 'workspace_members' && id === 'ws1_alice') {
            return { exists: true, data: () => ({ role: 'admin' }) };
          }
          if (name === 'workspaces' && id === 'ws1') {
            return { exists: true, data: () => ({ ownerId: 'owner-uid' }) };
          }
          return { exists: false, data: () => ({}) };
        },
        set: async () => {},
      }),
    }),
  },
}));

describe('RBAC', () => {
  it('grants owner full permissions', async () => {
    const { can } = await import('@/src/lib/security/rbac');
    expect(can('owner', 'workspace:delete')).toBe(true);
    expect(can('owner', 'apikey:manage')).toBe(true);
  });

  it('denies viewer write permissions', async () => {
    const { can } = await import('@/src/lib/security/rbac');
    expect(can('viewer', 'workspace:write')).toBe(false);
    expect(can('viewer', 'agent:run')).toBe(false);
    expect(can('viewer', 'workspace:read')).toBe(true);
  });

  it('member can run agents but not manage members', async () => {
    const { can } = await import('@/src/lib/security/rbac');
    expect(can('member', 'agent:run')).toBe(true);
    expect(can('member', 'members:invite')).toBe(false);
  });

  it('requirePermission returns role=admin for explicit member', async () => {
    const { requirePermission } = await import('@/src/lib/security/rbac');
    const r = await requirePermission('alice', 'ws1', 'agent:run');
    expect(r.allowed).toBe(true);
    expect(r.role).toBe('admin');
  });

  it('requirePermission falls back to owner for workspace.ownerId', async () => {
    const { requirePermission } = await import('@/src/lib/security/rbac');
    const r = await requirePermission('owner-uid', 'ws1', 'workspace:delete');
    expect(r.allowed).toBe(true);
    expect(r.role).toBe('owner');
  });

  it('denies non-members', async () => {
    const { requirePermission } = await import('@/src/lib/security/rbac');
    const r = await requirePermission('random', 'ws1', 'workspace:read');
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('not_a_member');
  });

  it('platform admin check honors env', async () => {
    const { isPlatformAdmin } = await import('@/src/lib/security/rbac');
    process.env.PLATFORM_ADMIN_UIDS = 'root-uid,another';
    expect(isPlatformAdmin('root-uid')).toBe(true);
    expect(isPlatformAdmin('normal')).toBe(false);
    expect(isPlatformAdmin(null)).toBe(false);
  });
});
