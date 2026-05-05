/**
 * /api/webhooks/stripe — verified Stripe webhook handler.
 *
 * P0-1 from Virtual Boardroom 201 (Andreessen + Schneier seats).
 *
 * Single source of truth for entitlements. No client path is allowed
 * to grant a paid plan; only this endpoint can write `users/{uid}.plan`
 * and `user_credits/{uid}` for non-free tiers.
 *
 * Verifies the `Stripe-Signature` header using STRIPE_WEBHOOK_SECRET.
 */
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/src/lib/firebase-admin';
import { getPlan, planFromStripePriceId, type PlanId } from '@/src/lib/billing/plans';
import { applyPlanToUser } from '@/src/lib/billing/apply-plan';
import { rewardReferrerOnUpgrade } from '@/src/lib/referrals/manager';
import { toErrorMessage } from '@/src/lib/errors/to-message';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { logger } from '@/src/lib/logger';
import {
  sendSubscriptionConfirmation,
  sendAnnualRenewalConfirmation,
} from '@/src/lib/notifications/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2026-04-22.dahlia' }) : null;

/** Resolve user email for notification sending */
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const { adminAuth } = await import('@/src/lib/firebase-admin');
    const userRecord = await adminAuth.getUser(userId);
    return userRecord.email ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 600, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  if (!stripe || !webhookSecret) {
    return new Response('Stripe webhook not configured', { status: 503 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = toErrorMessage(err);
    logger.error({ event: 'stripe_webhook_sig_failed', error: msg });
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  // Idempotency guard: dedupe by event.id in `stripe_events` collection.
  const eventRef = adminDb.collection('stripe_events').doc(event.id);
  const eventSnap = await eventRef.get();
  if (eventSnap.exists) {
    return Response.json({ ok: true, dedup: true });
  }
  await eventRef.set({ type: event.type, createdAt: Date.now() });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const uid = s.metadata?.firebaseUid as string | undefined;
        const planId = (s.metadata?.planId as PlanId) || 'pro';
        const cycle = (s.metadata?.cycle as 'monthly' | 'annual') || 'monthly';
        if (uid) {
          await applyPlanToUser(uid, planId);
          if (planId !== 'free') {
            await rewardReferrerOnUpgrade(uid).catch(() => {});
          }
          // Send subscription confirmation email (best-effort)
          const email = await getUserEmail(uid).catch(() => null);
          if (email) {
            const plan = getPlan(planId);
            const amountTotal = s.amount_total ?? 0;
            const currency = s.currency?.toUpperCase() ?? 'USD';
            const amountFormatted = `${(amountTotal / 100).toFixed(2)} ${currency}`;
            await sendSubscriptionConfirmation(email, plan.nameAr, cycle, amountFormatted).catch(() => {});
          }
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = (sub.metadata?.firebaseUid as string)
          || await uidFromCustomer(sub.customer as string);
        if (!uid) break;
        const item = sub.items?.data?.[0];
        const priceId = item?.price?.id;
        const lookup = priceId ? planFromStripePriceId(priceId) : null;
        const planId: PlanId = lookup?.planId
          ?? ((sub.metadata?.planId as PlanId) || 'pro');
        const cycle = lookup?.cycle ?? (sub.metadata?.cycle as 'monthly' | 'annual') ?? 'monthly';
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        await applyPlanToUser(uid, isActive ? planId : 'free');
        if (isActive && planId !== 'free') {
          await rewardReferrerOnUpgrade(uid).catch(() => {});

          // Send annual renewal confirmation only on true renewal events —
          // i.e. when current_period_end has advanced relative to the previous value.
          // This avoids sending the email on metadata/quantity-only updates.
          if (event.type === 'customer.subscription.updated' && cycle === 'annual') {
            const prevAttr = (event.data.previous_attributes as Record<string, unknown> | undefined);
            const prevPeriodEnd = prevAttr?.['current_period_end'] as number | undefined;
            const sub2 = sub as unknown as { current_period_end?: number };
            const newPeriodEnd = sub2.current_period_end;
            const isRenewal = typeof prevPeriodEnd === 'number'
              && typeof newPeriodEnd === 'number'
              && newPeriodEnd > prevPeriodEnd;
            if (isRenewal) {
              const email = await getUserEmail(uid).catch(() => null);
              if (email) {
                const plan = getPlan(planId);
                const renewalDate = new Date(newPeriodEnd * 1000).toLocaleDateString('ar-EG', {
                  year: 'numeric', month: 'long', day: 'numeric',
                });
                await sendAnnualRenewalConfirmation(email, plan.nameAr, renewalDate).catch(() => {});
              }
            }
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = (sub.metadata?.firebaseUid as string)
          || await uidFromCustomer(sub.customer as string);
        if (uid) await applyPlanToUser(uid, 'free');
        break;
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const uid = await uidFromCustomer(inv.customer as string);
        if (uid) {
          await adminDb.collection('users').doc(uid).set(
            { paymentFailedAt: Date.now() },
            { merge: true },
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (err: unknown) {
    logger.error({ event: 'stripe_webhook_handler_failed', type: event.type, error: toErrorMessage(err) });
    return new Response('Handler failed', { status: 500 });
  }

  return Response.json({ ok: true });
}

async function uidFromCustomer(customerId: string): Promise<string | null> {
  if (!customerId) return null;
  const snap = await adminDb
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0]!.id;
}
