import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/src/lib/firebase-admin', () => ({
  adminAuth: { verifyIdToken: vi.fn(async () => ({ uid: 'user-1' })) },
}));

function makeReq(body: any, method = 'POST', headers: Record<string, string> = {}) {
  return new NextRequest(new URL('http://localhost/api/test'), {
    method,
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('guardedRoute', () => {
  it('rejects invalid body', async () => {
    const { guardedRoute } = await import('@/src/lib/security/route-guard');
    const handler = guardedRoute(
      async () => NextResponse.json({ ok: true }),
      { schema: z.object({ name: z.string().min(3) }) }
    );
    const res = await handler(makeReq({ name: 'ab' }));
    expect(res.status).toBe(400);
  });

  it('passes valid body and injects userId via bearer token', async () => {
    const { guardedRoute } = await import('@/src/lib/security/route-guard');
    const handler = guardedRoute(
      async ({ userId, body }) => NextResponse.json({ userId, body }),
      {
        schema: z.object({ name: z.string() }),
        requireAuth: true,
      }
    );
    const res = await handler(makeReq({ name: 'kareem' }, 'POST', { authorization: 'Bearer xyz' }));
    const j = await (res as NextResponse).json();
    expect(j.userId).toBe('user-1');
    expect(j.body.name).toBe('kareem');
  });

  it('returns 401 when requireAuth and no token', async () => {
    const { guardedRoute } = await import('@/src/lib/security/route-guard');
    const handler = guardedRoute(
      async () => NextResponse.json({ ok: true }),
      { requireAuth: true, schema: z.object({}) }
    );
    const res = await handler(makeReq({}));
    expect(res.status).toBe(401);
  });
});
