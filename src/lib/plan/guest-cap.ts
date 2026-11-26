/**
 * Global daily cap for anonymous plan generations, to bound model spend.
 * Counter lives in Firestore (Admin SDK only) so it works across serverless
 * instances. Fails CLOSED: if the counter cannot be read, guests are refused.
 */
import { adminDb } from "@/src/lib/firebase-admin";

export const GUEST_DAILY_CAP = Number(process.env.GUEST_PLAN_DAILY_CAP) > 0 ? Number(process.env.GUEST_PLAN_DAILY_CAP) : 100;

export const GUEST_ROLE_DAILY_CAP = Number(process.env.GUEST_ROLE_DAILY_CAP) > 0 ? Number(process.env.GUEST_ROLE_DAILY_CAP) : 40;
export type GuestKind = "plans" | "roles";
const CAPS: Record<GuestKind, number> = { plans: GUEST_DAILY_CAP, roles: GUEST_ROLE_DAILY_CAP };

export function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function consumeGuestQuota(now = new Date(), kind: GuestKind = "plans"): Promise<boolean> {
  try {
    const ref = adminDb.collection("usage_caps").doc(`guest_${kind}_${dayKey(now)}`);
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const used = (snap.exists ? (snap.data()?.count as number) : 0) ?? 0;
      if (used >= CAPS[kind]) return false;
      tx.set(ref, { count: used + 1, updatedAt: Date.now() }, { merge: true });
      return true;
    });
  } catch {
    return false;
  }
}
