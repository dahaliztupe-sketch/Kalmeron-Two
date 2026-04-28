import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { toErrorMessage } from "@/src/lib/errors/to-message";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Subscription writes — token churn implies abuse, cap modestly.
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  try {
    // 1) Authenticate FIRST — never trust user-controlled body shape as a
    //    pre-auth gate. This avoids the "user-controlled bypass" pattern
    //    where a malformed body short-circuits the auth check.
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "").trim();
    if (!idToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const uid = decoded.uid;

    // 2) Then validate input. Use a strict, narrowed local instead of
    //    relying on user-controlled values for any subsequent decision.
    const raw = (await req.json().catch(() => ({}))) as { token?: unknown };
    const token = typeof raw.token === "string" ? raw.token.trim() : "";
    if (!token || token.length < 20 || token.length > 4096) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    await adminDb.collection("users").doc(uid).collection("fcm_tokens").doc(token.slice(-20)).set({
      token,
      uid,
      createdAt: new Date().toISOString(),
      platform: "web",
      active: true,
    }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[FCM Subscribe]", e);
    return NextResponse.json({ error: toErrorMessage(e) }, { status: 500 });
  }
}
