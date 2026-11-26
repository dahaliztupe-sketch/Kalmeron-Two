import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import { adminAuth } from "@/src/lib/firebase-admin";
import { deletePlan, getPlan, isValidPlanId } from "@/src/lib/plan/store";

export const runtime = "nodejs";

/** GET /api/plans/:id — public read by unguessable id; never returns the owner. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();
  const { id } = await ctx.params;
  if (!isValidPlanId(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const plan = await getPlan(id);
  if (!plan) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ plan }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}

/** DELETE /api/plans/:id — owner revokes the share link and deletes the plan. Non-owners get 404. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(auth.slice(7).trim())).uid;
  } catch {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, userId: uid, scope: "user" });
  if (!rl.success) return rateLimitResponse();
  const { id } = await ctx.params;
  if (!isValidPlanId(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const ok = await deletePlan(uid, id);
  return ok ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
