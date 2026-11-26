/**
 * Saved validated plans. Server-only (Firebase Admin), so Firestore rules
 * stay deny-all for this collection: clients never read or write it directly.
 * The document id is an unguessable random token that doubles as the
 * unlisted share link. Anyone with the link can view the plan; it contains
 * no email or user id when served.
 */
import { randomBytes } from "crypto";
import { adminDb } from "@/src/lib/firebase-admin";
import { ValidatedPlanSchema, type ValidatedPlan } from "@/src/lib/plan/validated-plan";

export const PLANS_COLLECTION = "validated_plans";
export const MAX_PLANS_PER_USER = 50;

export function newPlanId(): string {
  return randomBytes(16).toString("base64url");
}

export function isValidPlanId(id: string): boolean {
  return /^[A-Za-z0-9_-]{22}$/.test(id);
}

export async function savePlan(userId: string, plan: ValidatedPlan): Promise<{ id: string } | { error: "limit" }> {
  const count = await adminDb.collection(PLANS_COLLECTION).where("userId", "==", userId).count().get();
  if ((count.data().count ?? 0) >= MAX_PLANS_PER_USER) return { error: "limit" };
  const id = newPlanId();
  await adminDb.collection(PLANS_COLLECTION).doc(id).set({ userId, plan, createdAt: Date.now() });
  return { id };
}

export async function getPlan(id: string): Promise<ValidatedPlan | null> {
  if (!isValidPlanId(id)) return null;
  const snap = await adminDb.collection(PLANS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  const parsed = ValidatedPlanSchema.safeParse(snap.data()?.plan);
  return parsed.success ? parsed.data : null;
}

/** Deletes the plan only if `userId` owns it. Returns false when missing or not owned. */
export async function deletePlan(userId: string, id: string): Promise<boolean> {
  if (!isValidPlanId(id)) return false;
  const ref = adminDb.collection(PLANS_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.userId !== userId) return false;
  await ref.delete();
  return true;
}
