import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { getPlan, type PlanId } from '@/src/lib/billing/plans';
import { toErrorMessage } from '@/src/lib/errors/to-message';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Per-IP/user wallet poll — generous (clients refresh on tab focus + websocket fallback).
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

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

  try {
    const [walletDoc, userDoc] = await Promise.all([
      adminDb.collection('user_credits').doc(userId).get(),
      adminDb.collection('users').doc(userId).get(),
    ]);
    const userPlanId = (userDoc.data()?.plan as PlanId) || 'free';
    const userPlan = getPlan(userPlanId);

    if (!walletDoc.exists) {
      return new Response(
        JSON.stringify({
          plan: userPlan.id,
          planName: userPlan.nameAr,
          dailyBalance: userPlan.dailyCredits,
          monthlyBalance: userPlan.monthlyCredits,
          rolledOverCredits: 0,
          dailyLimit: userPlan.dailyCredits,
          monthlyLimit: userPlan.monthlyCredits,
          unlimited: userPlan.unlimited,
          total: userPlan.unlimited ? -1 : userPlan.dailyCredits + userPlan.monthlyCredits,
          initialized: false,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    const w = walletDoc.data() as
      | {
          plan?: PlanId;
          dailyBalance?: number;
          monthlyBalance?: number;
          rolledOverCredits?: number;
          dailyLimit?: number;
          monthlyLimit?: number;
          unlimited?: boolean;
        }
      | undefined;
    const planFromWallet = getPlan(w?.plan || userPlanId);
    const total = planFromWallet.unlimited
      ? -1
      : (w?.dailyBalance || 0) + (w?.monthlyBalance || 0) + (w?.rolledOverCredits || 0);
    return new Response(
      JSON.stringify({
        plan: planFromWallet.id,
        planName: planFromWallet.nameAr,
        dailyBalance: w?.dailyBalance || 0,
        monthlyBalance: w?.monthlyBalance || 0,
        rolledOverCredits: w?.rolledOverCredits || 0,
        dailyLimit: w?.dailyLimit || planFromWallet.dailyCredits,
        monthlyLimit: w?.monthlyLimit || planFromWallet.monthlyCredits,
        unlimited: !!w?.unlimited || planFromWallet.unlimited,
        total,
        initialized: true,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    // Log the real error server-side, never echo internal details to the client
    // (CodeQL js/stack-trace-exposure). The API contract is a stable opaque code.
    const { logger } = await import('@/src/lib/logger');
    logger.error({ event: 'credits_fetch_failed', error: toErrorMessage(e, 'unknown') });
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
