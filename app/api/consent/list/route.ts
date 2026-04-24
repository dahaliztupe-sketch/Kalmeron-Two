import { NextResponse } from 'next/server';
import { guardedRoute } from '@/src/lib/security/route-guard';
import { listConsent } from '@/src/lib/consent/state';

export const runtime = 'nodejs';

export const GET = guardedRoute(
  async ({ userId }) => {
    const events = await listConsent(userId!);
    return NextResponse.json({ events });
  },
  {
    requireAuth: true,
    rateLimit: { limit: 60, windowMs: 60_000 },
  },
);
