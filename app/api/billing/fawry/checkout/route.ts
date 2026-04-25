/**
 * POST /api/billing/fawry/checkout
 *
 * Creates a Fawry charge for the requested plan and returns the Fawry
 * reference number. The user can then pay at any Fawry kiosk, or via
 * Vodafone/Etisalat/Orange wallets, or via Meeza card.
 *
 * Entitlement is granted ONLY by `/api/billing/fawry/webhook` after Fawry
 * confirms the payment server-side. This route just creates the order.
 */
import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { getPlan, type PlanId, type BillingCycle } from '@/src/lib/billing/plans';
import { createCharge, isFawryConfigured, FAWRY_PAYMENT_METHODS, type FawryPaymentMethod } from '@/src/lib/billing/fawry/client';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  if (!isFawryConfigured()) {
    return Response.json(
      { error: 'Fawry not configured', message: 'الدفع عبر فوري غير مفعّل بعد. جرّب طريقة دفع أخرى أو تواصل معنا.' },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

  let body: {
    plan?: PlanId;
    cycle?: BillingCycle;
    paymentMethod?: FawryPaymentMethod;
    customerMobile?: string;
    customerName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const planId = body.plan;
  if (!planId || planId === 'free' || planId === 'enterprise') {
    return Response.json({ error: 'Invalid plan' }, { status: 400 });
  }
  const cycle: BillingCycle = body.cycle === 'annual' ? 'annual' : 'monthly';
  const paymentMethod = (FAWRY_PAYMENT_METHODS as readonly string[]).includes(body.paymentMethod ?? '')
    ? (body.paymentMethod as FawryPaymentMethod)
    : 'PAYATFAWRY';

  if (!body.customerMobile || !/^01\d{9}$/.test(body.customerMobile)) {
    return Response.json(
      { error: 'invalid-mobile', message: 'رقم الموبايل المصري مطلوب (مثال: 01012345678).' },
      { status: 400 },
    );
  }

  const plan = getPlan(planId);
  const amount =
    cycle === 'annual'
      ? plan.priceAnnualMonthlyEgp * 12
      : plan.priceMonthlyEgp;
  if (amount <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });

  const merchantRefNum = `KLM-${userId.slice(0, 8)}-${Date.now()}-${randomUUID().slice(0, 6)}`;

  // Persist order first (so webhook can verify intent)
  await adminDb.collection('fawry_orders').doc(merchantRefNum).set({
    userId,
    userEmail: userEmail ?? null,
    planId,
    cycle,
    paymentMethod,
    amountEgp: amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  const charge = await createCharge({
    merchantRefNum,
    customerProfileId: userId,
    customerEmail: userEmail ?? `user-${userId}@kalmeron.com`,
    customerMobile: body.customerMobile,
    customerName: body.customerName,
    paymentMethod,
    amount,
    description: `${plan.nameAr} — ${cycle === 'annual' ? 'سنوي' : 'شهري'}`,
    itemId: `${planId}-${cycle}-egp`,
  });

  if (!charge.ok) {
    await adminDb.collection('fawry_orders').doc(merchantRefNum).update({
      status: 'failed',
      failureReason: charge.reason,
      failedAt: new Date().toISOString(),
    });
    return Response.json(
      { error: 'fawry-charge-failed', reason: charge.reason, message: 'تعذّر إنشاء طلب الدفع. حاول مرّة أخرى أو جرّب طريقة دفع أخرى.' },
      { status: 502 },
    );
  }

  await adminDb.collection('fawry_orders').doc(merchantRefNum).update({
    fawryReferenceNumber: charge.referenceNumber,
    expirationTime: charge.expirationTime,
    chargeCreatedAt: new Date().toISOString(),
  });

  return Response.json({
    ok: true,
    referenceNumber: charge.referenceNumber,
    merchantRefNumber: merchantRefNum,
    amount,
    expirationTime: charge.expirationTime,
    paymentMethod,
    instructionsAr:
      paymentMethod === 'PAYATFAWRY'
        ? `ادفع المبلغ ${amount.toFixed(2)} ج.م في أقرب فرع فوري، استخدم الكود: ${charge.referenceNumber}`
        : `سيتم تحويلك لإتمام الدفع — احتفظ بالكود ${charge.referenceNumber} للمراجعة.`,
  });
}
