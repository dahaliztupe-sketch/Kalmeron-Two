import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { PRODUCT_KNOWLEDGE } from "../knowledge/product";

const Feature = z.object({ feature: z.string().min(1).max(150), reason: z.string().min(1).max(250), basis: Basis });

export const ProductPlanSchema = z.object({
  coreProblem: z.string().min(1).max(400),
  learningGoal: z.string().min(1).max(300),
  mvpScope: z.object({
    must: z.array(Feature).min(1).max(8),
    should: z.array(Feature).max(8),
    wont: z.array(Feature).min(1).max(8),
  }),
  techStack: z.array(z.object({ layer: z.string().min(1).max(60), suggestion: z.string().min(1).max(150), reason: z.string().min(1).max(250), basis: Basis })).min(1).max(8),
  buildChecklist: z
    .array(z.object({ week: z.number().int().min(1).max(26), tasks: z.array(z.string().min(1).max(200)).min(1).max(6), doneWhen: z.string().min(1).max(200) }))
    .min(1)
    .max(26),
  costTiers: z
    .array(z.object({ tool: z.string().min(1).max(60), tier: z.string().min(1).max(60), monthlyUsd: z.number().min(0).max(100_000).nullable(), basis: Basis, note: z.string().max(200).default("") }))
    .max(8)
    .default([]),
  risks: z.array(z.object({ text: z.string().min(1).max(250), basis: Basis })).max(6),
  handoff: z.array(z.object({ role: z.string().max(40), reason: z.string().max(200) })).max(4).default([]),
});
export type ProductPlan = z.infer<typeof ProductPlanSchema>;

const OVERPROMISE = /(مضمون|ضمان|نضمن|100\s*%|ارباح مؤكدة|أرباح مؤكدة|بدون مخاطر|بدون أخطاء)/;
const promiseHit = (ts: string[]): string | null => {
  for (const t of ts) {
    const m = t.match(OVERPROMISE);
    if (m) return m[0];
  }
  return null;
};
const STAT = /(\d+(\.\d+)?\s*(%|٪)|\d+\s*(مليون|مليار|ألف عميل))/;
/** The role plans; it must not claim to write, ship or deploy code for the customer. */
const ACTS = /(سأنشر|سننشر|سأرفع|سأكتب الكود|سنكتب الكود|سأبرمج|سننفذ النشر|تم النشر|deploy(ed)? (it|for you)|i will (deploy|write the code))/i;
const PRICE = /(\d[\d,.]*\s*(جنيه|ج\.م|دولار|\$|egp|usd)\s*(\/|في|شهر|سنوي))/i;

export function productChecks(out: ProductPlan, brief: { constraints: { days: number | null; budgetEgp: number | null } }): Issue[] {
  const issues: Issue[] = [];
  const prose = [
    out.coreProblem,
    out.learningGoal,
    ...out.mvpScope.must.flatMap((f) => [f.feature, f.reason]),
    ...out.mvpScope.should.flatMap((f) => [f.feature, f.reason]),
    ...out.techStack.map((t) => `${t.suggestion} ${t.reason}`),
    ...out.buildChecklist.flatMap((w) => [...w.tasks, w.doneWhen]),
  ];
  if (promiseHit(prose)) issues.push({ level: "error", code: "overpromise", message: `نص يحتوي وعداً أو ضماناً بنتيجة. (الكلمة: "${promiseHit(prose)}")` });
  if (prose.some((t) => ACTS.test(t))) issues.push({ level: "error", code: "acts_outside_role", message: "الدور يخطط فقط: لا يكتب كوداً ولا ينشر للعميل. أعد الصياغة كخطوة للمؤسس." });
  if (prose.some((t) => STAT.test(t))) issues.push({ level: "warn", code: "unsupported_statistic", message: "رقم أو نسبة داخل النص بلا وسم basis. راجعه." });
  const mustNames = new Set(out.mvpScope.must.map((f) => f.feature.trim()));
  if (out.mvpScope.wont.some((f) => mustNames.has(f.feature.trim())) || out.mvpScope.should.some((f) => mustNames.has(f.feature.trim()))) {
    issues.push({ level: "error", code: "scope_contradiction", message: "ميزة مكررة بين يجب وبين يستحسن أو لن نبنيه." });
  }
  const weeks = out.buildChecklist.map((w) => w.week);
  if (new Set(weeks).size !== weeks.length || weeks.some((w, i) => i > 0 && w < weeks[i - 1])) {
    issues.push({ level: "error", code: "week_order", message: "أرقام الأسابيع مكررة أو غير مرتبة." });
  }
  const days = brief.constraints.days;
  if (days != null && weeks.length > 0 && Math.max(...weeks) * 7 > days) {
    issues.push({ level: "error", code: "exceeds_duration", message: `قائمة البناء تتجاوز المدة المحددة (${days} يوماً).` });
  }
  if (out.techStack.some((t) => PRICE.test(`${t.suggestion} ${t.reason}`) && t.basis !== "needs_check")) {
    issues.push({ level: "warn", code: "price_needs_check", message: "سعر أداة بلا وسم needs_check. الأسعار تتغير، راجع المصدر." });
  }
  if (out.costTiers.some((c) => c.monthlyUsd != null && c.basis !== "needs_check")) {
    issues.push({ level: "error", code: "cost_not_needs_check", message: "سعر أداة بلا وسم needs_check. الأسعار تتغير ومصدرها صفحة المورّد." });
  }
  if (brief.constraints.budgetEgp != null && out.costTiers.some((c) => c.monthlyUsd != null && c.monthlyUsd > 0)) {
    issues.push({ level: "warn", code: "usd_vs_egp_budget", message: "تكاليف بالدولار والميزانية بالجنيه: لا تُقارن دون سعر صرف مصدره معروف." });
  }
  if (out.mvpScope.must.length > 5) issues.push({ level: "warn", code: "scope_too_wide", message: "أكثر من 5 ميزات أساسية: النطاق قد لا يناسب منتجاً أولياً." });
  return issues;
}

export const PRODUCT_ROLE: RoleSpec<ProductPlan> = {
  id: "product",
  titleAr: "مدير المنتج",
  mission: "نطاق منتج أولي (يجب/يستحسن/لن نبنيه)، مكدس تقنيات مقترح، وقائمة بناء بالأسابيع. خطة فقط.",
  outOfScope: ["كتابة كود أو نشره أو إدارة بنية تحتية للعميل", "إنشاء حسابات أو دفع اشتراكات", "تسعير المنتج (دور المالية)", "الترخيص والعقود (دور القانون)"],
  systemPrompt: `أنت مدير منتج خبير في تحويل فكرة إلى منتج أولي صغير لمؤسس مصري بموارد محدودة. مهمتك التخطيط فقط: لا تكتب كوداً للعميل ولا تنشر ولا تُنشئ حسابات.
${COMMON_RULES}
${knowledgePrompt(PRODUCT_KNOWLEDGE, new Date())}
تفاصيل الدور:
- حدد المشكلة الأساسية وهدف التعلّم من المنتج الأولي.
- نطاق: 3 إلى 6 ميزات يجب، حتى 4 يستحسن، و2 إلى 4 لن نبنيها الآن، مع سبب لكل بند وbasis.
- مكدس تقنيات بسيط (1 إلى 8 طبقات) مع سبب وbasis. أسعار الأدوات وحدودها needs_check.
- costTiers (اختياري): شرائح الأدوات بالدولار كما في المعرفة أعلاه، basis: needs_check دائماً، بلا تحويل للجنيه. الواجهة العربية بـ dir=rtl.
- قائمة بناء أسبوعية مرتبة، لكل أسبوع مهام ومعيار إنجاز، ولا تتجاوز مدة الملخص.
- التسعير والقانون والتوظيف تذهب إلى handoff.`,
  outputShape: `{"coreProblem":string,"learningGoal":string,"mvpScope":{"must":[{"feature":string,"reason":string,"basis":"assumption"|"user_fact"|"needs_check"}],"should":[same],"wont":[same]},"techStack":[{"layer":string,"suggestion":string,"reason":string,"basis":...}],"buildChecklist":[{"week":number,"tasks":[string],"doneWhen":string}],"costTiers":[{"tool":string,"tier":string,"monthlyUsd":number|null,"basis":"needs_check","note":string}],"risks":[{"text":string,"basis":...}],"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: ProductPlanSchema,
  checks: (out, brief) => productChecks(out, brief),
};
