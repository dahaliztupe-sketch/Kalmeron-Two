import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { STRATEGY_KNOWLEDGE } from "../knowledge/strategy";
import { proseGuards } from "./guards";

const S = (n: number) => z.string().min(1).max(n);

export const StrategyPlanSchema = z.object({
  narrative: z.object({ problem: S(300), solution: S(300), customer: S(250), whyNow: z.object({ text: S(250), basis: Basis }) }),
  keyPoints: z.array(S(150)).min(3).max(7),
  deckOutline: z.array(z.object({ slide: S(60), oneIdea: S(200) })).min(3).max(12),
  dataRoom: z.array(S(120)).max(10),
  hardQuestions: z.array(z.object({ question: S(200), honestAnswerDraft: S(400), basis: Basis })).max(6),
  readiness: z.array(z.object({ criterion: S(150), status: z.enum(["met", "not_met", "unknown"]), evidence: S(250) })).min(1).max(6),
  risks: z.array(S(200)).max(5),
  nonBindingNote: S(300),
  handoff: z.array(z.object({ role: S(40), reason: S(200) })).max(4).default([]),
});
export type StrategyPlan = z.infer<typeof StrategyPlanSchema>;

const ACTS = /(سأتواصل مع المستثمر|سأرسل العرض|سنرسل العرض|سأحجز اجتماع|تم إرسال|سأوقّع|سأقدّم الطلب)/;
const VC = /(Sequoia|a16z|Andreessen|Y Combinator|YC\b|500 Global|Flat6Labs|Algebra|Techstars|Accel|SoftBank)/i;
const AMOUNT = /(\d[\d,.]*\s*(ألف|مليون|مليار|k|m)?\s*(دولار|جنيه|\$|USD|EGP)|تقييم\s*(قدره|يبلغ|بـ)\s*\d)/i;

export function strategyChecks(out: StrategyPlan, brief: { verdict?: string }): Issue[] {
  const prose = [out.narrative.problem, out.narrative.solution, out.narrative.customer, out.narrative.whyNow.text, ...out.keyPoints, ...out.deckOutline.map((d) => d.oneIdea), ...out.dataRoom, ...out.hardQuestions.map((h) => h.honestAnswerDraft), ...out.readiness.map((r) => r.evidence), ...out.risks, out.nonBindingNote];
  const issues = proseGuards(prose, ACTS, "الدور يخطط فقط: لا يتواصل مع مستثمرين ولا يرسل ولا يوقّع. أعد الصياغة كخطوة للمؤسس.");
  if (prose.some((t) => AMOUNT.test(t))) issues.push({ level: "error", code: "amount_or_valuation", message: "مبلغ جمع أو تقييم محدد. هذا قرار المؤسس بمشورة مختصين، لا تضعه الخطة." });
  if (prose.some((t) => VC.test(t))) issues.push({ level: "warn", code: "named_investors", message: "ذكر لأسماء جهات استثمار. لا تفترض اهتمامها أو شروطها؛ تحقق من مصادرها." });
  if ((brief.verdict === "stop" || brief.verdict === "refine") && out.readiness.some((r) => r.status === "met")) {
    issues.push({ level: "warn", code: "readiness_vs_verdict", message: "حكم التحقق ليس «تابع» لكن بعض معايير الجاهزية met. راجع الأدلة." });
  }
  if (out.readiness.some((r) => r.status === "met" && !/(user_fact|من المؤسس|مؤكد|وثيقة|رابط)/.test(r.evidence))) {
    issues.push({ level: "warn", code: "met_without_evidence", message: "معيار met بلا دليل من المؤسس. اجعله unknown." });
  }
  if (out.keyPoints.length > 7) issues.push({ level: "warn", code: "too_many_points", message: "أكثر من سبع نقاط رئيسية." });
  if (!/(ليس|لا يُعد|غير ملزم)/.test(out.nonBindingNote) || !/(محامي|مستشار|مختص)/.test(out.nonBindingNote)) {
    issues.push({ level: "warn", code: "missing_nonbinding_line", message: "أضف أنها غير ملزمة وليست استشارة استثمارية أو قانونية، وأن الشروط تُراجَع مع محامٍ." });
  }
  return issues;
}

export const STRATEGY_ROLE: RoleSpec<StrategyPlan> = {
  id: "strategy",
  titleAr: "الاستراتيجية وجاهزية المستثمرين (غير ملزمة)",
  mission: "سرد ومخطط عرض وقائمة جاهزية وأسئلة صعبة. غير ملزمة وليست استشارة استثمارية.",
  outOfScope: ["التواصل مع مستثمرين أو إرسال العرض", "تحديد مبلغ جمع أو تقييم", "صياغة عقود أسهم أو SAFE", "أرقام سوق أو إيرادات أو مستخدمين غير مقدمة من المؤسس"],
  systemPrompt: `أنت مستشار استراتيجية لمؤسس يستعد لحديث مع مستثمرين. كل ما تكتبه غير ملزم وليس استشارة استثمارية أو قانونية. تقرأ مخرجات أدوار أخرى كمسودات غير مراجَعة.
${COMMON_RULES}
${knowledgePrompt(STRATEGY_KNOWLEDGE, new Date())}
تفاصيل الدور:
- لا ترفع إلى السرد إلا ما يمكن إسناده إلى الملخص أو إلى مخرجات الأدوار مع وسمه basis؛ لا أرقام سوق أو إيرادات أو مستخدمين من عندك.
- من ثلاث إلى سبع نقاط رئيسية، وكل شريحة فكرة واحدة.
- قيّم الجاهزية بصدق: met فقط مع دليل من المؤسس، وإلا unknown أو not_met.
- لا مبلغ جمع ولا تقييم ولا أسماء مستثمرين.
- nonBindingNote: غير ملزمة وليست استشارة، وشروط الأسهم تُراجَع مع محامٍ.`,
  outputShape: `{"narrative":{"problem":string,"solution":string,"customer":string,"whyNow":{"text":string,"basis":"assumption"|"user_fact"|"needs_check"}},"keyPoints":[string],"deckOutline":[{"slide":string,"oneIdea":string}],"dataRoom":[string],"hardQuestions":[{"question":string,"honestAnswerDraft":string,"basis":...}],"readiness":[{"criterion":string,"status":"met"|"not_met"|"unknown","evidence":string}],"risks":[string],"nonBindingNote":string,"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: StrategyPlanSchema,
  checks: (out, brief) => strategyChecks(out, brief as { verdict?: string }),
};
