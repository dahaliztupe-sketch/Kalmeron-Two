import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { DATA_KNOWLEDGE } from "../knowledge/data";
import { proseGuards } from "./guards";

const S = (n: number) => z.string().min(1).max(n);

export const DataPlanSchema = z.object({
  northStar: z.object({ name: S(80), definition: S(250), basis: Basis }),
  inputMetrics: z.array(z.object({ name: S(80), definition: S(200), basis: Basis })).min(1).max(6),
  events: z
    .array(z.object({ name: z.string().regex(/^[a-z][a-z0-9_]{1,40}$/), trigger: S(150), properties: z.array(S(40)).max(5), personalData: z.boolean() }))
    .min(1)
    .max(12),
  dashboards: z.array(z.object({ name: S(80), questions: z.array(S(150)).min(1).max(4) })).min(1).max(4),
  experiments: z.array(z.object({ hypothesis: S(200), metric: S(80), sampleSizeRule: S(200), decisionRule: S(200) })).max(3),
  privacyNote: S(300),
  handoff: z.array(z.object({ role: S(40), reason: S(200) })).max(4).default([]),
});
export type DataPlan = z.infer<typeof DataPlanSchema>;

const ACTS = /(سأركّب|سأثبّت|سأفعّل التتبع|تم تفعيل|سأرسل البيانات|سأشترك)/;

export function dataChecks(out: DataPlan, _brief: unknown): Issue[] {
  const prose = [out.northStar.definition, ...out.inputMetrics.map((m) => m.definition), ...out.events.map((e) => e.trigger), ...out.dashboards.flatMap((d) => d.questions), ...out.experiments.flatMap((x) => [x.hypothesis, x.sampleSizeRule, x.decisionRule]), out.privacyNote];
  const issues = proseGuards(prose, ACTS, "الدور يخطط فقط: لا يركّب أدوات تتبع ولا يفعّلها. أعد الصياغة كخطوة للمؤسس.");
  if (out.events.some((e) => e.personalData)) issues.push({ level: "warn", code: "personal_data_events", message: "أحداث تحمل بيانات شخصية: تحتاج أساس موافقة وغرضاً محدداً. راجع محامياً." });
  const names = out.events.map((e) => e.name);
  if (new Set(names).size !== names.length) issues.push({ level: "error", code: "duplicate_event", message: "اسم حدث مكرر." });
  if (out.experiments.some((x) => /(أول نتيجة|حتى تظهر|معنوية فوراً|عند ظهور)/.test(`${x.sampleSizeRule} ${x.decisionRule}`))) {
    issues.push({ level: "error", code: "peeking", message: "قاعدة تجربة تتوقف عند أول نتيجة معنوية. حدد حجم العينة مسبقاً." });
  }
  if (out.experiments.some((x) => !/(\d|عينة|مستخدم|زائر)/.test(x.sampleSizeRule))) issues.push({ level: "warn", code: "sample_rule_vague", message: "قاعدة حجم العينة غامضة." });
  if (!/(محامي|مستشار|مختص)/.test(out.privacyNote)) issues.push({ level: "warn", code: "missing_consult_line", message: "أضف سطر مراجعة قانونية لتتبع البيانات الشخصية." });
  return issues;
}

export const DATA_ROLE: RoleSpec<DataPlan> = {
  id: "data",
  titleAr: "محلل البيانات والمقاييس",
  mission: "مقاييس وخطة أحداث ولوحة أولى وتجارب صغيرة. مسودة فقط.",
  outOfScope: ["تركيب أدوات التتبع أو تفعيلها", "جمع بيانات مستخدمين فعلية", "تفسير نتائج حقيقية (لا توجد بيانات)", "معايير سوق أو أهداف رقمية بلا مصدر"],
  systemPrompt: `أنت محلل بيانات لشركة ناشئة صغيرة. لا توجد بيانات حقيقية بعد: تصمم القياس قبل الجمع. مخرجك مسودة آلية.
${COMMON_RULES}
${knowledgePrompt(DATA_KNOWLEDGE, new Date())}
تفاصيل الدور:
- مقياس نجمة واحد وعدد قليل من المقاييس المدخلة، وكل هدف رقمي افتراض بوسم basis.
- أسماء الأحداث snake_case بحروف إنجليزية صغيرة؛ لكل حدث الإطلاق والخصائص وهل يحمل بيانات شخصية. قلّل البيانات الشخصية.
- التجارب فقط إن كانت الحركة تسمح: اكتب حجم العينة وقاعدة القرار مسبقاً ولا تتوقف عند أول نتيجة. اترك experiments فارغة إن لم توجد حركة.
- privacyNote يذكر أن تتبع البيانات الشخصية يحتاج مراجعة محامٍ.
- لا تخترع معايير سوق.`,
  outputShape: `{"northStar":{"name":string,"definition":string,"basis":"assumption"|"user_fact"|"needs_check"},"inputMetrics":[{"name":string,"definition":string,"basis":...}],"events":[{"name":snake_case string,"trigger":string,"properties":[string],"personalData":boolean}],"dashboards":[{"name":string,"questions":[string]}],"experiments":[{"hypothesis":string,"metric":string,"sampleSizeRule":string,"decisionRule":string}],"privacyNote":string,"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: DataPlanSchema,
  checks: (out, brief) => dataChecks(out, brief),
};
