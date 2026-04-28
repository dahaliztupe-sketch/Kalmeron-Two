/**
 * /api/billing/checkout — create a Stripe Checkout Session.
 *
 * P0-1 from Virtual Boardroom 201 (Stripe Andreessen seat).
 *
 * Flow:
 *  1. Verify Firebase ID token in Authorization header.
 *  2. Resolve Stripe Price ID from { plan, cycle, currency }.
 *  3. Find or create a Stripe Customer keyed by Firebase UID.
 *  4. Create a Checkout Session in `subscription` mode and return the URL.
 *
 * The webhook (`/api/webhooks/stripe`) is the *only* path that grants entitlements.
 */
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { getPlan, getStripePriceIds, type PlanId, type BillingCycle } from '@/src/lib/billing/plans';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2026-04-22.dahlia' }) : null;

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  // Authenticate first — an unauthenticated caller must always see 401,
  // never 503 for missing Stripe config (asserted by e2e/billing.spec.ts).
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!stripe) {
    return Response.json(
      { error: 'Stripe not configured', message: 'الفوترة عبر Stripe غير مفعّلة بعد. تواصل مع المبيعات.' },
      { status: 503 },
    );
  }
  const token = authHeader.split(' ')[1];
  let userId: string;
  let userEmail: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(token!);
    userId = decoded.uid;
    userEmail = decoded.email ?? undefined;
  } catch {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body: { plan?: PlanId; cycle?: BillingCycle; currency?: 'usd' | 'egp' };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const planId = body.plan;
  const cycle: BillingCycle = body.cycle === 'annual' ? 'annual' : 'monthly';
  const currency: 'usd' | 'egp' = body.currency === 'egp' ? 'egp' : 'usd';

  if (!planId || planId === 'free') {
    return Response.json({ error: 'Invalid plan' }, { status: 400 });
  }
  if (planId === 'enterprise') {
    return Response.json(
      { error: 'Enterprise requires sales contact', message: 'تواصل مع فريق المبيعات للخطة المؤسسية.' },
      { status: 400 },
    );
  }

  const stripeIds = getStripePriceIds(planId);
  const priceId =
    cycle === 'annual'
      ? currency === 'egp' ? stripeIds.annualEgp : stripeIds.annualUsd
      : currency === 'egp' ? stripeIds.monthlyEgp : stripeIds.monthlyUsd;

  if (!priceId) {
    return Response.json(
      {
        error: 'Price not configured',
        message: 'سعر هذه الخطة غير مفعّل بعد. سنرسل لك التفاصيل.',
        details: { plan: planId, cycle, currency },
      },
      { status: 501 },
    );
  }

  // Find or create Stripe Customer keyed by uid.
  const userRef = adminDb.collection('users').doc(userId);
  const userSnap = await userRef.get();
  let customerId = (userSnap.data() as { stripeCustomerId?: string } | undefined)?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { firebaseUid: userId },
    });
    customerId = customer.id;
    await userRef.set({ stripeCustomerId: customerId }, { merge: true });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';
  const plan = getPlan(planId);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { firebaseUid: userId, planId, cycle },
    },
    metadata: { firebaseUid: userId, planId, cycle },
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing?cancelled=1`,
    allow_promotion_codes: true,
    locale: 'auto',
  });

  return Response.json({
    url: session.url,
    sessionId: session.id,
    plan: plan.id,
    cycle,
  });
}
