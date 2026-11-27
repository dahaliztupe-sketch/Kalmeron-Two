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
import { GUEST_ROLES } from "@/src/lib/company/orchestrator";
import { IntakeSchema } from "@/src/lib/company/intake";
import { founderModel } from "@/src/lib/company/models";
import { consumeGuestQuota } from "@/src/lib/plan/guest-cap";
import { buildContextBlock } from "@/src/lib/company/context";

export const runtime = "nodejs";
/** Role runs take 20-60 s with the model; the platform default can cut them off. */
export const maxDuration = 60;
/** Leave headroom under maxDuration so a slow first attempt does not start a repair attempt that cannot finish. */
const ROLE_TIME_BUDGET_MS = 52_000;

const Body = z.object({
  role: z.string(),
  plan: ValidatedPlanSchema,
  constraints: ConstraintsSchema.partial().optional(),
  intake: IntakeSchema.optional(),
  /** Earlier role outputs, keyed by role id. Re-validated server-side; invalid ones are dropped. */
  context: z.record(z.string(), z.unknown()).optional(),
});

/** POST /api/company/role — run one role agent on a validated plan. Signed-in users: all roles. Guests: GUEST_ROLES, capped. */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  let uid: string | null = null;
  if (auth?.startsWith("Bearer ")) {
    try {
      uid = (await adminAuth.verifyIdToken(auth.slice(7).trim())).uid;
    } catch {
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }
  }
  const isGuest = uid === null;
  const rl = isGuest
    ? rateLimit(req, { limit: 2, windowMs: 60_000, scope: "guest" })
    : rateLimit(req, { limit: 5, windowMs: 60_000, userId: uid!, scope: "user" });
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
  if (isGuest) {
    if (!GUEST_ROLES.includes(parsed.data.role)) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    // Cap before the model call: spend is bounded even if the counter store is down (fails closed).
    if (!(await consumeGuestQuota(new Date(), "roles"))) {
      return NextResponse.json({ error: "guest_cap", message: "Daily free limit reached. Sign in to continue." }, { status: 429 });
    }
  }

  const brief = briefFromPlan(parsed.data.plan, parsed.data.constraints ?? {}, parsed.data.intake ?? {});
  const generate: Generate = async (system, prompt) => {
    try {
      const r = await ai.models.generateContent({
        model: founderModel(isGuest),
        contents: prompt,
        config: { systemInstruction: system, responseMimeType: "application/json" },
      });
      return r.text || "";
    } catch (err) {
      // Log the cause (no keys or prompts) so a failing model call can be diagnosed from runtime logs.
      logger.warn(
        { event: "company_role_model_call_failed", role: parsed.data.role, name: (err as Error)?.name, message: String((err as Error)?.message ?? "").slice(0, 300) },
        "company_role_model_call_failed",
      );
      throw err;
    }
  };
  try {
    const spec = ROLES[parsed.data.role];
    const ctx = buildContextBlock(parsed.data.role, isGuest ? undefined : parsed.data.context);
    const run = await runRole(spec as never, brief, generate, 2, ctx.block, ROLE_TIME_BUDGET_MS);
    if (!run.ok) {
      logger.warn({ event: "company_role_failed", role: parsed.data.role, error: run.error }, "company_role_failed");
      return NextResponse.json({ error: run.error, issues: run.issues }, { status: run.error === "time_budget" ? 504 : 502 });
    }
    return NextResponse.json({ role: spec.id, titleAr: spec.titleAr, output: run.output, issues: run.issues, quality: run.quality, outOfScope: spec.outOfScope });
  } catch (err) {
    logger.error({ err, event: "company_role_error" }, "company_role_error");
    return NextResponse.json({ error: "role_failed" }, { status: 500 });
  }
}
