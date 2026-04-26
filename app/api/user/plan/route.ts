import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { PLANS, type PlanId, getPlan } from '@/src/lib/billing/plans';
import { Timestamp } from 'firebase-admin/firestore';
import { toErrorMessage } from '@/src/lib/errors/to-message';

export const runtime = 'nodejs';

/**
 * P0-1 LOCKDOWN — direct plan writes are admin-only now.
 *
 * Before: any authenticated user could POST { plan: 'founder' } and self-promote.
 * After:  paid plans must come from `/api/webhooks/stripe`. This endpoint
 *         remains for support/admin overrides (e.g. comping a founder),
 *         gated by the `admin: true` custom claim.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const token = authHeader.split(' ')[1];
  let callerUid: string;
  let isAdmin = false;
  try {
    const decoded = await adminAuth.verifyIdToken(token!);
    callerUid = decoded.uid;
    isAdmin = decoded.admin === true || decoded.role === 'admin';
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'الترقية للخطط المدفوعة تتم عبر بوابة الدفع. هذا المسار مخصص للإدارة فقط.',
        upgradeEndpoint: '/api/billing/checkout',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: { plan?: string; targetUid?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const planId = body?.plan as PlanId;
  // Admin may target any user; default to themselves.
  const targetUid: string = (typeof body?.targetUid === 'string' && body.targetUid) || callerUid;
  if (!planId || !PLANS[planId]) {
    return new Response(JSON.stringify({ error: 'Unknown plan' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (planId === 'enterprise') {
    return new Response(
      JSON.stringify({
        error: 'Enterprise plan requires sales contact',
        message: 'الخطة المؤسسية تتطلب التواصل مع المبيعات. سنرسل لك تأكيداً قريباً.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const plan = getPlan(planId);
  const now = Timestamp.now();

  try {
    await adminDb.collection('users').doc(targetUid).set(
      {
        plan: plan.id,
        planUpdatedAt: now,
        adminGrantedBy: callerUid,
      },
      { merge: true }
    );

    const walletRef = adminDb.collection('user_credits').doc(targetUid);
    const walletDoc = await walletRef.get();
    const wallet = walletDoc.data() as
      | { dailyBalance?: number; monthlyBalance?: number }
      | undefined;

    if (!walletDoc.exists) {
      await walletRef.set({
        userId: targetUid,
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
      // عند الترقية: امنح الأرصدة الجديدة فوراً
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

    return new Response(
      JSON.stringify({
        success: true,
        plan: plan.id,
        message: `تم التبديل إلى خطة ${plan.nameAr} بنجاح.`,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: toErrorMessage(e, 'Failed') }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
