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
import { Timestamp } from 'firebase-admin/firestore';
import { getPlan, planFromStripePriceId, type PlanId } from '@/src/lib/billing/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-08-27.basil' as any }) : null;

async function applyPlanToUser(userId: string, planId: PlanId) {
  const plan = getPlan(planId);
  const now = Timestamp.now();
  const userRef = adminDb.collection('users').doc(userId);
  const walletRef = adminDb.collection('user_credits').doc(userId);

  await userRef.set({ plan: plan.id, planUpdatedAt: now }, { merge: true });

  const walletDoc = await walletRef.get();
  if (!walletDoc.exists) {
    await walletRef.set({
      userId,
      plan: plan.id,
      dailyBalance: plan.dailyCredits,
      monthlyBalance: plan.monthlyCredits,
      lifetimeEarned: plan.dailyCredits + plan.monthlyCredits,
      lifetimeConsumed: 0,
      dailyLimit: plan.dailyCredits,
      monthlyLimit: plan.monthlyCredits,
      rolledOverCredits: 0,
      unlimited: plan.unlimited,
      dailyResetAt: new Timestamp(now.seconds + 86400, 0),
      monthlyResetAt: new Timestamp(now.seconds + 2592000, 0),
      lastUpdated: now,
    });
  } else {
    const wallet = walletDoc.data() as any;
    await walletRef.update({
      plan: plan.id,
      dailyLimit: plan.dailyCredits,
      monthlyLimit: plan.monthlyCredits,
      unlimited: plan.unlimited,
      dailyBalance: Math.max(wallet?.dailyBalance ?? 0, plan.dailyCredits),
      monthlyBalance: Math.max(wallet?.monthlyBalance ?? 0, plan.monthlyCredits),
      lastUpdated: now,
    });
  }
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return new Response('Stripe webhook not configured', { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('[stripe-webhook] signature verification failed', err?.message);
    return new Response(`Webhook Error: ${err?.message}`, { status: 400 });
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
        if (uid) await applyPlanToUser(uid, planId);
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
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        await applyPlanToUser(uid, isActive ? planId : 'free');
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
        // ack but ignore
        break;
    }
  } catch (err: any) {
    console.error('[stripe-webhook] handler failed', event.type, err?.message);
    // Returning 500 lets Stripe retry; safe because we dedupe by event.id.
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
