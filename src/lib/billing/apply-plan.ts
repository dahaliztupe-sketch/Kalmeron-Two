/**
 * Shared helper — applies a plan to both `users/{uid}` and `user_credits/{uid}`.
 * Used by both the Stripe webhook and the Fawry webhook so entitlement logic
 * stays in a single place and cannot diverge.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getPlan, type PlanId } from '@/src/lib/billing/plans';

export async function applyPlanToUser(userId: string, planId: PlanId): Promise<void> {
  const plan = getPlan(planId);
  const now = Timestamp.now();
  const userRef = adminDb.collection('users').doc(userId);
  const walletRef = adminDb.collection('user_credits').doc(userId);

  const walletDoc = await walletRef.get();

  const batch = adminDb.batch();
  batch.set(userRef, { plan: plan.id, planUpdatedAt: now }, { merge: true });

  if (!walletDoc.exists) {
    batch.set(walletRef, {
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
    const wallet = walletDoc.data() as
      | { dailyBalance?: number; monthlyBalance?: number }
      | undefined;
    batch.update(walletRef, {
      plan: plan.id,
      dailyLimit: plan.dailyCredits,
      monthlyLimit: plan.monthlyCredits,
      unlimited: plan.unlimited,
      dailyBalance: Math.max(wallet?.dailyBalance ?? 0, plan.dailyCredits),
      monthlyBalance: Math.max(wallet?.monthlyBalance ?? 0, plan.monthlyCredits),
      lastUpdated: now,
    });
  }

  await batch.commit();
}
