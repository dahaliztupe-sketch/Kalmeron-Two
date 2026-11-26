import { describe, it, expect } from "vitest";
import { ProductPlanSchema, productChecks, PRODUCT_ROLE, type ProductPlan } from "@/src/lib/company/roles/product";
import { ROLES, isRoleId } from "@/src/lib/company/roles/registry";

const brief = { constraints: { days: 56 as number | null, budgetEgp: null as number | null } };
const f = (feature: string) => ({ feature, reason: "سبب", basis: "assumption" as const });
const good: ProductPlan = {
  coreProblem: "أصحاب الصيدليات يتابعون الطلبات المتكررة يدوياً",
  learningGoal: "هل يستخدم 5 صيادلة النسخة الأولى أسبوعياً",
  mvpScope: { must: [f("تسجيل الطلبات"), f("تذكير بالطلب المتكرر")], should: [f("تقرير أسبوعي")], wont: [f("تطبيق جوال")] },
  techStack: [{ layer: "واجهة وخادم", suggestion: "Next.js", reason: "المؤسس يعرفه", basis: "assumption" }],
  buildChecklist: [
    { week: 1, tasks: ["نمذجة البيانات"], doneWhen: "نموذج جاهز" },
    { week: 2, tasks: ["شاشة الطلبات"], doneWhen: "إدخال طلب" },
  ],
  risks: [],
  handoff: [],
};
const codes = (p: ProductPlan, b = brief) => productChecks(p, b).map((i) => i.code);

describe("product role", () => {
  it("good plan parses without errors", () => {
    expect(ProductPlanSchema.safeParse(good).success).toBe(true);
    expect(productChecks(good, brief).filter((i) => i.level === "error")).toEqual([]);
  });
  it("flags overpromise", () => {
    expect(codes({ ...good, learningGoal: "نضمن نمو المستخدمين" })).toContain("overpromise");
  });
  it("flags acting outside the role", () => {
    const p = { ...good, buildChecklist: [{ week: 1, tasks: ["سأنشر التطبيق للعميل"], doneWhen: "تم" }] };
    expect(codes(p)).toContain("acts_outside_role");
  });
  it("flags scope contradiction and week order", () => {
    expect(codes({ ...good, mvpScope: { ...good.mvpScope, wont: [f("تسجيل الطلبات")] } })).toContain("scope_contradiction");
    expect(codes({ ...good, buildChecklist: [good.buildChecklist[1], good.buildChecklist[0]] })).toContain("week_order");
  });
  it("flags plan longer than the brief duration", () => {
    const p = { ...good, buildChecklist: [{ week: 9, tasks: ["x"], doneWhen: "y" }] };
    expect(codes(p, { constraints: { days: 56, budgetEgp: null } })).toContain("exceeds_duration");
  });
  it("warns on statistic and unmarked price", () => {
    expect(codes({ ...good, coreProblem: "ok", buildChecklist: [{ week: 1, tasks: ["يرفع التحويل 30%"], doneWhen: "y" }] })).toContain("unsupported_statistic");
    const p = { ...good, techStack: [{ layer: "استضافة", suggestion: "خطة 20 دولار شهر", reason: "r", basis: "assumption" as const }] };
    expect(codes(p)).toContain("price_needs_check");
  });
  it("prompt carries sources", () => {
    expect(PRODUCT_ROLE.systemPrompt).toContain("المصدر:");
  });
  it.skipIf(!isRoleId("product"))("is registered", () => {
    expect((ROLES as Record<string, unknown>).product).toBeDefined();
  });
});
