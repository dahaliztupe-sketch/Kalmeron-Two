import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  rating: z.enum(["up", "down"]),
  comment: z.string().max(500).optional(),
  verdict: z.enum(["proceed", "refine", "stop"]).optional(),
});

/** POST /api/plans/feedback — thumbs up/down on a generated plan. Guests allowed (rate-limited). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();
  let userId: string | null = null;
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      userId = (await adminAuth.verifyIdToken(auth.slice(7).trim())).uid;
    } catch {
      userId = null;
    }
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_feedback" }, { status: 400 });
  await adminDb.collection("plan_feedback").add({ ...parsed.data, userId, createdAt: Date.now() });
  return NextResponse.json({ ok: true }, { status: 201 });
}
