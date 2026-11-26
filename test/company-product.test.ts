import { describe, it, expect } from "vitest";
import { ProductPlanSchema, productChecks, PRODUCT_ROLE, type ProductPlan } from "@/src/lib/company/roles/product";
import { ROLES } from "@/src/lib/company/roles/registry";

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
  costTiers: [],
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
  it("requires needs_check on tool costs and warns on USD vs EGP budget", () => {
    const tier = { tool: "Supabase", tier: "Pro", monthlyUsd: 25, basis: "assumption" as const, note: "" };
    expect(codes({ ...good, costTiers: [tier] })).toContain("cost_not_needs_check");
    expect(codes({ ...good, costTiers: [{ ...tier, basis: "needs_check" }] }, { constraints: { days: 56, budgetEgp: 50000 } })).toContain("usd_vs_egp_budget");
  });
  it("prompt carries sources", () => {
    expect(PRODUCT_ROLE.systemPrompt).toContain("المصدر:");
  });
  it("is registered", () => {
    expect((ROLES as Record<string, unknown>).product).toBeDefined();
  });
});

describe("product golden cases", () => {
  it("a realistic 8-week plan passes with no errors and no warnings", () => {
    const plan: ProductPlan = {
      coreProblem: "أصحاب العيادات الصغيرة يحجزون المواعيد برسائل واتساب ويضيع بعضها",
      learningGoal: "هل تستخدم 3 عيادات صفحة الحجز كل أسبوع لمدة شهر",
      mvpScope: {
        must: [f("صفحة حجز بالعربية RTL"), f("لوحة مواعيد للعيادة"), f("تذكير بالموعد")],
        should: [f("تقرير أسبوعي")],
        wont: [f("تطبيق جوال"), f("مدفوعات إلكترونية")],
      },
      techStack: [
        { layer: "واجهة وخادم", suggestion: "Next.js مع dir=rtl على العنصر الجذر", reason: "المؤسس يعرفه", basis: "assumption" },
        { layer: "قاعدة بيانات", suggestion: "Supabase الخطة المجانية للتجربة", reason: "تكلفة صفرية في البداية", basis: "needs_check" },
      ],
      costTiers: [{ tool: "Supabase", tier: "Free", monthlyUsd: 0, basis: "needs_check", note: "تُوقف المشاريع بعد أسبوع بلا نشاط" }],
      buildChecklist: Array.from({ length: 8 }, (_, i) => ({ week: i + 1, tasks: [`مهمة الأسبوع ${i + 1}`], doneWhen: "تجربة يدوية ناجحة" })),
      risks: [{ text: "قد لا يلتزم أصحاب العيادات بأداة جديدة", basis: "assumption" }],
      handoff: [{ role: "legal", reason: "سياسة خصوصية لبيانات المرضى" }],
    };
    expect(ProductPlanSchema.safeParse(plan).success).toBe(true);
    expect(productChecks(plan, { constraints: { days: 60, budgetEgp: null } })).toEqual([]);
  });
  it("a plan that promises results, deploys for the customer and overruns gets all three errors", () => {
    const bad: ProductPlan = {
      ...good,
      learningGoal: "نضمن 100% رضا",
      buildChecklist: [{ week: 12, tasks: ["سأنشر المنتج للعميل"], doneWhen: "تم" }],
    };
    const errs = productChecks(bad, { constraints: { days: 56, budgetEgp: null } }).filter((i) => i.level === "error").map((i) => i.code);
    expect(errs.sort()).toEqual(["acts_outside_role", "exceeds_duration", "overpromise"]);
  });
});
