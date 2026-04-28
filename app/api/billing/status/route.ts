/**
 * /api/billing/status — public probe for whether self-serve Stripe billing
 * is configured. Used by the pricing page to render a soft warning banner
 * when paid plans cannot be purchased through the standard checkout flow.
 *
 * Returns only booleans — never leak partial Price IDs or Stripe keys.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured } from '@/src/lib/billing/plans';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Public probe — already cached at the edge for 60s; rate limit is just
  // a safety net against bursty CDN-bypass traffic.
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const stripeConfigured =
    Boolean(process.env.STRIPE_SECRET_KEY) && isStripeConfigured();

  return NextResponse.json(
    { stripeConfigured },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } },
  );
}
