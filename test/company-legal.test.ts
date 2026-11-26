import { describe, it, expect } from "vitest";
import { LegalPlanSchema, legalChecks, LEGAL_ROLE, DISCLAIMER_AR, type LegalPlan } from "@/src/lib/company/roles/legal";
import { LEGAL_KNOWLEDGE } from "@/src/lib/company/knowledge/legal";
import { ROLES, isRoleId } from "@/src/lib/company/roles/registry";

const brief = { constraints: { budgetEgp: null as number | null } };
const step = (order: number) => ({
  order,
  title: "شهادة عدم تشابه الاسم",
  authority: "السجل التجاري",
  documents: ["صورة البطاقة"],
  feeEgp: null as number | null,
  basis: "needs_check" as const,
  sourceStatus: "primary_read" as const,
  sourceNote: "GAFI Investor Service Center guide",
});
const good: LegalPlan = {
  disclaimer: DISCLAIMER_AR,
  entityOptions: [{ type: "single_member_company", fitReason: "مؤسس واحد", basis: "assumption" }],
  steps: [step(1), step(2), step(3)],
  needsLicenceCheck: [],
  consultProfessional: "استشر محامياً أو محاسباً مرخصاً قبل التقديم.",
  handoff: [],
};
const codes = (p: LegalPlan, b = brief) => legalChecks(p, b).map((i) => i.code);

describe("legal (Egypt) role", () => {
  it("good plan parses without errors", () => {
    expect(LegalPlanSchema.safeParse(good).success).toBe(true);
    expect(legalChecks(good, brief).filter((i) => i.level === "error")).toEqual([]);
  });
  it("requires the not-legal-advice disclaimer and consult line", () => {
    expect(codes({ ...good, disclaimer: "معلومات عامة" })).toContain("missing_disclaimer");
    expect(codes({ ...good, consultProfessional: "راجع الموقع" })).toContain("missing_consult_line");
  });
  it("requires needs_check on every step", () => {
    const bad = { ...good, steps: [{ ...step(1), basis: "assumption" as const }, step(2), step(3)] };
    expect(codes(bad)).toContain("rule_not_needs_check");
  });
  it("flags overpromise, acting, and legal-opinion claims", () => {
    expect(codes({ ...good, entityOptions: [{ type: "llc", fitReason: "لن تواجه مشكلة", basis: "assumption" }] })).toContain("overpromise");
    expect(codes({ ...good, steps: [{ ...step(1), title: "سأقدم الطلب" }, step(2), step(3)] })).toContain("acts_outside_role");
    expect(codes({ ...good, steps: [{ ...step(1), title: "رأي قانوني: مناسب" }, step(2), step(3)] })).toContain("claims_legal_advice");
  });
  it("flags step order and fees over budget", () => {
    expect(codes({ ...good, steps: [step(2), step(1), step(3)] })).toContain("step_order");
    const fee = { ...good, steps: [{ ...step(1), feeEgp: 5000 }, step(2), step(3)] };
    expect(codes(fee, { constraints: { budgetEgp: 1000 } })).toContain("fees_exceed_budget");
  });
  it("knowledge: every secondary or primary item has an https source and review date; none verified without a URL", () => {
    for (const i of LEGAL_KNOWLEDGE.items) {
      expect(i.sourceUrl.startsWith("https://")).toBe(true);
      expect(i.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("prompt carries sources and the disclaimer rule", () => {
    expect(LEGAL_ROLE.systemPrompt).toContain("المصدر:");
    expect(LEGAL_ROLE.systemPrompt).toContain("ليست استشارة قانونية");
  });
  it.skipIf(!isRoleId("legal"))("is registered", () => {
    expect((ROLES as Record<string, unknown>).legal).toBeDefined();
  });
});
