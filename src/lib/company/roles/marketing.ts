import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { MARKETING_KNOWLEDGE } from "../knowledge/marketing";

export const MarketingPlanSchema = z.object({
  positioning: z.string().min(1).max(500),
  channels: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        why: z.string().min(1).max(300),
        budgetEgp: z.number().min(0),
        weeklyActions: z.array(z.string().min(1).max(200)).min(1).max(5),
        basis: Basis,
      }),
    )
    .min(1)
    .max(5),
  weeks: z
    .array(z.object({ week: z.number().int().min(1).max(4), goal: z.string().min(1).max(200), tasks: z.array(z.string().min(1).max(200)).min(1).max(6) }))
    .length(4),
  messaging: z.object({
    headline: z.string().min(1).max(120),
    valueProps: z.array(z.string().min(1).max(200)).min(2).max(4),
    objections: z.array(z.object({ objection: z.string().max(200), answer: z.string().max(300) })).max(5),
  }),
  metrics: z.array(z.object({ name: z.string().min(1).max(100), target: z.string().min(1).max(100), basis: Basis })).min(2).max(6),
  /** Drafts only. Nothing is posted by the platform. */
  draftPosts: z.array(z.object({ channel: z.string().max(80), text: z.string().min(1).max(600) })).max(5),
  totalBudgetEgp: z.number().min(0),
  handoff: z.array(z.object({ role: z.string().max(40), reason: z.string().max(200) })).max(4).default([]),
});

export type MarketingPlan = z.infer<typeof MarketingPlanSchema>;

const OVERPROMISE = /(مضمون|ضمان|نضمن|100\s*%|ارباح مؤكدة|أرباح مؤكدة|بدون مخاطر)/;
const STAT = /(\d+(\.\d+)?\s*(%|٪)|\d+\s*(مليون|مليار|ألف عميل))/;

export function marketingChecks(out: MarketingPlan, brief: { constraints: { budgetEgp: number | null } }): Issue[] {
  const issues: Issue[] = [];
  const sum = out.channels.reduce((s, c) => s + c.budgetEgp, 0);
  if (Math.abs(sum - out.totalBudgetEgp) > 1) {
    issues.push({ level: "error", code: "budget_mismatch", message: `مجموع ميزانيات القنوات (${sum}) لا يساوي الإجمالي (${out.totalBudgetEgp}).` });
  }
  const cap = brief.constraints.budgetEgp;
  if (cap !== null && out.totalBudgetEgp > cap) {
    issues.push({ level: "error", code: "over_budget", message: `الإجمالي ${out.totalBudgetEgp} يتجاوز الميزانية ${cap}.` });
  }
  const weeks = out.weeks.map((w) => w.week).sort().join(",");
  if (weeks !== "1,2,3,4") issues.push({ level: "error", code: "weeks_not_1_to_4", message: "يجب أن تغطي الخطة الأسابيع 1 إلى 4 بلا تكرار." });
  const proseFields = [out.positioning, out.messaging.headline, ...out.messaging.valueProps, ...out.channels.map((c) => c.why), ...out.draftPosts.map((d) => d.text)];
  if (proseFields.some((t) => OVERPROMISE.test(t))) {
    issues.push({ level: "error", code: "overpromise", message: "نص يحتوي وعداً أو ضماناً بنتيجة." });
  }
  if (proseFields.some((t) => STAT.test(t))) {
    issues.push({ level: "warn", code: "unsupported_statistic", message: "رقم أو نسبة داخل النص بلا وسم basis. راجعه." });
  }
  if (out.draftPosts.length === 0) issues.push({ level: "warn", code: "no_drafts", message: "لا توجد مسودات منشورات." });
  return issues;
}

export const MARKETING_ROLE: RoleSpec<MarketingPlan> = {
  id: "marketing",
  titleAr: "مسؤول التسويق",
  mission: "خطة 30 يوماً للوصول لأول 10 عملاء بميزانية محدودة، مع مسودات رسائل جاهزة للمراجعة.",
  outOfScope: ["النشر الفعلي على أي منصة", "إنفاق إعلاني دون موافقة", "تحليل مالي تفصيلي (دور المالية)", "نصوص قانونية"],
  systemPrompt: `أنت مسؤول تسويق خبير في السوق المصري للشركات الناشئة الصغيرة. مهمتك: تصميم خطة 30 يوماً للوصول لأول 10 عملاء مدفوعين لفكرة محددة، بميزانية صغيرة، بقنوات عملية في مصر (مثل مجموعات فيسبوك، واتساب، إنستجرام، علاقات مباشرة، شراكات محلية) مع تفضيل القنوات المجانية أو الرخيصة.
${COMMON_RULES}
${knowledgePrompt(MARKETING_KNOWLEDGE, new Date())}
تفاصيل الدور:
- ابدأ بجملة تموضع واحدة تناسب العميل المستهدف في الملخص.
- 1 إلى 5 قنوات فقط، كل قناة بسببها وميزانيتها بالجنيه وإجراءات أسبوعية.
- 4 أسابيع بهدف ومهام لكل أسبوع.
- رسائل: عنوان وقيمتان إلى 4 وردود على اعتراضات محتملة.
- مقاييس قابلة للقياس (2 إلى 6) مع الوسم basis؛ الأهداف الرقمية افتراضات ما لم يذكرها المستخدم.
- مسودات منشورات (حتى 5) للمراجعة فقط.
- totalBudgetEgp يساوي مجموع ميزانيات القنوات.
- إن احتاج جزء لدور آخر (مبيعات، مالية، قانون، منتج) ضعه في handoff.`,
  outputShape: `{"positioning":string,"channels":[{"name":string,"why":string,"budgetEgp":number,"weeklyActions":[string],"basis":"assumption"|"user_fact"|"needs_check"}],"weeks":[{"week":1,"goal":string,"tasks":[string]},{"week":2,...},{"week":3,...},{"week":4,...}],"messaging":{"headline":string,"valueProps":[string],"objections":[{"objection":string,"answer":string}]},"metrics":[{"name":string,"target":string,"basis":...}],"draftPosts":[{"channel":string,"text":string}],"totalBudgetEgp":number,"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: MarketingPlanSchema,
  checks: marketingChecks,
};
