import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import { ValidatedPlanSchema } from "@/src/lib/plan/validated-plan";
import { savePlan } from "@/src/lib/plan/store";
import { SITE_URL } from "@/src/lib/site";

export const runtime = "nodejs";

/** POST /api/plans — save a validated plan for the signed-in user and return its unlisted share link. */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }
  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(auth.slice(7).trim())).uid;
  } catch {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, userId: uid, scope: "user" });
  if (!rl.success) return rateLimitResponse();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ValidatedPlanSchema.safeParse((body as { plan?: unknown })?.plan);
  if (!parsed.success) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });

  const saved = await savePlan(uid, parsed.data);
  if ("error" in saved) return NextResponse.json({ error: "limit_reached" }, { status: 409 });
  return NextResponse.json({ id: saved.id, url: `${SITE_URL}/p/${saved.id}` }, { status: 201 });
}
