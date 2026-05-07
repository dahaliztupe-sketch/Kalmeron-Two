/**
 * Unit tests for Task-1: Fix API Stubs — Passkeys, Billing, Temporal
 *
 * Covers:
 *  1. Passkey routes return 410 with coming_soon body
 *  2. Billing checkout returns 200 + { url: null, fallback: "sales_contact" } when priceId missing
 *  3. getTemporalClient() returns null (not throws) when connection is refused
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// 1. Passkey routes
// ---------------------------------------------------------------------------
describe('passkey/register route', () => {
  it('GET returns 410 with coming_soon body', async () => {
    const { GET } = await import('@/app/api/auth/passkey/register/route');
    const res = await GET();
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.status).toBe('coming_soon');
    expect(body.alternativeMethod).toBe('google_sign_in');
    expect(typeof body.message).toBe('string');
  });

  it('POST returns 410 with coming_soon body', async () => {
    const { POST } = await import('@/app/api/auth/passkey/register/route');
    const res = await POST();
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.status).toBe('coming_soon');
    expect(body.alternativeMethod).toBe('google_sign_in');
  });
});

describe('passkey/authenticate route', () => {
  it('GET returns 410 with coming_soon body', async () => {
    const { GET } = await import('@/app/api/auth/passkey/authenticate/route');
    const res = await GET();
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.status).toBe('coming_soon');
    expect(body.alternativeMethod).toBe('google_sign_in');
  });

  it('POST returns 410 with coming_soon body', async () => {
    const { POST } = await import('@/app/api/auth/passkey/authenticate/route');
    const res = await POST();
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.status).toBe('coming_soon');
    expect(body.alternativeMethod).toBe('google_sign_in');
  });
});

// ---------------------------------------------------------------------------
// 2. Billing checkout — missing priceId returns 200 + sales_contact fallback
// ---------------------------------------------------------------------------
vi.mock('@/src/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: async () => ({ uid: 'user-test', email: 'test@example.com' }),
  },
  adminDb: {
    collection: () => ({
      doc: () => ({
        get: async () => ({ data: () => ({}) }),
        set: async () => {},
      }),
    }),
  },
}));

vi.mock('@/src/lib/security/rate-limit', () => ({
  rateLimit: () => ({ success: true }),
  rateLimitAgent: () => ({ allowed: true }),
  rateLimitResponse: () => new Response('Too Many Requests', { status: 429 }),
}));

describe('billing/checkout — missing priceId', () => {
  beforeEach(() => {
    // Ensure Stripe secret is set so we don't hit the "Stripe not configured" guard,
    // but the plan-specific price IDs remain unset (default: undefined).
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
    // Clear any accidental price env vars for the starter plan
    delete process.env.STRIPE_PRICE_STARTER_MONTHLY_USD;
    delete process.env.STRIPE_PRICE_STARTER_ANNUAL_USD;
    delete process.env.STRIPE_PRICE_STARTER_MONTHLY_EGP;
    delete process.env.STRIPE_PRICE_STARTER_ANNUAL_EGP;
  });

  it('returns HTTP 200 with url: null and fallback: sales_contact when priceId is not configured', async () => {
    vi.doMock('stripe', () => {
      return {
        default: class FakeStripe {
          customers = { create: async () => ({ id: 'cus_fake' }) };
          checkout = { sessions: { create: async () => ({ url: 'https://stripe.com/pay', id: 'cs_fake' }) } };
        },
      };
    });

    const { POST } = await import('@/app/api/billing/checkout/route');

    const req = new NextRequest('http://localhost/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer fake-token',
        'x-forwarded-for': '1.2.3.4',
      },
      body: JSON.stringify({ plan: 'starter', cycle: 'monthly', currency: 'usd' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBeNull();
    expect(body.fallback).toBe('sales_contact');
    expect(typeof body.message).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// 3. Temporal client — returns null when connection is refused
// ---------------------------------------------------------------------------
vi.mock('@temporalio/client', () => ({
  Connection: {
    connect: async () => { throw new Error('ECONNREFUSED connect ECONNREFUSED 127.0.0.1:7233'); },
  },
  Client: class FakeClient {},
}));

vi.mock('@/src/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('getTemporalClient', () => {
  it('returns null (does not throw) when Temporal server is unreachable', async () => {
    const { getTemporalClient } = await import('@/src/lib/temporal/client');
    const result = await getTemporalClient();
    expect(result).toBeNull();
  });

  it('logs a warning when Temporal server is unreachable', async () => {
    const { logger } = await import('@/src/lib/logger');
    const { getTemporalClient } = await import('@/src/lib/temporal/client');
    await getTemporalClient();
    expect(logger.warn).toHaveBeenCalled();
  });
});
