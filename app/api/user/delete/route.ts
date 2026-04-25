import { db } from "@/src/lib/firebase";
import { adminAuth } from "@/src/lib/firebase-admin";
import { doc, collection, getDocs, writeBatch } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Regulatory Compliance: User Right to Erasure (GDPR/Egyptian Data Protection Law)
 * This endpoint deletes all user data across all collections.
 *
 * SECURITY: Requires a valid Firebase ID token via the `Authorization: Bearer <token>`
 * header. The authenticated UID is the only UID that can be deleted — clients cannot
 * delete arbitrary users by passing a foreign userId.
 */
export async function POST(req: NextRequest) {
  // Authenticate caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice("Bearer ".length).trim());
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const batch = writeBatch(db);

    // 1. Delete Ideas
    const ideasSnap = await getDocs(collection(db, "users", userId, "ideas"));
    ideasSnap.forEach((d) => batch.delete(d.ref));

    // 2. Delete Memories
    const memoriesSnap = await getDocs(collection(db, "users", userId, "memories"));
    memoriesSnap.forEach((d) => batch.delete(d.ref));

    // 3. Delete Threads & Messages
    const threadsSnap = await getDocs(collection(db, "users", userId, "threads"));
    for (const threadDoc of threadsSnap.docs) {
      const messagesSnap = await getDocs(collection(db, "users", userId, "threads", threadDoc.id, "messages"));
      messagesSnap.forEach((m) => batch.delete(m.ref));
      batch.delete(threadDoc.ref);
    }

    // 4. Delete Business Plans
    const plansSnap = await getDocs(collection(db, "users", userId, "businessPlans"));
    plansSnap.forEach((p) => batch.delete(p.ref));

    // 5. Delete Base User Profile
    batch.delete(doc(db, "users", userId));

    await batch.commit();

    return NextResponse.json({ success: true, message: "تم حذف جميع البيانات بنجاح." });

  } catch (error: any) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: error, userId }, 'User Deletion Error');
    return NextResponse.json({ error: "حدث خطأ أثناء حذف البيانات" }, { status: 500 });
  }
}
