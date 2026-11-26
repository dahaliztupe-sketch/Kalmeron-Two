import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import { getPlan, isValidPlanId } from "@/src/lib/plan/store";

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
