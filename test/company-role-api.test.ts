import { DEFAULT_GUEST_MODEL, DEFAULT_USER_MODEL } from "@/src/lib/company/models";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const generate = vi.fn();
const verify = vi.fn();
vi.mock("@/src/lib/gemini", () => ({ ai: { models: { generateContent: (a: unknown) => generate(a) } } }));
vi.mock("@/src/lib/firebase-admin", () => ({ adminAuth: { verifyIdToken: (t: string) => verify(t) } }));
vi.mock("@/src/lib/security/rate-limit", () => ({ rateLimit: () => ({ success: true }), rateLimitResponse: () => new Response("rl", { status: 429 }) }));
vi.mock("@/src/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
let guestAllowed = true;
vi.mock("@/src/lib/plan/guest-cap", () => ({ consumeGuestQuota: async () => guestAllowed }));
import { POST, maxDuration } from "@/app/api/company/role/route";
import { logger } from "@/src/lib/logger";

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
  it("guests cannot run roles other than marketing", async () => {
    expect((await POST(req({ role: "finance", plan }, ""))).status).toBe(401);
    expect(generate).not.toHaveBeenCalled();
  });
  it("a bad token is refused, not downgraded to guest", async () => {
    verify.mockRejectedValueOnce(new Error("bad"));
    expect((await POST(req({ role: "marketing", plan }))).status).toBe(401);
    expect(generate).not.toHaveBeenCalled();
  });
  it("guest marketing works on the flash model; context is ignored", async () => {
    guestAllowed = true;
    generate.mockResolvedValueOnce({ text: JSON.stringify(out) });
    const res = await POST(req({ role: "marketing", plan, context: { sales: { x: 1 } } }, ""));
    expect(res.status).toBe(200);
    expect(generate.mock.calls[0][0].model).toBe(DEFAULT_GUEST_MODEL);
  });
  it("guest over the daily cap gets 429 before any model call", async () => {
    guestAllowed = false;
    const res = await POST(req({ role: "marketing", plan }, ""));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe("guest_cap");
    expect(generate).not.toHaveBeenCalled();
    guestAllowed = true;
  });
  it("signed-in users use the pro model", async () => {
    generate.mockResolvedValueOnce({ text: JSON.stringify(out) });
    await POST(req({ role: "marketing", plan }));
    expect(generate.mock.calls[0][0].model).toBe(DEFAULT_USER_MODEL);
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
  it("model call failure gives 502 model_error and logs the cause without prompt or key", async () => {
    vi.mocked(logger.warn).mockClear();
    generate.mockRejectedValue(new Error("quota exceeded"));
    const res = await POST(req({ role: "marketing", plan }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("model_error");
    const logged = vi.mocked(logger.warn).mock.calls.find((c) => (c[0] as { event?: string }).event === "company_role_model_call_failed");
    expect(logged).toBeTruthy();
    expect(JSON.stringify(logged![0])).toContain("quota exceeded");
    expect(JSON.stringify(logged![0])).not.toContain(plan.idea + "\n");
  });
  it("invalid JSON body gives 400 and the route allows a 60 s run", async () => {
    const bad = new NextRequest("http://x/api/company/role", { method: "POST", headers: { Authorization: "Bearer t" }, body: "{nope" });
    expect((await POST(bad)).status).toBe(400);
    expect(maxDuration).toBe(60);
  });
});
