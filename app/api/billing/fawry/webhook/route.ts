/**
 * POST /api/billing/fawry/webhook
 *
 * Fawry's server-to-server callback. Re-verifies the signature, then grants
 * the entitlement (sets the user's plan + records the payment).
 *
 * This is the SOLE path that grants paid plans. Never trust the client.
 *
 * Configure the URL in your Fawry Merchant Portal:
 *   https://YOUR_DOMAIN/api/billing/fawry/webhook
 */
import { NextRequest } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { buildCallbackSignature, getFawryConfig } from '@/src/lib/billing/fawry/client';
import { rewardReferrerOnUpgrade } from '@/src/lib/referrals/manager';

export const runtime = 'nodejs';

interface FawryCallback {
  requestId?: string;
  fawryRefNumber: string;
  merchantRefNumber: string;
  customerMobile?: string;
  customerMail?: string;
  paymentAmount: number;
  orderAmount: number;
  fawryFees?: number;
  shippingFees?: number;
  orderStatus: string;
  paymentMethod: string;
  paymentTime?: number;
  customerProvider?: string;
  customerName?: string;
  paymentRefrenceNumber?: string;
  messageSignature?: string;
}

export async function POST(req: NextRequest) {
  const cfg = getFawryConfig();
  if (!cfg.secureKey) {
    return Response.json({ error: 'Fawry not configured' }, { status: 503 });
  }

  let payload: FawryCallback;
  try {
    payload = (await req.json()) as FawryCallback;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!payload.fawryRefNumber || !payload.merchantRefNumber || !payload.messageSignature) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Re-compute signature server-side and constant-time compare.
  const expected = buildCallbackSignature({
    fawryRefNumber: payload.fawryRefNumber,
    merchantRefNum: payload.merchantRefNumber,
    paymentAmount: payload.paymentAmount,
    orderAmount: payload.orderAmount,
    orderStatus: payload.orderStatus,
    paymentMethod: payload.paymentMethod,
    paymentRefrenceNumber: payload.paymentRefrenceNumber,
    secureKey: cfg.secureKey,
  });
  if (expected !== payload.messageSignature) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Idempotency: lookup the original order
  const orderRef = adminDb.collection('fawry_orders').doc(payload.merchantRefNumber);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return Response.json({ error: 'Unknown order' }, { status: 404 });
  }
  const order = orderSnap.data()!;
  if (order.status === 'paid') {
    return Response.json({ ok: true, idempotent: true });
  }

  if (payload.orderStatus !== 'PAID') {
    await orderRef.update({
      status: payload.orderStatus.toLowerCase(),
      lastCallbackAt: new Date().toISOString(),
      lastCallbackPayload: payload as unknown as Record<string, unknown>,
    });
    return Response.json({ ok: true, status: payload.orderStatus });
  }

  // Verify amount matches what we recorded (anti-tamper)
  if (Math.abs((order.amountEgp as number) - payload.orderAmount) > 0.01) {
    await orderRef.update({ status: 'amount_mismatch', mismatchPayload: payload as unknown as Record<string, unknown> });
    return Response.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  // Grant entitlement: set the user's plan + create payment record (atomic)
  const userId = order.userId as string;
  const planId = order.planId as string;
  const cycle = order.cycle as 'monthly' | 'annual';
  const periodMs = cycle === 'annual' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  const renewsAt = new Date(Date.now() + periodMs).toISOString();

  const batch = adminDb.batch();
  batch.update(adminDb.collection('users').doc(userId), {
    planId,
    planCycle: cycle,
    planRenewsAt: renewsAt,
    planUpdatedAt: new Date().toISOString(),
    lastPaymentMethod: 'fawry',
  });
  batch.set(adminDb.collection('payments').doc(`fawry_${payload.merchantRefNumber}`), {
    userId,
    provider: 'fawry',
    providerRef: payload.fawryRefNumber,
    merchantRef: payload.merchantRefNumber,
    planId,
    cycle,
    amountEgp: payload.orderAmount,
    paidAt: new Date().toISOString(),
    paymentMethod: payload.paymentMethod,
  });
  batch.update(orderRef, {
    status: 'paid',
    paidAt: new Date().toISOString(),
    callbackPayload: payload as unknown as Record<string, unknown>,
  });
  await batch.commit();

  // Reward the referrer if this user was attributed to one (idempotent)
  if (planId !== 'free') {
    await rewardReferrerOnUpgrade(userId).catch(() => {});
  }

  return Response.json({ ok: true, granted: true, planId });
}
