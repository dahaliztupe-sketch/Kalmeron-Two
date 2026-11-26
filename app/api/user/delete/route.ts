import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";

/** Top-level collections whose documents carry a `userId` field (see firestore.rules). */
export const USER_FIELD_COLLECTIONS = [
  "validated_plans",
  "ideas",
  "business_plans",
  "chat_history",
  "user_memory",
  "saved_companies",
  "mistakes_viewed",
  "personas",
  "market_experiments",
  "feedbacks",
];
/** Top-level collections keyed by the uid as document id. */
export const USER_DOC_COLLECTIONS = ["user_credits", "runway_snapshots", "company_workspaces"];
const PAGE = 400;
const MAX_PAGES = 10;

/**
 * Right to erasure for the signed-in user. Uses the Admin SDK (the earlier version used the
 * browser SDK on the server, which Firestore rules deny, so it could not work).
 *
 * Deletes: users/{uid} and all its subcollections, the collections above, saved plans and the
 * company workspace. Does NOT delete: the Firebase Auth account itself, the append-only consent
 * ledger and audit logs (kept as legal/security records), or backups. If any collection still has
 * documents after the page limit, `complete` is false and the user can call again.
 *
 * SECURITY: only the uid from a verified ID token is ever used.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 3, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let userId: string;
  try {
    userId = (await adminAuth.verifyIdToken(authHeader.slice(7).trim())).uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    let complete = true;
    for (const col of USER_FIELD_COLLECTIONS) {
      let pages = 0;
      for (;;) {
        const snap = await adminDb.collection(col).where("userId", "==", userId).limit(PAGE).get();
        if (snap.empty) break;
        await Promise.all(snap.docs.map((d) => d.ref.delete()));
        if (snap.size < PAGE) break;
        if (++pages >= MAX_PAGES) {
          complete = false;
          break;
        }
      }
    }
    for (const col of USER_DOC_COLLECTIONS) await adminDb.collection(col).doc(userId).delete();
    await adminDb.recursiveDelete(adminDb.collection("users").doc(userId));

    return NextResponse.json({
      success: true,
      complete,
      message: complete
        ? "حُذفت بياناتك المحفوظة (الملف الشخصي والخطط ومساحة العمل وغيرها). حساب الدخول نفسه وسجل الموافقات وسجلات الأمان والنسخ الاحتياطية لا تُحذف بهذا الإجراء."
        : "حُذف جزء من بياناتك. أعد الطلب لحذف الباقي.",
    });
  } catch (error: unknown) {
    const { logger } = await import("@/src/lib/logger");
    logger.error({ err: error, userId }, "User Deletion Error");
    return NextResponse.json({ error: "حدث خطأ أثناء حذف البيانات" }, { status: 500 });
  }
}
