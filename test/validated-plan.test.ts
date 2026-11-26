import { describe, it, expect } from "vitest";
import { parseValidatedPlan, planToMarkdown, extractJson } from "@/src/lib/plan/validated-plan";

const good = {
  idea: "تطبيق لتوصيل الأدوية",
  verdict: "refine",
  verdictReason: "السوق موجود لكن التنظيم صعب.",
  swot: {
    strengths: [{ text: "حاجة حقيقية" }],
    weaknesses: [{ text: "تراخيص", basis: "needs_check" }],
    opportunities: [],
    threats: [{ text: "منافسون كبار" }],
  },
  targetCustomer: "كبار السن في القاهرة",
  competitors: [{ name: "وجهة", note: "تطبيق قائم" }],
  risks: [],
  nextSteps: [{ action: "قابل 10 صيادلة", days: 7, costEgp: 0 }],
};

describe("validated plan", () => {
  it("parses plain JSON and applies default basis", () => {
    const r = parseValidatedPlan(JSON.stringify(good));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.plan.swot.strengths[0].basis).toBe("assumption");
  });
  it("parses JSON inside code fences with surrounding prose", () => {
    const r = parseValidatedPlan("هذه النتيجة:\n```json\n" + JSON.stringify(good) + "\n```\nانتهى");
    expect(r.ok).toBe(true);
  });
  it("rejects missing fields instead of guessing", () => {
    const { nextSteps, ...bad } = good;
    void nextSteps;
    expect(parseValidatedPlan(JSON.stringify(bad)).ok).toBe(false);
  });
  it("rejects invalid verdict and empty next steps", () => {
    expect(parseValidatedPlan(JSON.stringify({ ...good, verdict: "great" })).ok).toBe(false);
    expect(parseValidatedPlan(JSON.stringify({ ...good, nextSteps: [] })).ok).toBe(false);
  });
  it("rejects text with no JSON", () => {
    expect(parseValidatedPlan("لا يوجد").ok).toBe(false);
    expect(() => extractJson("abc")).toThrow();
  });
  it("renders markdown with verdict, basis labels and disclaimer", () => {
    const r = parseValidatedPlan(JSON.stringify(good));
    if (!r.ok) throw new Error("parse failed");
    const md = planToMarkdown(r.plan);
    expect(md).toContain("## الحكم: تحسين قبل البدء");
    expect(md).toContain("يحتاج تحقق");
    expect(md).toContain("ليست دراسة سوق موثّقة");
  });
});
