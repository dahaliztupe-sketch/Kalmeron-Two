import { NextRequest, NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { adminApp, adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { toErrorMessage } from "@/src/lib/errors/to-message";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Push-notification fan-out is a spam vector — keep cap tight per IP/user.
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  try {
    // 1) Authenticate FIRST. Previously a missing Authorization header
    //    bypassed the auth check entirely, letting any anonymous caller
    //    push a notification to any uid. We now require a valid token
    //    before reading the body.
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "").trim();
    if (!idToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2) Parse + validate input into local, narrowed values. Never use
    //    raw user-controlled fields for security decisions.
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const targetUid = typeof raw.targetUid === "string" ? raw.targetUid.trim() : "";
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const msgBody = typeof raw.body === "string" ? raw.body : "";
    const url = typeof raw.url === "string" ? raw.url : undefined;
    const icon = typeof raw.icon === "string" ? raw.icon : undefined;

    if (!targetUid || !title) {
      return NextResponse.json({ error: "targetUid and title required" }, { status: 400 });
    }

    // 3) Enforce ownership/admin AFTER auth + input validation.
    if (decoded.uid !== targetUid && !(decoded as { admin?: boolean }).admin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
    const messaging = getMessaging(adminApp());

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
    return NextResponse.json({ error: toErrorMessage(e) }, { status: 500 });
  }
}
