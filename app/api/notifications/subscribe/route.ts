import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "").trim();
    if (!idToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    await adminDb.collection("users").doc(uid).collection("fcm_tokens").doc(token.slice(-20)).set({
      token,
      uid,
      createdAt: new Date().toISOString(),
      platform: "web",
      active: true,
    }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[FCM Subscribe]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
