import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { CompanyDashboard } from "@/components/company/CompanyDashboard";

const plan = {
  idea: "x", verdict: "proceed", verdictReason: "r",
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  targetCustomer: "t", competitors: [], risks: [], nextSteps: [{ action: "a", days: 3, costEgp: null }],
} as never;

describe("CompanyDashboard guest mode", () => {
  it("shows only the marketing role and a demo notice", () => {
    const html = renderToStaticMarkup(createElement(CompanyDashboard, { plan, getToken: async () => "", budgetEgp: null, guest: true }));
    expect(html).toContain("تجربة بدون تسجيل");
    expect((html.match(/<li /g) ?? []).length).toBe(1);
  });
  it("signed-in mode lists all six roles", () => {
    const html = renderToStaticMarkup(createElement(CompanyDashboard, { plan, getToken: async () => "t", budgetEgp: null }));
    expect((html.match(/<li /g) ?? []).length).toBe(6);
    expect(html).not.toContain("تجربة بدون تسجيل");
  });
});
