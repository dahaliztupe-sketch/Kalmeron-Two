import { describe, it, expect, vi } from 'vitest';

const store: any[] = [];
const delivs: any[] = [];
vi.mock('@/src/lib/firebase-admin', () => ({
  adminDb: {
    collection: (name: string) => ({
      add: async (data: any) => {
        const id = 'id_' + Math.random().toString(36).slice(2, 8);
        if (name === 'webhook_subscriptions') store.push({ id, ...data });
        if (name === 'webhook_deliveries') delivs.push({ id, ...data });
        return { id };
      },
      doc: () => ({
        get: async () => ({ exists: false }),
        update: async () => {},
      }),
      where: (field: string, _op: string, value: any) => ({
        get: async () => {
          const docs = store
            .filter((s) => s[field] === value && s.active !== false)
            .map((s) => ({ id: s.id, data: () => s }));
          return { docs };
        },
        where: () => ({
          get: async () => {
            const docs = store
              .filter((s) => s.active !== false)
              .map((s) => ({ id: s.id, data: () => s }));
            return { docs };
          },
        }),
      }),
    }),
  },
}));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => new Date(), increment: (n: number) => n },
}));
vi.mock('@/src/lib/audit/log', () => ({ writeAudit: async () => 'id' }));

describe('webhooks', () => {
  it('dispatches and delivers', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }));
    globalThis.fetch = fetchMock as any;

    const { createSubscription, dispatchEvent } = await import('@/src/lib/webhooks/dispatcher');
    const sub = await createSubscription({
      ownerId: 'u1', workspaceId: 'ws1',
      url: 'https://example.com/hook',
      events: ['launch.completed'] as any,
    });
    expect(sub.secret).toBeTruthy();

    const r = await dispatchEvent('ws1', 'launch.completed' as any, { runId: 'r1' });
    expect(r.delivered).toBe(1);
    expect(fetchMock).toHaveBeenCalled();
    const callArgs = fetchMock.mock.calls[0] as any[];
    expect(callArgs[1].headers['x-kalmeron-signature']).toMatch(/^sha256=/);
  });

  it('verifies HMAC signature', async () => {
    const { verifyIncomingSignature } = await import('@/src/lib/webhooks/dispatcher');
    const body = '{"test":true}';
    const secret = 's3cret';
    // matching sig
    const crypto = await import('crypto');
    const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
    expect(verifyIncomingSignature(body, sig, secret)).toBe(true);
    expect(verifyIncomingSignature(body, 'sha256=bad', secret)).toBe(false);
  });
});
