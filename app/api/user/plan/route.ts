import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { PLANS, type PlanId, getPlan } from '@/src/lib/billing/plans';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const token = authHeader.split(' ')[1];
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token!);
    userId = decoded.uid;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const planId = body?.plan as PlanId;
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
    await adminDb.collection('users').doc(userId).set(
      {
        plan: plan.id,
        planUpdatedAt: now,
      },
      { merge: true }
    );

    const walletRef = adminDb.collection('user_credits').doc(userId);
    const walletDoc = await walletRef.get();
    const wallet = walletDoc.data() as any;

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
      // عند الترقية: امنح الأرصدة الجديدة فوراً
      await walletRef.update({
        plan: plan.id,
        dailyLimit: plan.dailyCredits,
        monthlyLimit: plan.monthlyCredits,
        unlimited: plan.unlimited,
        dailyBalance: Math.max(wallet.dailyBalance || 0, plan.dailyCredits),
        monthlyBalance: Math.max(wallet.monthlyBalance || 0, plan.monthlyCredits),
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
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
