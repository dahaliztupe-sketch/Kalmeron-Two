import { describe, it, expect, vi } from 'vitest';

const store: Record<string, any> = {};
vi.mock('@/src/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      add: async (data: any) => {
        const id = 'key_' + Math.random().toString(36).slice(2, 8);
        store[id] = { id, ...data, _ref: null };
        store[id]._ref = {
          update: async (patch: any) => { Object.assign(store[id], patch); },
        };
        return { id };
      },
      doc: (id: string) => ({
        get: async () => ({ exists: !!store[id], data: () => store[id], ref: store[id]?._ref }),
        update: async (patch: any) => { if (store[id]) Object.assign(store[id], patch); },
      }),
      where: (_f: string, _op: string, value: any) => ({
        limit: () => ({
          get: async () => {
            const docs = Object.values(store).filter((d: any) => d.hash === value).map((d: any) => ({
              id: d.id,
              data: () => d,
              ref: d._ref,
            }));
            return { empty: docs.length === 0, docs };
          },
        }),
        where: () => ({
          get: async () => {
            const docs = Object.values(store).map((d: any) => ({ id: d.id, data: () => d }));
            return { docs };
          },
        }),
      }),
    }),
  },
}));

describe('api-keys', () => {
  it('creates and verifies a key', async () => {
    const { createApiKey, verifyApiKey } = await import('@/src/lib/security/api-keys');
    const k = await createApiKey({
      ownerId: 'user-1',
      workspaceId: 'ws-1',
      name: 'test',
      scopes: ['agent:run'],
    });
    expect(k.raw).toMatch(/^kal_live_/);
    expect(k.prefix).toMatch(/^kal_live_/);
    const v = await verifyApiKey(k.raw);
    expect(v.ok).toBe(true);
    expect(v.ownerId).toBe('user-1');
    expect(v.scopes).toEqual(['agent:run']);
  });

  it('rejects bad keys', async () => {
    const { verifyApiKey } = await import('@/src/lib/security/api-keys');
    const v = await verifyApiKey('kal_live_invalid');
    expect(v.ok).toBe(false);
  });

  it('rejects revoked keys', async () => {
    const { createApiKey, revokeApiKey, verifyApiKey } = await import('@/src/lib/security/api-keys');
    const k = await createApiKey({
      ownerId: 'user-2',
      workspaceId: 'ws-1',
      name: 'x',
      scopes: ['agent:run'],
    });
    await revokeApiKey(k.id, 'user-2');
    const v = await verifyApiKey(k.raw);
    expect(v.ok).toBe(false);
  });
});
