import { NextRequest, NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { adminApp, adminAuth, adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUid, title, body: msgBody, url, icon } = body;

    if (!targetUid || !title) {
      return NextResponse.json({ error: "targetUid and title required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "").trim();
    if (idToken) {
      const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
      if (!decoded || (decoded.uid !== targetUid && !(decoded as { admin?: boolean }).admin)) {
        return NextResponse.json({ error: "unauthorized" }, { status: 403 });
      }
    }

    const tokensSnap = await adminDb
      .collection("users").doc(targetUid)
      .collection("fcm_tokens")
      .where("active", "==", true)
      .limit(10)
      .get();

    if (tokensSnap.empty) {
      return NextResponse.json({ ok: true, sent: 0, message: "no tokens" });
    }

    const tokens = tokensSnap.docs.map(d => d.data().token as string).filter(Boolean);
    const messaging = getMessaging(adminApp);

    const result = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title,
        body: msgBody ?? "",
      },
      webpush: {
        fcmOptions: { link: url ?? "/dashboard" },
        notification: {
          icon: icon ?? "/brand/kalmeron-mark.svg",
          badge: "/brand/kalmeron-mark.svg",
          dir: "rtl",
          requireInteraction: false,
        },
      },
      data: url ? { url } : {},
    });

    const invalid = result.responses
      .map((r, i) => {
        const code = r.error?.code ?? "";
        return (!r.success && (code.includes("invalid-registration") || code.includes("not-registered")))
          ? tokens[i] : null;
      })
      .filter(Boolean) as string[];

    if (invalid.length > 0) {
      const batch = adminDb.batch();
      for (const t of invalid) {
        const ref = adminDb
          .collection("users").doc(targetUid)
          .collection("fcm_tokens").doc(t.slice(-20));
        batch.update(ref, { active: false });
      }
      await batch.commit().catch(() => null);
    }

    return NextResponse.json({
      ok: true,
      sent: result.successCount,
      failed: result.failureCount,
    });
  } catch (e: unknown) {
    console.error("[FCM Send]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
