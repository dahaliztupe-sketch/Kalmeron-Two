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
