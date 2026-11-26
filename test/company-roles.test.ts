import { describe, it, expect, vi } from "vitest";
import { briefFromPlan } from "@/src/lib/company/brief";
import { runRole } from "@/src/lib/company/run-role";
import { MARKETING_ROLE, marketingChecks, type MarketingPlan } from "@/src/lib/company/roles/marketing";
import { isRoleId } from "@/src/lib/company/roles/registry";
import type { ValidatedPlan } from "@/src/lib/plan/validated-plan";

const plan: ValidatedPlan = {
  idea: "توصيل أدوية مزمنة", verdict: "refine", verdictReason: "r",
  swot: { strengths: [{ text: "حاجة حقيقية", basis: "user_fact" }], weaknesses: [{ text: "تراخيص", basis: "needs_check" }], opportunities: [], threats: [] },
  targetCustomer: "كبار السن في القاهرة", competitors: [{ name: "وجهة", note: "n" }], risks: [{ text: "تنظيم", basis: "assumption" }],
  nextSteps: [{ action: "a", days: 3, costEgp: null }],
};
const brief = briefFromPlan(plan, { budgetEgp: 2000, days: 30 });

const good: MarketingPlan = {
  positioning: "توصيل شهري منتظم لأدوية الأمراض المزمنة",
  channels: [
    { name: "مجموعات فيسبوك", why: "تجمع الفئة", budgetEgp: 500, weeklyActions: ["منشور"], basis: "assumption" },
    { name: "واتساب", why: "ثقة مباشرة", budgetEgp: 300, weeklyActions: ["رسائل"], basis: "assumption" },
  ],
  weeks: [1, 2, 3, 4].map((w) => ({ week: w, goal: `هدف ${w}`, tasks: ["مهمة"] })),
  messaging: { headline: "أدويتك في موعدها", valueProps: ["منتظم", "موثوق"], objections: [{ objection: "الثقة", answer: "صيدلي مرخص" }] },
  metrics: [{ name: "محادثات", target: "20", basis: "assumption" }, { name: "عملاء", target: "10", basis: "assumption" }],
  draftPosts: [{ channel: "فيسبوك", text: "مسودة منشور" }],
  totalBudgetEgp: 800,
  handoff: [],
};

describe("company brief", () => {
  it("carries constraints and only non-user-fact claims as open checks", () => {
    expect(brief.constraints).toEqual({ budgetEgp: 2000, days: 30 });
    expect(brief.openChecks).toContain("تراخيص");
    expect(brief.openChecks).not.toContain("حاجة حقيقية");
  });
});

describe("marketing checks", () => {
  it("passes a good plan", () => {
    expect(marketingChecks(good, brief).filter((i) => i.level === "error")).toEqual([]);
  });
  it("warns on bulk or cold outreach", () => {
    const bad = { ...good, positioning: "نرسل رسائل جماعية على واتساب لكل الأرقام" };
    expect(marketingChecks(bad, brief).map((i) => i.code)).toContain("bulk_outreach_needs_consent");
    expect(marketingChecks(good, brief).map((i) => i.code)).not.toContain("bulk_outreach_needs_consent");
  });
  it("flags budget mismatch and over-budget", () => {
    const codes = marketingChecks({ ...good, totalBudgetEgp: 5000 }, brief).map((i) => i.code);
    expect(codes).toContain("budget_mismatch");
    expect(codes).toContain("over_budget");
  });
  it("flags overpromise and unsupported statistics", () => {
    const bad = { ...good, positioning: "أرباح مؤكدة وضمان 100%", messaging: { ...good.messaging, headline: "يزيد المبيعات 300%" } };
    const codes = marketingChecks(bad, brief).map((i) => i.code);
    expect(codes).toContain("overpromise");
    expect(codes).toContain("unsupported_statistic");
  });
  it("flags weeks that are not 1 to 4", () => {
    const weeks = [1, 1, 3, 4].map((w) => ({ week: w, goal: "g", tasks: ["t"] }));
    expect(marketingChecks({ ...good, weeks }, brief).map((i) => i.code)).toContain("weeks_not_1_to_4");
  });
});

describe("runRole", () => {
  it("returns output marked unverified on a good first attempt", async () => {
    const gen = vi.fn().mockResolvedValue("```json\n" + JSON.stringify(good) + "\n```");
    const r = await runRole(MARKETING_ROLE, brief, gen);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.attempts).toBe(1); expect(r.quality).toBe("unverified"); }
    expect(gen.mock.calls[0][0]).toContain("لا تنشر ولا ترسل");
    expect(gen.mock.calls[0][1]).toContain("الميزانية (جنيه): 2000");
  });
  it("repairs once: feeds quality failures back and succeeds", async () => {
    const gen = vi.fn().mockResolvedValueOnce(JSON.stringify({ ...good, totalBudgetEgp: 5000 })).mockResolvedValueOnce(JSON.stringify(good));
    const r = await runRole(MARKETING_ROLE, brief, gen);
    expect(r.ok && r.attempts).toBe(2);
    expect(gen.mock.calls[1][1]).toContain("فشلت في فحوص الجودة");
  });
  it("fails honestly after the attempts are used up", async () => {
    const gen = vi.fn().mockResolvedValue("not json");
    const r = await runRole(MARKETING_ROLE, brief, gen);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("quality_failed");
  });
  it("reports model errors without throwing", async () => {
    const r = await runRole(MARKETING_ROLE, brief, vi.fn().mockRejectedValue(new Error("x")));
    expect(r.ok === false && r.error).toBe("model_error");
  });
  it("registry only knows real roles", () => {
    expect(isRoleId("marketing")).toBe(true);
    expect(isRoleId("toString")).toBe(false);
    expect(isRoleId("ceo")).toBe(false);
  });
});
