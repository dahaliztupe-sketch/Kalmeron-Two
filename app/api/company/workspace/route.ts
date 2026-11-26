import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import { deleteWorkspace, loadWorkspace, sanitizeWorkspace, saveWorkspace, MAX_WORKSPACE_BYTES } from "@/src/lib/company/workspace-store";

export const runtime = "nodejs";

async function uidOf(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return (await adminAuth.verifyIdToken(auth.slice(7).trim())).uid;
  } catch {
    return null;
  }
}

/** GET: the signed-in user's saved workspace, or null. */
export async function GET(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000, userId: uid, scope: "user" });
  if (!rl.success) return rateLimitResponse();
  const workspace = await loadWorkspace(uid);
  return NextResponse.json({ workspace }, { headers: { "Cache-Control": "private, no-store" } });
}

/** PUT: replace the saved workspace. Validated, size-capped, owner = token uid. */
export async function PUT(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000, userId: uid, scope: "user" });
  if (!rl.success) return rateLimitResponse();
  const text = await req.text();
  if (text.length > MAX_WORKSPACE_BYTES * 2) return NextResponse.json({ error: "too_large" }, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const ws = sanitizeWorkspace(json);
  if (!ws) return NextResponse.json({ error: "invalid_workspace" }, { status: 400 });
  await saveWorkspace(uid, ws);
  return NextResponse.json({ saved: true });
}

/** DELETE: remove the saved workspace. */
export async function DELETE(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, userId: uid, scope: "user" });
  if (!rl.success) return rateLimitResponse();
  await deleteWorkspace(uid);
  return NextResponse.json({ deleted: true });
}
