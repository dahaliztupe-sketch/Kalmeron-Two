import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const generate = vi.fn();
const verify = vi.fn();
vi.mock("@/src/lib/gemini", () => ({ ai: { models: { generateContent: (a: unknown) => generate(a) } } }));
vi.mock("@/src/lib/firebase-admin", () => ({ adminAuth: { verifyIdToken: (t: string) => verify(t) } }));
vi.mock("@/src/lib/security/rate-limit", () => ({ rateLimit: () => ({ success: true }), rateLimitResponse: () => new Response("rl", { status: 429 }) }));
vi.mock("@/src/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
import { POST } from "@/app/api/company/role/route";

const plan = {
  idea: "x", verdict: "proceed", verdictReason: "r",
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  targetCustomer: "t", competitors: [], risks: [], nextSteps: [{ action: "a", days: 3, costEgp: null }],
};
const out = {
  positioning: "p", channels: [{ name: "n", why: "w", budgetEgp: 0, weeklyActions: ["a"], basis: "assumption" }],
  weeks: [1, 2, 3, 4].map((w) => ({ week: w, goal: "g", tasks: ["t"] })),
  messaging: { headline: "h", valueProps: ["a", "b"], objections: [] },
  metrics: [{ name: "m", target: "1", basis: "assumption" }, { name: "n", target: "2", basis: "assumption" }],
  draftPosts: [{ channel: "c", text: "t" }], totalBudgetEgp: 0, handoff: [],
};
const req = (body: unknown, auth = "Bearer t") =>
  new NextRequest("http://x/api/company/role", { method: "POST", headers: auth ? { Authorization: auth } : {}, body: JSON.stringify(body) });

describe("/api/company/role", () => {
  beforeEach(() => { generate.mockReset(); verify.mockReset(); verify.mockResolvedValue({ uid: "u" }); });
  it("requires sign-in", async () => {
    expect((await POST(req({ role: "marketing", plan }, ""))).status).toBe(401);
    expect(generate).not.toHaveBeenCalled();
  });
  it("rejects unknown roles and bad plans", async () => {
    expect((await POST(req({ role: "ceo", plan }))).status).toBe(400);
    expect((await POST(req({ role: "marketing", plan: { idea: "x" } }))).status).toBe(400);
  });
  it("returns the role output with quality unverified", async () => {
    generate.mockResolvedValueOnce({ text: JSON.stringify(out) });
    const res = await POST(req({ role: "marketing", plan, constraints: { budgetEgp: 1000 } }));
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(j.quality).toBe("unverified");
    expect(j.output.weeks).toHaveLength(4);
    expect(generate.mock.calls[0][0].config.systemInstruction).toContain("مسؤول تسويق");
  });
  it("returns 502 with issues when quality never passes", async () => {
    generate.mockResolvedValue({ text: "nope" });
    const res = await POST(req({ role: "marketing", plan }));
    expect(res.status).toBe(502);
  });
});
