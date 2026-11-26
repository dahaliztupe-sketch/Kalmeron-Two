import { describe, it, expect } from "vitest";
import { FinancePlanSchema, financeChecks, FINANCE_ROLE, type FinancePlan } from "@/src/lib/company/roles/finance";
import { FINANCE_KNOWLEDGE } from "@/src/lib/company/knowledge/finance";
import { ROLES } from "@/src/lib/company/roles/registry";

const m = (month: number, units: number, prev: number) => {
  const revenueEgp = units * 500, variableCostsEgp = units * 200, fixedCostsEgp = 6000;
  const netCashEgp = revenueEgp - variableCostsEgp - fixedCostsEgp;
  return { month, units, revenueEgp, variableCostsEgp, fixedCostsEgp, netCashEgp, endingCashEgp: prev + netCashEgp, basis: "assumption" as const };
};
const m1 = m(1, 10, 20000), m2 = m(2, 20, m1.endingCashEgp), m3 = m(3, 30, m2.endingCashEgp);
const good: FinancePlan = {
  assumptionsSummary: "كل الأرقام افتراضات يعدلها المؤسس.",
  collectionNote: "نفترض التحصيل في نفس شهر البيع.",
  pricePerUnit: { valueEgp: 500, basis: "assumption" },
  variableCostPerUnit: { valueEgp: 200, basis: "assumption" },
  openingCash: { valueEgp: 20000, basis: "assumption" },
  fixedCosts: [{ name: "إيجار", monthlyEgp: 4000, basis: "assumption" }, { name: "أدوات ورسوم دفع", monthlyEgp: 2000, basis: "needs_check" }],
  months: [m1, m2, m3],
  breakEven: { unitsPerMonth: 20, revenuePerMonthEgp: 10000, note: "الثوابت ÷ هامش المساهمة.", basis: "assumption" },
  risks: [],
  taxNotes: [{ text: "راجع محاسباً بشأن التسجيل الضريبي.", basis: "needs_check" }],
  handoff: [{ role: "legal", reason: "الضرائب والتسجيل" }],
};
const codes = (o: FinancePlan, b?: Parameters<typeof financeChecks>[1]) => financeChecks(o, b).map((i) => i.code);

describe("finance role", () => {
  it("good plan parses with no errors", () => {
    expect(FinancePlanSchema.safeParse(good).success).toBe(true);
    expect(financeChecks(good).filter((i) => i.level === "error")).toEqual([]);
  });
  it("rejects wrong month count", () => {
    expect(FinancePlanSchema.safeParse({ ...good, months: [m1, m2] }).success).toBe(false);
  });
  it("flags revenue, balance and break-even mismatches", () => {
    expect(codes({ ...good, months: [{ ...m1, revenueEgp: 9999 }, m2, m3] })).toContain("revenue_mismatch");
    expect(codes({ ...good, months: [{ ...m1, endingCashEgp: 1 }, m2, m3] })).toContain("balance_mismatch");
    expect(codes({ ...good, breakEven: { ...good.breakEven, unitsPerMonth: 5 } })).toContain("breakeven_mismatch");
  });
  it("flags break-even with non-positive margin", () => {
    const bad = { ...good, variableCostPerUnit: { valueEgp: 600, basis: "assumption" as const } };
    expect(codes(bad)).toContain("breakeven_invalid");
  });
  it("warns on negative cash and budget overrun", () => {
    const neg = { ...good, openingCash: { valueEgp: 0, basis: "assumption" as const }, months: [m(1, 1, 0), m(2, 1, m(1, 1, 0).endingCashEgp), m(3, 1, m(2, 1, m(1, 1, 0).endingCashEgp).endingCashEgp)] };
    expect(codes(neg)).toContain("cash_negative");
    expect(codes(good, { constraints: { budgetEgp: 1000, days: 30 } })).toEqual(expect.arrayContaining(["over_budget", "horizon_mismatch"]));
  });
  it("flags overpromise, statistics and tax without handoff", () => {
    expect(codes({ ...good, risks: [{ text: "أرباح مضمونة", basis: "assumption" }] })).toContain("overpromise");
    expect(codes({ ...good, risks: [{ text: "السوق ينمو 30%", basis: "assumption" }] })).toContain("unsupported_statistic");
    expect(codes({ ...good, handoff: [] })).toContain("tax_needs_professional");
  });
  it("warns when price is below unit cost", () => {
    expect(codes({ ...good, variableCostPerUnit: { valueEgp: 600, basis: "assumption" } })).toContain("price_below_cost");
  });
  it("warns when payment fees are not mentioned", () => {
    const noFees = { ...good, fixedCosts: [{ name: "إيجار", monthlyEgp: 6000, basis: "assumption" as const }] };
    expect(codes(noFees)).toContain("payment_fees_missing");
    expect(codes(good)).not.toContain("payment_fees_missing");
  });
  describe("golden cases", () => {
    // Hand-computed: fixed 6000, price 500, unit cost 200 => margin 300, break-even 20 units, revenue 10000.
    it("exactly at break-even gives zero net cash", () => {
      const at = m(1, 20, 20000);
      expect(at.netCashEgp).toBe(0);
      expect(codes({ ...good, months: [at, m(2, 20, 20000), m(3, 20, 20000)] })).not.toContain("net_mismatch");
    });
    it("non-integer break-even is accepted within 1 unit", () => {
      const odd = { ...good, fixedCosts: [{ name: "رسوم", monthlyEgp: 6100, basis: "assumption" as const }], months: [m1, m2, m3].map((x) => ({ ...x, fixedCostsEgp: 6100, netCashEgp: x.netCashEgp - 100 })) };
      // 6100/300 = 20.33; 20 is within 1 unit
      let bal = 20000;
      const months = odd.months.map((x) => { bal += x.netCashEgp; return { ...x, endingCashEgp: bal }; });
      expect(codes({ ...odd, months, breakEven: { ...good.breakEven, unitsPerMonth: 20, revenuePerMonthEgp: 10200 } }).filter((c) => c.startsWith("breakeven"))).toEqual([]);
    });
    it("null break-even is valid when margin is zero", () => {
      const z = { ...good, variableCostPerUnit: { valueEgp: 500, basis: "assumption" as const }, breakEven: { ...good.breakEven, unitsPerMonth: null, revenuePerMonthEgp: null } };
      expect(codes(z).filter((c) => c.startsWith("breakeven"))).toEqual([]);
    });
  });
  it("prompt carries sources; knowledge has real https URLs and honest status", () => {
    expect(FINANCE_ROLE.systemPrompt).toContain("المصدر:");
    for (const i of FINANCE_KNOWLEDGE.items) expect(i.sourceUrl.startsWith("https://")).toBe(true);
    const eg = FINANCE_KNOWLEDGE.items.filter((i) => i.id.startsWith("eg-"));
    for (const i of eg) expect(i.ruleAr).toContain("استشر");
  });
  it("is registered once the integrator adds it", () => {
    const reg = ROLES as Record<string, unknown>;
    if (reg.finance) expect(reg.finance).toBe(FINANCE_ROLE);
  });
});
