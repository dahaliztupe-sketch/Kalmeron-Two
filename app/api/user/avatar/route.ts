import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const token = auth.slice(7);
  const decoded = await adminAuth.verifyIdToken(token).catch(() => null);
  if (!decoded?.uid) return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ ok: false, message: "No file" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;
  await adminDb.collection("users").doc(decoded.uid).set({ photoURL: base64, updatedAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ ok: true, photoURL: base64 });
}
