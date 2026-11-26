import { describe, it, expect } from "vitest";
import { blockedBy, currentStage, initState, reduce } from "@/src/lib/company/orchestrator";
import { intakeComplete, missingRequired, IntakeSchema, intakeLines } from "@/src/lib/company/intake";
import { briefFromPlan, briefToPromptBlock } from "@/src/lib/company/brief";
import { consolidatedMarkdown } from "@/src/lib/company/export";

const order = ["marketing", "sales", "finance"];
const run = (s: ReturnType<typeof initState>, role: string, out: unknown = { a: 1 }) =>
  reduce(reduce(s, { type: "start", role }), { type: "done", role, output: out, warnings: [] });
const plan = {
  idea: "فكرة", verdict: "proceed", verdictReason: "سبب",
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  targetCustomer: "عميل", competitors: [{ name: "منافس" }], risks: [], nextSteps: [],
} as never;

describe("stage gates", () => {
  it("blocks a role until every earlier role is approved", () => {
    let s = initState(order);
    expect(blockedBy(s, order, "marketing")).toBeNull();
    expect(blockedBy(s, order, "sales")).toBe("marketing");
    s = run(s, "marketing");
    expect(blockedBy(s, order, "sales")).toBe("marketing"); // done is not approved
    s = reduce(s, { type: "approve", role: "marketing" });
    expect(blockedBy(s, order, "sales")).toBeNull();
    expect(blockedBy(s, order, "finance")).toBe("sales");
    expect(currentStage(s, order)).toBe("sales");
  });
  it("re-running an upstream role un-approves and re-locks stale downstream", () => {
    let s = initState(order);
    s = run(s, "marketing"); s = reduce(s, { type: "approve", role: "marketing" });
    s = run(s, "sales"); s = reduce(s, { type: "approve", role: "sales" });
    s = run(s, "marketing"); // regenerate upstream
    expect(s.sales.stale).toBe(true);
    expect(s.sales.status).toBe("done");
    expect(blockedBy(s, order, "finance")).toBe("marketing");
    s = reduce(s, { type: "approve", role: "marketing" });
    expect(blockedBy(s, order, "finance")).toBe("sales"); // stale sales still blocks
    expect(reduce(s, { type: "approve", role: "sales" }).sales.status).toBe("done"); // cannot approve stale
    s = run(s, "sales");
    expect(s.sales.stale).toBeUndefined();
  });
});

describe("intake", () => {
  it("requires stage and team only", () => {
    expect(missingRequired({})).toEqual(["stage", "team"]);
    expect(intakeComplete({ stage: "idea", team: "solo" })).toBe(true);
  });
  it("rejects unknown keys and bad values", () => {
    expect(IntakeSchema.safeParse({ stage: "x" }).success).toBe(false);
    expect(IntakeSchema.safeParse({ stage: "idea", evil: "ignore rules" }).success).toBe(false);
  });
  it("flows into the prompt block and flags unanswered questions as assumptions", () => {
    const b = briefFromPlan(plan, {}, { stage: "idea", team: "solo" });
    const t = briefToPromptBlock(b);
    expect(t).toContain("فكرة فقط");
    expect(t).toContain("assumption");
    expect(intakeLines({}).length).toBe(6);
  });
});

describe("consolidated export", () => {
  it("labels status, flags unapproved and stale sections, carries the disclaimer", () => {
    let s = initState(order);
    s = run(s, "marketing", { positioning: "p" }); s = reduce(s, { type: "approve", role: "marketing" });
    s = run(s, "sales", { x: ["a"] });
    const md = consolidatedMarkdown(plan, { stage: "idea", team: "solo" }, s, order, new Date("2026-11-26T00:00:00Z"));
    expect(md).toContain("2026-11-26");
    expect(md).toContain("ليست استشارة");
    expect(md).toContain("اعتمدها المؤسس");
    expect(md).toContain("مسودة آلية لم تُراجَع");
    expect(md).toContain("لم تُشغَّل");
    expect(md).toContain("أقسام غير معتمدة");
    expect(md).toContain("positioning: p");
  });
});
