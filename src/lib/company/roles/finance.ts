import { z } from "zod";
import { Basis } from "@/src/lib/plan/validated-plan";
import { COMMON_RULES, type Issue, type RoleSpec } from "./spec";
import { knowledgePrompt } from "../knowledge/types";
import { FINANCE_KNOWLEDGE } from "../knowledge/finance";

const Egp = z.number().min(0).max(1_000_000_000);
const Money = z.object({ valueEgp: Egp, basis: Basis });

export const FinancePlanSchema = z.object({
  assumptionsSummary: z.string().min(1).max(500),
  collectionNote: z.string().min(1).max(250),
  pricePerUnit: Money,
  variableCostPerUnit: Money,
  openingCash: Money,
  fixedCosts: z.array(z.object({ name: z.string().min(1).max(100), monthlyEgp: Egp, basis: Basis })).min(1).max(12),
  months: z
    .array(
      z.object({
        month: z.number().int().min(1).max(3),
        units: z.number().min(0).max(10_000_000),
        revenueEgp: Egp,
        variableCostsEgp: Egp,
        fixedCostsEgp: Egp,
        netCashEgp: z.number().min(-1_000_000_000).max(1_000_000_000),
        endingCashEgp: z.number().min(-1_000_000_000).max(1_000_000_000),
        basis: Basis,
      }),
    )
    .length(3),
  breakEven: z.object({
    unitsPerMonth: z.number().min(0).max(100_000_000).nullable(),
    revenuePerMonthEgp: Egp.nullable(),
    note: z.string().min(1).max(300),
    basis: Basis,
  }),
  risks: z.array(z.object({ text: z.string().min(1).max(250), basis: Basis })).max(6),
  taxNotes: z.array(z.object({ text: z.string().min(1).max(300), basis: Basis })).max(4),
  handoff: z.array(z.object({ role: z.string().max(40), reason: z.string().max(200) })).max(4).default([]),
});
export type FinancePlan = z.infer<typeof FinancePlanSchema>;

const OVERPROMISE = /(مضمون|ضمان|نضمن|100\s*%|ارباح مؤكدة|أرباح مؤكدة|بدون مخاطر|حتماً|حتما ستربح)/;
const STAT = /(\d+(\.\d+)?\s*(%|٪)|\d+\s*(مليون|مليار|ألف عميل))/;
const TOL = 1;
const near = (a: number, b: number) => Math.abs(a - b) <= TOL;

export function financeChecks(out: FinancePlan, brief?: { constraints?: { budgetEgp: number | null; days: number | null } }): Issue[] {
  const issues: Issue[] = [];
  const err = (code: string, message: string) => issues.push({ level: "error", code, message });
  const warn = (code: string, message: string) => issues.push({ level: "warn", code, message });

  const prose = [out.assumptionsSummary, out.collectionNote, out.breakEven.note, ...out.risks.map((r) => r.text), ...out.taxNotes.map((t) => t.text)];
  if (prose.some((t) => OVERPROMISE.test(t))) err("overpromise", "نص يحتوي وعداً أو ضماناً بربح أو نتيجة.");
  if (prose.some((t) => STAT.test(t))) warn("unsupported_statistic", "نسبة أو رقم داخل النص بلا وسم basis. راجعه.");

  const fixed = out.fixedCosts.reduce((s, c) => s + c.monthlyEgp, 0);
  const price = out.pricePerUnit.valueEgp;
  const vc = out.variableCostPerUnit.valueEgp;
  let prev = out.openingCash.valueEgp;
  const nums = [...out.months].sort((a, b) => a.month - b.month);
  if (nums.map((m) => m.month).join() !== "1,2,3") err("months_sequence", "يجب أن تكون الأشهر 1 و2 و3 مرة واحدة لكل منها.");
  for (const m of nums) {
    if (!near(m.revenueEgp, m.units * price)) err("revenue_mismatch", `إيراد الشهر ${m.month} لا يساوي الوحدات × السعر.`);
    if (!near(m.variableCostsEgp, m.units * vc)) err("variable_cost_mismatch", `التكاليف المتغيرة للشهر ${m.month} لا تساوي الوحدات × تكلفة الوحدة.`);
    if (!near(m.fixedCostsEgp, fixed)) err("fixed_cost_mismatch", `التكاليف الثابتة للشهر ${m.month} لا تساوي مجموع البنود الثابتة.`);
    if (!near(m.netCashEgp, m.revenueEgp - m.variableCostsEgp - m.fixedCostsEgp)) err("net_mismatch", `صافي الشهر ${m.month} لا يساوي الإيراد ناقص التكاليف.`);
    if (!near(m.endingCashEgp, prev + m.netCashEgp)) err("balance_mismatch", `الرصيد الختامي للشهر ${m.month} لا يساوي الرصيد السابق زائد الصافي.`);
    prev = m.endingCashEgp;
  }
  if (nums.some((m) => m.endingCashEgp < 0)) warn("cash_negative", "الرصيد يصبح سالباً في شهر ما: هناك فجوة تمويل يجب إبرازها.");

  const cm = price - vc;
  if (cm <= 0) {
    if (out.breakEven.unitsPerMonth !== null || out.breakEven.revenuePerMonthEgp !== null) err("breakeven_invalid", "هامش المساهمة صفر أو سالب: لا توجد نقطة تعادل ويجب أن تكون القيمة null.");
  } else {
    const units = fixed / cm;
    if (out.breakEven.unitsPerMonth === null || Math.abs(out.breakEven.unitsPerMonth - units) > 1) err("breakeven_mismatch", "نقطة التعادل لا تساوي التكاليف الثابتة ÷ (السعر − التكلفة المتغيرة).");
    else if (out.breakEven.revenuePerMonthEgp !== null && Math.abs(out.breakEven.revenuePerMonthEgp - units * price) > Math.max(TOL, price)) err("breakeven_revenue_mismatch", "إيراد التعادل لا يساوي وحدات التعادل × السعر.");
  }

  const budget = brief?.constraints?.budgetEgp ?? null;
  if (budget !== null) {
    const spend = nums.reduce((s, m) => s + m.variableCostsEgp + m.fixedCostsEgp, 0);
    if (spend > budget) warn("over_budget", "إجمالي إنفاق 3 أشهر يتجاوز الميزانية المذكورة في الملخص.");
  }
  const days = brief?.constraints?.days ?? null;
  if (days !== null && days < 90) warn("horizon_mismatch", "مدة الملخص أقل من 3 أشهر؛ وضّح أي جزء من الخطة خارج المدة.");

  if (out.taxNotes.length > 0 && !out.handoff.some((h) => /legal|قانون|محاسب/i.test(h.role + h.reason))) {
    warn("tax_needs_professional", "ملاحظات ضريبية بلا إحالة إلى دور القانون أو محاسب مرخص.");
  }
  const allBases = [out.pricePerUnit.basis, out.variableCostPerUnit.basis, out.openingCash.basis, ...out.fixedCosts.map((c) => c.basis)];
  if (allBases.includes("user_fact") && !brief) warn("user_fact_unverifiable", "رقم موسوم user_fact ولا ملخص للمقارنة.");
  return issues;
}

export const FINANCE_ROLE: RoleSpec<FinancePlan> = {
  id: "finance",
  titleAr: "المدير المالي",
  mission: "خطة نقد لـ 3 أشهر ونقطة تعادل بالجنيه المصري من تكاليف الشركة، مع افتراضات صريحة.",
  outOfScope: ["تنفيذ أي دفع أو تحويل", "تقديم إقرارات ضريبية أو استشارة ضريبية نهائية (محاسب مرخص)", "عقود وتراخيص (دور القانون)", "تقدير حجم السوق أو أسعار المنافسين دون مصدر", "وعود بالربح أو التمويل"],
  systemPrompt: `أنت مدير مالي خبير لشركات ناشئة صغيرة في مصر. مهمتك: خطة نقد لـ 3 أشهر ونقطة تعادل بالجنيه المصري. أنت تُعدّ خطة ومسودات فقط، وكل رقم افتراض ما لم يذكره الملخص.
${COMMON_RULES}
${knowledgePrompt(FINANCE_KNOWLEDGE, new Date())}
تفاصيل الدور:
- لا تخترع أسعاراً أو تكاليف أو مبيعات: ما ليس في الملخص يُوسم assumption أو needs_check ويُعرض كافتراض يعدّله المؤسس.
- فصّل التكاليف الثابتة الشهرية عن التكلفة المتغيرة للوحدة، وحدد سعر الوحدة والرصيد الافتتاحي.
- الأشهر الثلاثة: units، revenueEgp = units × السعر، variableCostsEgp = units × التكلفة المتغيرة، fixedCostsEgp = مجموع الثوابت، netCashEgp = الإيراد − التكاليف، endingCashEgp = الرصيد السابق + الصافي. المجاميع يجب أن تتطابق.
- نقطة التعادل (وحدات/شهر) = الثوابت ÷ (السعر − التكلفة المتغيرة)، وnull إن كان الهامش ≤ 0.
- اذكر افتراض توقيت التحصيل في collectionNote.
- إن نزل الرصيد تحت الصفر أو تجاوز الإنفاق الميزانية فاذكر ذلك في risks.
- الضرائب: ملاحظات عامة فقط (taxNotes) مع handoff إلى دور القانون أو محاسب مرخص. لا تذكر شرائح ضريبية.
- لا نسب مئوية أو أرقام سوق في النص.`,
  outputShape: `{"assumptionsSummary":string,"collectionNote":string,"pricePerUnit":{"valueEgp":number,"basis":...},"variableCostPerUnit":{"valueEgp":number,"basis":...},"openingCash":{"valueEgp":number,"basis":...},"fixedCosts":[{"name":string,"monthlyEgp":number,"basis":...}],"months":[{"month":1|2|3,"units":number,"revenueEgp":number,"variableCostsEgp":number,"fixedCostsEgp":number,"netCashEgp":number,"endingCashEgp":number,"basis":...}],"breakEven":{"unitsPerMonth":number|null,"revenuePerMonthEgp":number|null,"note":string,"basis":...},"risks":[{"text":string,"basis":...}],"taxNotes":[{"text":string,"basis":...}],"handoff":[{"role":string,"reason":string}]}`,
  outputSchema: FinancePlanSchema,
  checks: (out, brief) => financeChecks(out, brief),
};
