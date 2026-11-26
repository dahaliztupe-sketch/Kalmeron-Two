import { describe, it, expect } from "vitest";
import { OpsPlanSchema, opsChecks, OPS_ROLE, type OpsPlan } from "@/src/lib/company/roles/ops";
import { ROLES } from "@/src/lib/company/roles/registry";

const brief = { constraints: { budgetEgp: null as number | null, days: null as number | null } };
const role = { title: "مطوّر", why: "بناء المنتج", engagement: "freelancer" as const, startWeek: 2, monthlyCostEgp: 10000, basis: "assumption" as const };
const good: OpsPlan = {
  teamPlanned: { value: true, basis: "user_fact" },
  roles: [role],
  hiringSteps: [{ step: "اسأل معارفك عن مرشحين", consentBasis: "referral" }],
  onboardingChecklist: ["اتفاق مكتوب على النطاق"],
  complianceNote: "عقود العمل والتأمينات تحتاج مراجعة محامٍ أو محاسب.",
  handoff: [{ role: "legal", reason: "عقد" }],
};
const codes = (p: OpsPlan, b = brief) => opsChecks(p, b).map((i) => i.code);

describe("ops/hr role", () => {
  it("good plan parses without errors", () => {
    expect(OpsPlanSchema.safeParse(good).success).toBe(true);
    expect(opsChecks(good, brief).filter((i) => i.level === "error")).toEqual([]);
  });
  it("no team planned means no roles or hiring steps", () => {
    expect(codes({ ...good, teamPlanned: { value: false, basis: "needs_check" } })).toContain("roles_without_team");
    const empty = { ...good, teamPlanned: { value: false, basis: "needs_check" as const }, roles: [], hiringSteps: [] };
    expect(opsChecks(empty, brief).filter((i) => i.level === "error")).toEqual([]);
  });
  it("flags overpromise and acting", () => {
    expect(codes({ ...good, complianceNote: "نضمن الامتثال، راجع محامياً" })).toContain("overpromise");
    expect(codes({ ...good, hiringSteps: [{ step: "سأوظف أول مرشح", consentBasis: "they_applied" }] })).toContain("acts_outside_role");
  });
  it("warns on unclear consent and engagement", () => {
    expect(codes({ ...good, hiringSteps: [{ step: "تواصل", consentBasis: "needs_check" }] })).toContain("consent_needs_check");
    expect(codes({ ...good, roles: [{ ...role, engagement: "needs_check" }] })).toContain("engagement_needs_check");
  });
  it("warns when sensitive candidate data is requested", () => {
    expect(codes({ ...good, hiringSteps: [{ step: "اطلب صحيفة الحالة الجنائية من المرشح", consentBasis: "they_applied" }] })).toContain("sensitive_data_needs_check");
  });
  it("warns when an employee role has no insurance note", () => {
    expect(codes({ ...good, roles: [{ ...role, engagement: "employee" }], complianceNote: "راجع محامياً" })).toContain("insurance_not_mentioned");
    expect(codes({ ...good, roles: [{ ...role, engagement: "employee" }], complianceNote: "التأمين الاجتماعي يضاف للتكلفة، راجع محاسباً" })).not.toContain("insurance_not_mentioned");
  });
  it("flags budget overrun and start after duration", () => {
    expect(codes(good, { constraints: { budgetEgp: 5000, days: 60 } })).toContain("budget_exceeded");
    expect(codes({ ...good, roles: [{ ...role, startWeek: 20 }] }, { constraints: { budgetEgp: null, days: 30 } })).toContain("start_after_duration");
  });
  it("prompt carries sources", () => {
    expect(OPS_ROLE.systemPrompt).toContain("المصدر:");
  });
  it("is registered", () => {
    expect((ROLES as Record<string, unknown>).ops).toBeDefined();
  });
});

describe("ops golden cases", () => {
  it("solo founder: empty plan passes, any hire is an error", () => {
    const solo: OpsPlan = { teamPlanned: { value: false, basis: "user_fact" }, roles: [], hiringSteps: [], onboardingChecklist: [], complianceNote: "لا فريق مخطط. راجع محاسباً عند أول توظيف.", handoff: [] };
    expect(OpsPlanSchema.safeParse(solo).success).toBe(true);
    expect(opsChecks(solo, brief)).toEqual([]);
    expect(codes({ ...solo, roles: [role] })).toContain("roles_without_team");
  });
  it("small planned team within budget passes cleanly", () => {
    const team: OpsPlan = {
      ...good,
      roles: [{ ...role, engagement: "employee", monthlyCostEgp: 8000, startWeek: 3 }],
      complianceNote: "التأمينات الاجتماعية تضاف للتكلفة. راجع محامياً أو محاسباً قبل التعاقد.",
    };
    expect(opsChecks(team, { constraints: { budgetEgp: 40000, days: 90 } })).toEqual([]);
  });
  it("a bad plan triggers acting, overpromise and budget errors together", () => {
    const bad: OpsPlan = {
      ...good,
      roles: [{ ...role, monthlyCostEgp: 50000, startWeek: 1 }],
      hiringSteps: [{ step: "سأوظف أول مرشح", consentBasis: "they_applied" }],
      complianceNote: "نضمن الامتثال، راجع محامياً",
    };
    const errs = opsChecks(bad, { constraints: { budgetEgp: 20000, days: 60 } }).filter((i) => i.level === "error").map((i) => i.code).sort();
    expect(errs).toEqual(["acts_outside_role", "budget_exceeded", "overpromise"]);
  });
});
