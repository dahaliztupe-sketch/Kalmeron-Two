import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { SALES_KNOWLEDGE } from "../knowledge/sales";

export const SalesPlanSchema = z.object({
  idealCustomer: z.string().min(1).max(400),
  prospectGroups: z
    .array(z.object({ name: z.string().min(1).max(120), howToReach: z.string().min(1).max(250), consentBasis: z.enum(["existing_relationship", "referral", "they_asked", "needs_check"]), basis: Basis }))
    .min(1)
    .max(5),
  discoveryQuestions: z.array(z.string().min(1).max(250)).min(5).max(10),
  outreachDrafts: z.array(z.object({ group: z.string().max(120), text: z.string().min(1).max(600) })).min(1).max(4),
  stages: z.array(z.object({ name: z.string().min(1).max(60), exitCriteria: z.string().min(1).max(200) })).min(3).max(7),
  followUp: z.array(z.string().min(1).max(200)).min(1).max(5),
  objections: z.array(z.object({ objection: z.string().max(200), answer: z.string().max(300) })).max(6),
  metrics: z.array(z.object({ name: z.string().min(1).max(100), target: z.string().min(1).max(100), basis: Basis })).min(2).max(6),
  handoff: z.array(z.object({ role: z.string().max(40), reason: z.string().max(200) })).max(4).default([]),
});
export type SalesPlan = z.infer<typeof SalesPlanSchema>;

const OVERPROMISE = /(مضمون|ضمان|نضمن|100\s*%|ارباح مؤكدة|أرباح مؤكدة|بدون مخاطر)/;
const promiseHit = (ts: string[]): string | null => {
  for (const t of ts) {
    const m = t.match(OVERPROMISE);
    if (m) return m[0];
  }
  return null;
};
const STAT = /(\d+(\.\d+)?\s*(%|٪)|\d+\s*(مليون|مليار|ألف عميل))/;
const HYPOTHETICAL = /(هل (ستستخدم|ستشتري|ستدفع|تعتقد أن فكرتي)|لو (كان|وفرنا|عملنا)|هل تحب فكرة|هل ترى أن الفكرة)/;
const COLD_BULK = /(رسائل جماعية|رسائل باردة|cold\s*(dm|message|outreach|email)|إرسال جماعي)/i;

export function salesChecks(out: SalesPlan): Issue[] {
  const issues: Issue[] = [];
  if (out.discoveryQuestions.some((q) => HYPOTHETICAL.test(q))) {
    issues.push({ level: "error", code: "hypothetical_question", message: "سؤال اكتشاف افتراضي أو يطلب رأياً في الفكرة. اسأل عن سلوك سابق فعلي." });
  }
  const prose = [out.idealCustomer, ...out.outreachDrafts.map((d) => d.text), ...out.objections.map((o) => o.answer), ...out.followUp];
  if (promiseHit(prose)) issues.push({ level: "error", code: "overpromise", message: `نص يحتوي وعداً أو ضماناً بنتيجة. (الكلمة: "${promiseHit(prose)}")` });
  if (prose.some((t) => STAT.test(t))) issues.push({ level: "warn", code: "unsupported_statistic", message: "رقم أو نسبة داخل النص بلا وسم basis. راجعه." });
  if (out.prospectGroups.some((g) => g.consentBasis === "needs_check") || prose.some((t) => COLD_BULK.test(t))) {
    issues.push({ level: "warn", code: "consent_needs_check", message: "تواصل بلا أساس موافقة واضح أو برسائل باردة: قد يخالف سياسة واتساب وقانون حماية البيانات المصري. راجع قبل التنفيذ." });
  }
  return issues;
}

export const SALES_ROLE: RoleSpec<SalesPlan> = {
  id: "sales",
  titleAr: "مسؤول المبيعات",
  mission: "خطة وصول يدوي لأول عملاء مدفوعين: من نخاطب، أسئلة اكتشاف، مسودات رسائل، ومراحل متابعة.",
  outOfScope: ["إرسال أي رسالة فعلياً", "رسائل جماعية أو باردة", "تسعير نهائي (دور المالية)", "عقود (دور القانون)"],
  systemPrompt: `أنت مسؤول مبيعات خبير في بيع الخدمات لأصحاب الأعمال الصغيرة في مصر. مهمتك: تصميم خطة بيع يدوي يقوده المؤسس لأول عملاء مدفوعين، لا قمع إعلاني.
${COMMON_RULES}
${knowledgePrompt(SALES_KNOWLEDGE, new Date())}
تفاصيل الدور:
- حدد العميل المثالي من الملخص، و1 إلى 5 مجموعات للوصول إليهم مع أساس الموافقة لكل مجموعة (existing_relationship أو referral أو they_asked أو needs_check).
- 6 إلى 8 أسئلة اكتشاف عن سلوك سابق فعلي، بلا أسئلة افتراضية.
- 2 إلى 3 مسودات رسائل شخصية قصيرة تقدم قيمة قبل الطلب. مسودات فقط.
- 3 إلى 7 مراحل للصفقة مع معيار الخروج من كل مرحلة، وخطوات متابعة.
- اعتراضات محتملة وردود صادقة، ومقاييس (2 إلى 6) مع basis.
- التسعير والعقود والأرقام المالية تذهب إلى handoff.`,
  outputShape: `{"idealCustomer":string,"prospectGroups":[{"name":string,"howToReach":string,"consentBasis":"existing_relationship"|"referral"|"they_asked"|"needs_check","basis":"assumption"|"user_fact"|"needs_check"}],"discoveryQuestions":[string],"outreachDrafts":[{"group":string,"text":string}],"stages":[{"name":string,"exitCriteria":string}],"followUp":[string],"objections":[{"objection":string,"answer":string}],"metrics":[{"name":string,"target":string,"basis":...}],"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: SalesPlanSchema,
  checks: (out) => salesChecks(out),
};
