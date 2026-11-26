import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ai } from "@/src/lib/gemini";
import { adminAuth } from "@/src/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";
import { logger } from "@/src/lib/logger";
import { ValidatedPlanSchema } from "@/src/lib/plan/validated-plan";
import { briefFromPlan, ConstraintsSchema } from "@/src/lib/company/brief";
import { runRole, type Generate } from "@/src/lib/company/run-role";
import { ROLES, isRoleId } from "@/src/lib/company/roles/registry";
import { buildContextBlock } from "@/src/lib/company/context";

export const runtime = "nodejs";

const Body = z.object({
  role: z.string(),
  plan: ValidatedPlanSchema,
  constraints: ConstraintsSchema.partial().optional(),
  /** Earlier role outputs, keyed by role id. Re-validated server-side; invalid ones are dropped. */
  context: z.record(z.string(), z.unknown()).optional(),
});

/** POST /api/company/role — run one role agent on a validated plan. Signed-in only (model cost). */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(auth.slice(7).trim())).uid;
  } catch {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000, userId: uid, scope: "user" });
  if (!rl.success) return rateLimitResponse();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  if (!isRoleId(parsed.data.role)) return NextResponse.json({ error: "unknown_role" }, { status: 400 });

  const brief = briefFromPlan(parsed.data.plan, parsed.data.constraints ?? {});
  const generate: Generate = async (system, prompt) => {
    const r = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: { systemInstruction: system, responseMimeType: "application/json" },
    });
    return r.text || "";
  };
  try {
    const spec = ROLES[parsed.data.role];
    const ctx = buildContextBlock(parsed.data.role, parsed.data.context);
    const run = await runRole(spec as never, brief, generate, 2, ctx.block);
    if (!run.ok) {
      logger.warn({ event: "company_role_failed", role: parsed.data.role, error: run.error }, "company_role_failed");
      return NextResponse.json({ error: run.error, issues: run.issues }, { status: 502 });
    }
    return NextResponse.json({ role: spec.id, titleAr: spec.titleAr, output: run.output, issues: run.issues, quality: run.quality, outOfScope: spec.outOfScope });
  } catch (err) {
    logger.error({ err, event: "company_role_error" }, "company_role_error");
    return NextResponse.json({ error: "role_failed" }, { status: 500 });
  }
}
