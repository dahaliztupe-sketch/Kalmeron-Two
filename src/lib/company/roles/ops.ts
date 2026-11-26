import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { OPS_KNOWLEDGE } from "../knowledge/ops";

export const OpsPlanSchema = z.object({
  teamPlanned: z.object({ value: z.boolean(), basis: Basis }),
  roles: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        why: z.string().min(1).max(250),
        engagement: z.enum(["employee", "freelancer", "needs_check"]),
        startWeek: z.number().int().min(1).max(52),
        monthlyCostEgp: z.number().min(0).max(10_000_000).nullable(),
        basis: Basis,
      }),
    )
    .max(8),
  hiringSteps: z.array(z.object({ step: z.string().min(1).max(200), consentBasis: z.enum(["they_applied", "referral", "existing_relationship", "not_applicable", "needs_check"]) })).max(8),
  onboardingChecklist: z.array(z.string().min(1).max(200)).max(8),
  complianceNote: z.string().min(1).max(300),
  handoff: z.array(z.object({ role: z.string().max(40), reason: z.string().max(200) })).max(4).default([]),
});
export type OpsPlan = z.infer<typeof OpsPlanSchema>;

const OVERPROMISE = /(مضمون|ضمان|نضمن|100\s*%|بدون مخاطر|لا مخالفة)/;
const STAT = /(\d+(\.\d+)?\s*(%|٪)|\d+\s*(مليون|مليار))/;
const ACTS = /(سأوظف|سنوظف|سأرسل العرض|سأوقّع العقد|تم التوظيف|سأنشر الوظيفة)/;
const SENSITIVE = /(سجل جنائي|صحيفة الحالة الجنائية|فيش|تحليل|فحص طبي|الحالة الصحية|الديانة|المعتقد|بصمة|بيانات بنكية|criminal record|medical)/i;
const COLD = /(رسائل جماعية|رسائل باردة|cold\s*(dm|message|outreach|email)|إرسال جماعي)/i;

export function opsChecks(out: OpsPlan, brief: { constraints: { budgetEgp: number | null; days: number | null } }): Issue[] {
  const issues: Issue[] = [];
  if (!out.teamPlanned.value && (out.roles.length > 0 || out.hiringSteps.length > 0)) {
    issues.push({ level: "error", code: "roles_without_team", message: "لا فريق مخطط: لا أدوار ولا خطة توظيف." });
  }
  if (out.teamPlanned.value && out.roles.length === 0) {
    issues.push({ level: "warn", code: "team_without_roles", message: "فريق مخطط بلا أدوار محددة." });
  }
  const prose = [...out.roles.map((r) => r.why), ...out.hiringSteps.map((s) => s.step), ...out.onboardingChecklist, out.complianceNote];
  if (prose.some((t) => OVERPROMISE.test(t))) issues.push({ level: "error", code: "overpromise", message: "نص يحتوي وعداً أو ضماناً بنتيجة أو بالامتثال." });
  if (prose.some((t) => ACTS.test(t))) issues.push({ level: "error", code: "acts_outside_role", message: "الدور يخطط فقط: لا يوظف ولا ينشر وظائف ولا يوقّع. أعد الصياغة كخطوة للمؤسس." });
  if (prose.some((t) => STAT.test(t))) issues.push({ level: "warn", code: "unsupported_statistic", message: "رقم أو نسبة داخل النص بلا وسم basis. راجعه." });
  if (out.hiringSteps.some((s) => s.consentBasis === "needs_check") || prose.some((t) => COLD.test(t))) {
    issues.push({ level: "warn", code: "consent_needs_check", message: "تواصل مع مرشحين بلا أساس موافقة واضح. راجع قبل التنفيذ." });
  }
  if (prose.some((t) => SENSITIVE.test(t))) {
    issues.push({ level: "warn", code: "sensitive_data_needs_check", message: "طلب بيانات حساسة من المرشحين (صحة، سجل جنائي، معتقد، بيومترية، مالية). القانون يشترط ترخيصاً وموافقة كتابية: راجع محامياً." });
  }
  if (out.roles.some((r) => r.engagement === "needs_check")) {
    issues.push({ level: "warn", code: "engagement_needs_check", message: "نوع التعاقد (موظف أم مستقل) غير محسوم. يحتاج مراجعة قانونية." });
  }
  const weeks = out.roles.map((r) => r.startWeek);
  const days = brief.constraints.days;
  if (days != null && weeks.some((w) => (w - 1) * 7 >= days)) {
    issues.push({ level: "error", code: "start_after_duration", message: "بداية دور بعد انتهاء المدة المحددة." });
  }
  const cap = brief.constraints.budgetEgp;
  if (cap != null) {
    const horizonMonths = Math.max(1, (days ?? 30) / 30);
    const total = out.roles.reduce((a, r) => {
      const months = Math.max(0, horizonMonths - (r.startWeek - 1) / 4.345);
      return a + (r.monthlyCostEgp ?? 0) * months;
    }, 0);
    if (total > cap) issues.push({ level: "error", code: "budget_exceeded", message: `تكلفة الفريق التقديرية (${Math.round(total)} جنيه) تتجاوز الميزانية.` });
  }
  if (out.roles.some((r) => r.engagement === "employee") && !/تأمين/.test(out.complianceNote)) {
    issues.push({ level: "warn", code: "insurance_not_mentioned", message: "دور بصفة موظف: اذكر في complianceNote أن اشتراكات التأمينات الاجتماعية تضاف إلى التكلفة وتحتاج حساب محاسب." });
  }
  if (!/(محامي|محاسب|مستشار)/.test(out.complianceNote)) {
    issues.push({ level: "warn", code: "missing_consult_line", message: "أضف سطر مراجعة محامٍ أو محاسب لعقود العمل والتأمينات." });
  }
  return issues;
}

export const OPS_ROLE: RoleSpec<OpsPlan> = {
  id: "ops",
  titleAr: "مسؤول العمليات والموارد البشرية",
  mission: "خطة توظيف وأدوار بسيطة، فقط إن كان المؤسس يخطط لفريق. خطة ومسودات فقط.",
  outOfScope: ["توظيف فعلي أو نشر وظائف أو إرسال عروض", "صياغة عقود عمل ملزمة", "حساب رواتب نظامية وتأمينات", "رسائل جماعية للمرشحين"],
  systemPrompt: `أنت مسؤول عمليات وموارد بشرية لشركة ناشئة صغيرة في مصر. لا تقترح فريقاً إن لم يخطط المؤسس له. مخرجاتك خطة فقط وليست استشارة قانونية.
${COMMON_RULES}
${knowledgePrompt(OPS_KNOWLEDGE, new Date())}
تفاصيل الدور:
- حقل teamPlanned: إن لم يذكر الملخص فريقاً فاجعله false مع basis: needs_check واترك roles وhiringSteps فارغتين.
- إن كان true: حتى 8 أدوار مع السبب ونوع التعاقد وأسبوع البداية والتكلفة الشهرية (رقم أو null) وbasis، ولا تتجاوز الميزانية والمدة.
- لا تطلب بيانات حساسة من المرشحين (صحة، سجل جنائي، معتقد، بيومترية، مالية) دون مراجعة قانونية، واطلب أقل البيانات اللازمة.
- خطوات توظيف مع أساس موافقة لكل تواصل، وقائمة تهيئة.
- complianceNote: اذكر أن العقود والتأمينات تحتاج مراجعة محامٍ أو محاسب.
- العقود والمسائل القانونية تذهب إلى handoff لدور legal.`,
  outputShape: `{"teamPlanned":{"value":boolean,"basis":"assumption"|"user_fact"|"needs_check"},"roles":[{"title":string,"why":string,"engagement":"employee"|"freelancer"|"needs_check","startWeek":number,"monthlyCostEgp":number|null,"basis":...}],"hiringSteps":[{"step":string,"consentBasis":"they_applied"|"referral"|"existing_relationship"|"not_applicable"|"needs_check"}],"onboardingChecklist":[string],"complianceNote":string,"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: OpsPlanSchema,
  checks: (out, brief) => opsChecks(out, brief),
};
