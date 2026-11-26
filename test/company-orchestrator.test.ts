import { describe, it, expect } from "vitest";
import { initState, nextPending, orderedRoles, reduce, summary } from "@/src/lib/company/orchestrator";
import { ROLES } from "@/src/lib/company/roles/registry";

describe("orchestrator", () => {
  it("orders registered roles by roadmap, unknown last", () => {
    expect(orderedRoles(["ops", "zzz", "marketing", "finance"])).toEqual(["marketing", "finance", "ops", "zzz"]);
  });
  it("every registered role has a place in the roadmap order", () => {
    const o = orderedRoles(Object.keys(ROLES));
    expect(o.length).toBe(Object.keys(ROLES).length);
    expect(o[0]).toBe("marketing");
  });
  it("runs through states and picks the next pending", () => {
    const order = ["marketing", "sales"];
    let s = initState(order);
    expect(nextPending(s, order)).toBe("marketing");
    s = reduce(s, { type: "start", role: "marketing" });
    s = reduce(s, { type: "done", role: "marketing", output: { a: 1 }, warnings: ["w"] });
    expect(nextPending(s, order)).toBe("sales");
    s = reduce(s, { type: "fail", role: "sales", error: "x" });
    expect(nextPending(s, order)).toBe("sales");
    expect(summary(s, order)).toMatchObject({ done: 1, failed: 1 });
  });
  it("approve only applies to a finished role and can be undone", () => {
    let s = initState(["marketing"]);
    s = reduce(s, { type: "approve", role: "marketing" });
    expect(s.marketing.status).toBe("idle");
    s = reduce(s, { type: "done", role: "marketing", output: {}, warnings: [] });
    s = reduce(s, { type: "approve", role: "marketing" });
    expect(s.marketing.status).toBe("approved");
    s = reduce(s, { type: "unapprove", role: "marketing" });
    expect(s.marketing.status).toBe("done");
  });
  it("regenerate resets output and warnings", () => {
    let s = initState(["marketing"]);
    s = reduce(s, { type: "done", role: "marketing", output: { a: 1 }, warnings: ["w"] });
    s = reduce(s, { type: "start", role: "marketing" });
    expect(s.marketing.output).toBeUndefined();
    expect(s.marketing.warnings).toEqual([]);
  });
});

import { buildContextBlock, DEPENDS_ON } from "@/src/lib/company/context";
import { SalesPlanSchema } from "@/src/lib/company/roles/sales";

const goodSales = {
  idealCustomer: "صاحب صيدلية",
  prospectGroups: [{ name: "أ", howToReach: "ب", consentBasis: "referral", basis: "assumption" }],
  discoveryQuestions: ["a1", "a2", "a3", "a4", "a5"],
  outreachDrafts: [{ group: "أ", text: "مرحباً" }],
  stages: [{ name: "1", exitCriteria: "x" }, { name: "2", exitCriteria: "x" }, { name: "3", exitCriteria: "x" }],
  followUp: ["f"],
  objections: [],
  metrics: [{ name: "m", target: "1", basis: "assumption" }, { name: "n", target: "2", basis: "assumption" }],
  handoff: [],
};

describe("role-to-role context", () => {
  it("every dependency is a registered role and goes earlier in the roadmap", () => {
    const order = orderedRoles(Object.keys(ROLES));
    for (const [role, deps] of Object.entries(DEPENDS_ON)) {
      for (const d of deps) expect(order.indexOf(d)).toBeLessThan(order.indexOf(role));
    }
  });
  it("passes only schema-valid prior outputs and labels them as data", () => {
    expect(SalesPlanSchema.safeParse(goodSales).success).toBe(true);
    const ok = buildContextBlock("product", { sales: goodSales });
    expect(ok.used).toEqual(["sales"]);
    expect(ok.block).toContain("بيانات");
  });
  it("drops invalid, unrelated or missing prior outputs", () => {
    expect(buildContextBlock("product", { sales: { junk: 1 } }).used).toEqual([]);
    expect(buildContextBlock("product", { marketing: goodSales }).used).toEqual([]);
    expect(buildContextBlock("product", undefined).block).toBe("");
    expect(buildContextBlock("marketing", { sales: goodSales }).used).toEqual([]);
  });
  it("caps each prior output length", () => {
    const long = { ...goodSales, idealCustomer: "ك".repeat(390), followUp: ["ف".repeat(190), "ف".repeat(190), "ف".repeat(190), "ف".repeat(190), "ف".repeat(190)] };
    expect(buildContextBlock("product", { sales: long }).block.length).toBeLessThan(2900);
  });
});

import { downstreamOf } from "@/src/lib/company/orchestrator";

describe("stale downstream", () => {
  it("computes transitive dependents", () => {
    expect(downstreamOf("marketing").sort()).toEqual(["finance", "legal", "ops", "product", "sales"]);
    expect(downstreamOf("ops")).toEqual([]);
  });
  it("regenerating a role marks finished downstream roles stale, not idle ones", () => {
    const order = ["marketing", "sales", "finance"];
    let s = initState(order);
    s = reduce(s, { type: "done", role: "marketing", output: { a: 1 }, warnings: [] });
    s = reduce(s, { type: "done", role: "sales", output: { b: 1 }, warnings: [] });
    s = reduce(s, { type: "start", role: "marketing" });
    expect(s.sales.stale).toBe(true);
    expect(s.finance.stale).toBeUndefined();
    s = reduce(s, { type: "start", role: "sales" });
    expect(s.sales.stale).toBeUndefined();
  });
});
