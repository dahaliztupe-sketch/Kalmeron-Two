import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { LEGAL_KNOWLEDGE } from "../knowledge/legal";

export const DISCLAIMER_AR = "هذه معلومات عامة وليست استشارة قانونية. راجع محامياً أو محاسباً مرخصاً قبل أي تقديم.";

export const LegalPlanSchema = z.object({
  disclaimer: z.string().min(1).max(300),
  entityOptions: z
    .array(
      z.object({
        type: z.enum(["sole_proprietorship", "single_member_company", "llc", "joint_stock", "needs_check"]),
        fitReason: z.string().min(1).max(300),
        basis: Basis,
      }),
    )
    .min(1)
    .max(4),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(1).max(30),
        title: z.string().min(1).max(150),
        authority: z.string().min(1).max(120),
        documents: z.array(z.string().min(1).max(150)).max(10),
        feeEgp: z.number().min(0).max(100_000_000).nullable(),
        /** Every fee, minimum or rule in the step must be needs_check. */
        basis: Basis,
        sourceStatus: z.enum(["primary_read", "secondary", "unverified"]),
        sourceNote: z.string().min(1).max(250),
      }),
    )
    .min(3)
    .max(20),
  needsLicenceCheck: z.array(z.string().min(1).max(200)).max(6),
  consultProfessional: z.string().min(1).max(250),
  handoff: z.array(z.object({ role: z.string().max(40), reason: z.string().max(200) })).max(4).default([]),
});
export type LegalPlan = z.infer<typeof LegalPlanSchema>;

const OVERPROMISE = /(مضمون|ضمان|نضمن|100\s*%|بدون مخاطر|قانوني تماماً|لا مشكلة قانونية|لن تواجه)/;
const ACTS = /(سأقدم الطلب|سنقدم الطلب|سأوقّع|سنوقع|سأدفع الرسوم|تم التسجيل|تم تقديم)/;
const STAT = /(\d+(\.\d+)?\s*(%|٪)|\d+\s*(مليون|مليار))/;
const LEGAL_ADVICE_CLAIM = /(أنصحك قانونياً|رأي قانوني|بصفتي محامي)/;

export function legalChecks(out: LegalPlan, brief: { constraints: { budgetEgp: number | null } }): Issue[] {
  const issues: Issue[] = [];
  if (!/ليست\s+(استشارة|نصيحة)\s+قانونية/.test(out.disclaimer)) {
    issues.push({ level: "error", code: "missing_disclaimer", message: "التنبيه يجب أن يذكر أن المحتوى ليس استشارة قانونية." });
  }
  if (!/(محامي|محاسب|مستشار)/.test(out.consultProfessional)) {
    issues.push({ level: "error", code: "missing_consult_line", message: "أضف سطر استشارة محامٍ أو محاسب مرخص." });
  }
  if (out.steps.some((s) => s.basis !== "needs_check")) {
    issues.push({ level: "error", code: "rule_not_needs_check", message: "كل خطوة تحمل رسماً أو شرطاً يجب أن تحمل basis: needs_check." });
  }
  if (out.steps.some((s) => s.feeEgp != null && s.sourceStatus !== "primary_read" && s.basis !== "needs_check")) {
    issues.push({ level: "error", code: "fee_unsourced", message: "رسم بلا مصدر رسمي مقروء." });
  }
  if (out.steps.some((s) => s.sourceStatus === "primary_read" && !/^https:\/\//.test(s.sourceNote) && !/(GAFI|الهيئة|gov\.eg|قانون)/i.test(s.sourceNote))) {
    issues.push({ level: "warn", code: "primary_claim_unnamed", message: "مصدر رسمي مذكور بلا اسم جهة أو قانون." });
  }
  const stepText = out.steps.map((x) => `${x.title} ${x.authority}`).join(" ");
  if (!/(السجل التجاري|Commercial Regist)/i.test(stepText)) issues.push({ level: "warn", code: "missing_commercial_registry", message: "لا توجد خطوة للقيد في السجل التجاري." });
  if (!/(ضريب|Tax)/i.test(stepText)) issues.push({ level: "warn", code: "missing_tax_registration", message: "لا توجد خطوة للتسجيل الضريبي (مصلحة الضرائب). النشاط قد يحتاج بطاقة ضريبية أو تسجيل قيمة مضافة: needs_check." });
  const orders = out.steps.map((s) => s.order);
  if (orders.some((o, i) => i > 0 && o <= orders[i - 1])) issues.push({ level: "error", code: "step_order", message: "ترتيب الخطوات غير تصاعدي." });
  const prose = [...out.entityOptions.map((e) => e.fitReason), ...out.steps.flatMap((s) => [s.title, s.sourceNote, ...s.documents])];
  if (prose.some((t) => OVERPROMISE.test(t))) issues.push({ level: "error", code: "overpromise", message: "نص يحتوي ضماناً أو حكماً قانونياً قاطعاً." });
  if (prose.some((t) => ACTS.test(t))) issues.push({ level: "error", code: "acts_outside_role", message: "الدور لا يقدّم طلبات ولا يوقّع ولا يدفع. أعد الصياغة كخطوة للمؤسس." });
  if (prose.some((t) => LEGAL_ADVICE_CLAIM.test(t))) issues.push({ level: "error", code: "claims_legal_advice", message: "لا تقدّم نفسك كمحامٍ أو تُصدر رأياً قانونياً." });
  if (prose.some((t) => STAT.test(t))) issues.push({ level: "warn", code: "unsupported_statistic", message: "رقم أو نسبة داخل النص. تأكد أنها من مصدر رسمي مذكور." });
  const fees = out.steps.reduce((a, s) => a + (s.feeEgp ?? 0), 0);
  const cap = brief.constraints.budgetEgp;
  if (cap != null && fees > cap) issues.push({ level: "warn", code: "fees_exceed_budget", message: "مجموع الرسوم المقدّرة يتجاوز الميزانية. الرسوم نفسها تحتاج تحققاً." });
  return issues;
}

export const LEGAL_ROLE: RoleSpec<LegalPlan> = {
  id: "legal",
  titleAr: "المسؤول القانوني والإداري (مصر)",
  mission: "قائمة خطوات تسجيل نشاط في مصر مع الجهة والمستندات ومصدر كل بند. معلومات عامة وليست استشارة قانونية.",
  outOfScope: ["تقديم أي طلب أو توقيع أو دفع رسوم", "رأي قانوني أو صياغة عقود ملزمة", "تقدير ضرائب", "ضمان قبول التسجيل"],
  systemPrompt: `أنت مساعد إداري يجمع خطوات تسجيل الأنشطة في مصر من مصادر رسمية مؤرخة. أنت لست محامياً ومخرجاتك ليست استشارة قانونية.
${COMMON_RULES}
${knowledgePrompt(LEGAL_KNOWLEDGE, new Date())}
تفاصيل الدور:
- ابدأ بحقل disclaimer يذكر أن المحتوى ليس استشارة قانونية.
- 1 إلى 4 خيارات للشكل القانوني مع سبب الملاءمة؛ إن لم تكفِ المعلومات فاكتب needs_check.
- 3 إلى 20 خطوة مرتبة، لكل خطوة الجهة والمستندات والمصدر. كل رسم أو شرط أو حد أدنى basis: needs_check، وsourceStatus: primary_read فقط لما ورد في المعرفة أعلاه من مصدر رسمي قُرئ، وإلا secondary أو unverified.
- أدرج خطوة القيد في السجل التجاري وخطوة التسجيل الضريبي (مصلحة الضرائب)، وكل ما يخص الحدود والنسب needs_check.
- لا تخترع رسوماً أو مواعيد. إن لم تعرف الرقم اجعل feeEgp فارغاً (null).
- اذكر الأنشطة التي قد تحتاج ترخيصاً خاصاً في needsLicenceCheck دون تخمين.
- أنهِ بحقل consultProfessional يوصي باستشارة محامٍ أو محاسب مرخص.
- الضرائب والعقود وبيانات الأفراد تذهب إلى handoff.`,
  outputShape: `{"disclaimer":string,"entityOptions":[{"type":"sole_proprietorship"|"single_member_company"|"llc"|"joint_stock"|"needs_check","fitReason":string,"basis":"assumption"|"user_fact"|"needs_check"}],"steps":[{"order":number,"title":string,"authority":string,"documents":[string],"feeEgp":number|null,"basis":"needs_check","sourceStatus":"primary_read"|"secondary"|"unverified","sourceNote":string}],"needsLicenceCheck":[string],"consultProfessional":string,"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: LegalPlanSchema,
  checks: (out, brief) => legalChecks(out, brief),
};
