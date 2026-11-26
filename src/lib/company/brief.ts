/**
 * Company Brief: the shared context every role agent reads. It is born from a
 * validated plan so no role has to re-ask the founder what the idea is.
 */
import { z } from "zod";
import type { ValidatedPlan } from "@/src/lib/plan/validated-plan";

export const ConstraintsSchema = z.object({
  budgetEgp: z.number().min(0).max(100_000_000).nullable().default(null),
  days: z.number().int().min(1).max(365).nullable().default(null),
});

export const CompanyBriefSchema = z.object({
  idea: z.string().min(1).max(500),
  targetCustomer: z.string().min(1).max(400),
  verdict: z.enum(["proceed", "refine", "stop"]),
  competitors: z.array(z.string().max(120)).max(8),
  constraints: ConstraintsSchema,
  /** Claims from the plan that are still unverified: roles must not treat them as facts. */
  openChecks: z.array(z.string().max(400)).max(20),
});

export type CompanyBrief = z.infer<typeof CompanyBriefSchema>;

export function briefFromPlan(
  plan: ValidatedPlan,
  constraints: { budgetEgp?: number | null; days?: number | null } = {},
): CompanyBrief {
  const needsCheck = [...plan.swot.strengths, ...plan.swot.weaknesses, ...plan.swot.opportunities, ...plan.swot.threats, ...plan.risks]
    .filter((p) => p.basis !== "user_fact")
    .map((p) => p.text);
  return CompanyBriefSchema.parse({
    idea: plan.idea,
    targetCustomer: plan.targetCustomer,
    verdict: plan.verdict,
    competitors: plan.competitors.map((c) => c.name),
    constraints: { budgetEgp: constraints.budgetEgp ?? null, days: constraints.days ?? null },
    openChecks: needsCheck.slice(0, 20),
  });
}

export function briefToPromptBlock(b: CompanyBrief): string {
  return [
    `الفكرة: ${b.idea}`,
    `العميل المستهدف: ${b.targetCustomer}`,
    `حكم التحقق: ${b.verdict}`,
    `المنافسون المعروفون: ${b.competitors.join("، ") || "غير محدد"}`,
    `الميزانية (جنيه): ${b.constraints.budgetEgp ?? "غير محددة"}`,
    `المدة (يوم): ${b.constraints.days ?? "غير محددة"}`,
    `نقاط غير مُتحقَّق منها (لا تعاملها كحقائق):\n${b.openChecks.map((t) => `- ${t}`).join("\n") || "- لا يوجد"}`,
  ].join("\n");
}
