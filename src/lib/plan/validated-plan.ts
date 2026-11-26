/**
 * Validated-plan: the structured result of the flagship journey
 * (idea -> chat -> validated plan). The model is asked for JSON matching
 * this schema; parseValidatedPlan() tolerates code fences and extra prose,
 * and rejects anything that does not match instead of guessing.
 *
 * Honesty rule: every claim carries a `basis` so the UI can show whether it
 * is a model assumption or came from a user-supplied fact.
 */
import { z } from "zod";

export const Basis = z.enum(["assumption", "user_fact", "needs_check"]);

const Point = z.object({
  text: z.string().min(1).max(400),
  basis: Basis.default("assumption"),
});

export const ValidatedPlanSchema = z.object({
  idea: z.string().min(1).max(500),
  verdict: z.enum(["proceed", "refine", "stop"]),
  verdictReason: z.string().min(1).max(600),
  swot: z.object({
    strengths: z.array(Point).max(6),
    weaknesses: z.array(Point).max(6),
    opportunities: z.array(Point).max(6),
    threats: z.array(Point).max(6),
  }),
  targetCustomer: z.string().min(1).max(400),
  competitors: z.array(z.object({ name: z.string().min(1).max(120), note: z.string().max(300) })).max(8),
  risks: z.array(Point).max(8),
  nextSteps: z
    .array(
      z.object({
        action: z.string().min(1).max(300),
        costEgp: z.number().min(0).max(1_000_000).nullable().default(null),
        days: z.number().int().min(1).max(365),
      }),
    )
    .min(1)
    .max(7),
});

export type ValidatedPlan = z.infer<typeof ValidatedPlanSchema>;

/** Extract the first JSON object from model text (handles ```json fences). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no_json_object");
  return JSON.parse(candidate.slice(start, end + 1));
}

export type ParseResult =
  | { ok: true; plan: ValidatedPlan }
  | { ok: false; error: string };

export function parseValidatedPlan(text: string): ParseResult {
  try {
    const parsed = ValidatedPlanSchema.safeParse(extractJson(text));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "schema_mismatch" };
    }
    return { ok: true, plan: parsed.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "parse_error" };
  }
}

const VERDICT_AR = { proceed: "مضي", refine: "تحسين قبل البدء", stop: "إيقاف" } as const;
const BASIS_AR = { assumption: "افتراض", user_fact: "معلومة منك", needs_check: "يحتاج تحقق" } as const;

/** Render the plan as Arabic markdown for chat and export. */
export function planToMarkdown(plan: ValidatedPlan): string {
  const list = (pts: { text: string; basis: keyof typeof BASIS_AR }[]) =>
    pts.length ? pts.map((p) => `- ${p.text} (${BASIS_AR[p.basis]})`).join("\n") : "- لا يوجد";
  return [
    `## الحكم: ${VERDICT_AR[plan.verdict]}`,
    plan.verdictReason,
    `### العميل المستهدف\n${plan.targetCustomer}`,
    `### نقاط القوة\n${list(plan.swot.strengths)}`,
    `### نقاط الضعف\n${list(plan.swot.weaknesses)}`,
    `### الفرص\n${list(plan.swot.opportunities)}`,
    `### التهديدات\n${list(plan.swot.threats)}`,
    `### المنافسون\n${plan.competitors.length ? plan.competitors.map((c) => `- ${c.name}: ${c.note}`).join("\n") : "- لم يُحدَّد"}`,
    `### المخاطر\n${list(plan.risks)}`,
    `### الخطوات التالية\n${plan.nextSteps
      .map((s, i) => `${i + 1}. ${s.action} (${s.days} يوم${s.costEgp === null ? "" : `، ${s.costEgp} جنيه`})`)
      .join("\n")}`,
    `_هذه نتيجة تحليل آلي مبني على وصفك وافتراضات النموذج، وليست دراسة سوق موثّقة._`,
  ].join("\n\n");
}
