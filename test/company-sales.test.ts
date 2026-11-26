import { describe, it, expect } from "vitest";
import { SalesPlanSchema, salesChecks, type SalesPlan } from "@/src/lib/company/roles/sales";
import { ROLES, isRoleId } from "@/src/lib/company/roles/registry";

const good: SalesPlan = {
  idealCustomer: "صاحب صيدلية صغيرة في القاهرة",
  prospectGroups: [{ name: "صيادلة أعرفهم", howToReach: "زيارة شخصية", consentBasis: "existing_relationship", basis: "assumption" }],
  discoveryQuestions: ["احكِ لي عن آخر مرة نفد فيها دواء مزمن عند عميل. ماذا فعلت؟", "كيف تتابع طلبات التوصيل الآن؟", "كم مرة حدث ذلك الشهر الماضي؟", "من يتخذ قرار الشراء عندكم؟", "ما آخر أداة دفعت ثمنها لحل مشكلة مشابهة؟"],
  outreachDrafts: [{ group: "صيادلة أعرفهم", text: "أهلاً دكتور، أعمل على حل لمتابعة الطلبات المتكررة. هل يناسبك حديث 15 دقيقة عن طريقتكم الحالية؟" }],
  stages: [{ name: "اكتشاف", exitCriteria: "ذكر مشكلة فعلية" }, { name: "عرض", exitCriteria: "طلب تجربة" }, { name: "إغلاق", exitCriteria: "دفع أو رفض مع سبب" }],
  followUp: ["متابعة بعد 3 أيام برسالة قصيرة"],
  objections: [],
  metrics: [{ name: "مقابلات منجزة", target: "10", basis: "assumption" }, { name: "عملاء مدفوعون", target: "3", basis: "assumption" }],
  handoff: [],
};

describe("sales role", () => {
  it("good plan parses and has no errors", () => {
    expect(SalesPlanSchema.safeParse(good).success).toBe(true);
    expect(salesChecks(good).filter((i) => i.level === "error")).toEqual([]);
  });
  it("rejects hypothetical discovery questions", () => {
    const bad = { ...good, discoveryQuestions: ["هل ستستخدم تطبيقاً مثل هذا؟", ...good.discoveryQuestions.slice(1)] };
    expect(salesChecks(bad).map((i) => i.code)).toContain("hypothetical_question");
  });
  it("warns when consent basis is unclear", () => {
    const w = { ...good, prospectGroups: [{ ...good.prospectGroups[0], consentBasis: "needs_check" as const }] };
    expect(salesChecks(w).map((i) => i.code)).toContain("consent_needs_check");
  });
  it("flags overpromise", () => {
    const o = { ...good, followUp: ["نضمن لك زيادة المبيعات"] };
    expect(salesChecks(o).map((i) => i.code)).toContain("overpromise");
  });
  it("is registered and carries sourced knowledge", () => {
    expect(isRoleId("sales")).toBe(true);
    expect(ROLES.sales.systemPrompt).toContain("المصدر:");
  });
});
