import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { ENGINEERING_KNOWLEDGE } from "../knowledge/engineering";
import { proseGuards } from "./guards";

const S = (n: number) => z.string().min(1).max(n);

export const EngineeringPlanSchema = z.object({
  architectureSummary: S(400),
  components: z.array(z.object({ name: S(60), purpose: S(200), basis: Basis })).min(1).max(8),
  stack: z.array(z.object({ layer: S(40), choice: S(80), why: S(200), basis: Basis })).min(1).max(8),
  milestones: z.array(z.object({ week: z.number().int().min(1).max(52), goal: S(150), deliverable: S(200) })).min(1).max(8),
  testPlan: z.array(z.object({ level: z.enum(["unit", "integration", "end_to_end", "manual"]), what: S(200) })).min(1).max(8),
  securityChecklist: z.array(S(200)).min(1).max(8),
  deployNotes: z.array(S(200)).max(6),
  monthlyCostEgp: z.object({ value: z.number().min(0).max(10_000_000).nullable(), basis: Basis }),
  handoff: z.array(z.object({ role: S(40), reason: S(200) })).max(4).default([]),
});
export type EngineeringPlan = z.infer<typeof EngineeringPlanSchema>;

const ACTS = /(سأنشر|سننشر|تم النشر|سأدفع|سأنشئ حساب|سأشتري|سأرفع على|سأضغط)/;

export function engineeringChecks(out: EngineeringPlan, brief: { constraints: { budgetEgp: number | null; days: number | null } }): Issue[] {
  const prose = [out.architectureSummary, ...out.components.flatMap((c) => [c.purpose]), ...out.stack.map((s) => `${s.choice} ${s.why}`), ...out.milestones.flatMap((m) => [m.goal, m.deliverable]), ...out.testPlan.map((t) => t.what), ...out.securityChecklist, ...out.deployNotes];
  const issues = proseGuards(prose, ACTS, "الدور يخطط فقط: لا ينشر ولا يدفع ولا ينشئ حسابات. أعد الصياغة كخطوة للمؤسس.");
  const days = brief.constraints.days;
  if (days != null && out.milestones.some((m) => (m.week - 1) * 7 >= days)) issues.push({ level: "error", code: "milestone_after_duration", message: "معلم بعد انتهاء المدة المحددة." });
  const cap = brief.constraints.budgetEgp;
  const cost = out.monthlyCostEgp.value;
  if (cap != null && cost != null && cost * Math.max(1, (days ?? 30) / 30) > cap) issues.push({ level: "error", code: "budget_exceeded", message: "تكلفة التشغيل التقديرية تتجاوز الميزانية." });
  const levels = new Set(out.testPlan.map((t) => t.level));
  if (!levels.has("unit") && !levels.has("integration")) issues.push({ level: "warn", code: "no_automated_tests", message: "خطة الاختبار بلا اختبارات وحدة أو تكامل آلية." });
  if (out.stack.some((s) => s.basis === "needs_check") || out.monthlyCostEgp.basis === "needs_check") issues.push({ level: "warn", code: "stack_needs_check", message: "اختيارات أو تكلفة تحتاج تحققاً من الأسعار والحدود الحالية للخدمات." });
  if (!out.securityChecklist.some((t) => /(أسرار|مفاتيح|secrets)/i.test(t))) issues.push({ level: "warn", code: "secrets_not_covered", message: "قائمة الأمان لا تذكر إدارة الأسرار والمفاتيح." });
  if (!out.securityChecklist.some((t) => /(مراجعة|مختص|اختبار اختراق)/.test(t))) issues.push({ level: "warn", code: "missing_review_line", message: "أضف بنداً بأن القائمة نقطة بداية وليست تدقيقاً أمنياً، وأن المنتجات الحساسة تحتاج مراجعة مختص." });
  return issues;
}

export const ENGINEERING_ROLE: RoleSpec<EngineeringPlan> = {
  id: "engineering",
  titleAr: "قائد الهندسة (بنية، بناء، اختبار، أمان، نشر)",
  mission: "خطة تقنية صغيرة وقابلة للتنفيذ لأول نسخة من المنتج. مسودة فقط وليست تدقيقاً أمنياً.",
  outOfScope: ["كتابة الشيفرة أو نشرها أو تشغيل خدمات", "إنشاء حسابات أو دفع اشتراكات", "تدقيق أمني أو شهادة امتثال", "وعود بالأمان أو الأداء"],
  systemPrompt: `أنت قائد هندسة لشركة ناشئة صغيرة. تقترح بنية بسيطة وخطة بناء واختبار وأمان ونشر لأول نسخة. مخرجك مسودة آلية غير مراجَعة.
${COMMON_RULES}
${knowledgePrompt(ENGINEERING_KNOWLEDGE, new Date())}
تفاصيل الدور:
- لا تُدخل مكونات لا يحتاجها المنتج الأول؛ فضّل الأقل.
- لكل اختيار تقني السبب وbasis؛ لا تذكر أسعاراً أو حدوداً لخدمات إلا إن أُعطيت لك، وإلا اكتب needs_check.
- معالم أسبوعية ضمن المدة، ولكل معلم مخرج يمكن التحقق منه.
- خطة الاختبار تتبع الشكل الهرمي، وقائمة الأمان تذكر إدارة الأسرار وتنتهي ببند أنها نقطة بداية وليست تدقيقاً أمنياً.
- لا تضع أسراراً أو مفاتيح في المخرج.
- البيانات الشخصية والعقود إلى handoff لدور legal، والتكلفة التفصيلية إلى finance.`,
  outputShape: `{"architectureSummary":string,"components":[{"name":string,"purpose":string,"basis":"assumption"|"user_fact"|"needs_check"}],"stack":[{"layer":string,"choice":string,"why":string,"basis":...}],"milestones":[{"week":number,"goal":string,"deliverable":string}],"testPlan":[{"level":"unit"|"integration"|"end_to_end"|"manual","what":string}],"securityChecklist":[string],"deployNotes":[string],"monthlyCostEgp":{"value":number|null,"basis":...},"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: EngineeringPlanSchema,
  checks: (out, brief) => engineeringChecks(out, brief),
};
