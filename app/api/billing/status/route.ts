/**
 * /api/billing/status — public probe for whether self-serve Stripe billing
 * is configured. Used by the pricing page to render a soft warning banner
 * when paid plans cannot be purchased through the standard checkout flow.
 *
 * Returns only booleans — never leak partial Price IDs or Stripe keys.
 */
import { NextResponse } from 'next/server';
import { isStripeConfigured } from '@/src/lib/billing/plans';

export const runtime = 'nodejs';

export async function GET() {
  const stripeConfigured =
    Boolean(process.env.STRIPE_SECRET_KEY) && isStripeConfigured();

  return NextResponse.json(
    { stripeConfigured },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } },
  );
}
