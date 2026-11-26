import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const generate = vi.fn();
vi.mock("@/src/lib/gemini", () => ({ ai: { models: { generateContent: (a: unknown) => generate(a) } } }));
vi.mock("@/src/lib/firebase-admin", () => ({ adminAuth: { verifyIdToken: vi.fn() } }));
vi.mock("@/src/lib/security/rate-limit", () => ({
  rateLimit: () => ({ success: true }),
  rateLimitResponse: () => new Response("rl", { status: 429 }),
}));
vi.mock("@/src/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { POST } from "@/app/api/ideas/analyze/route";

const plan = {
  idea: "x", verdict: "stop", verdictReason: "r",
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  targetCustomer: "t", competitors: [], risks: [],
  nextSteps: [{ action: "a", days: 3, costEgp: null }],
};
const req = (body: object) =>
  new NextRequest("http://localhost/api/ideas/analyze", { method: "POST", body: JSON.stringify(body) });

describe("/api/ideas/analyze format=plan", () => {
  beforeEach(() => generate.mockReset());

  it("returns structured plan plus markdown when the model returns valid JSON", async () => {
    generate.mockResolvedValueOnce({ text: JSON.stringify(plan) });
    const res = await POST(req({ ideaDesc: "فكرة", format: "plan" }));
    const j = await res.json();
    expect(j.plan.verdict).toBe("stop");
    expect(j.result).toContain("## الحكم: إيقاف");
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("falls back to markdown analysis when JSON is invalid", async () => {
    generate.mockResolvedValueOnce({ text: "not json" }).mockResolvedValueOnce({ text: "تحليل نصي" });
    const j = await (await POST(req({ ideaDesc: "فكرة", format: "plan" }))).json();
    expect(j.plan).toBeUndefined();
    expect(j.result).toBe("تحليل نصي");
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("falls back when the plan model call throws", async () => {
    generate.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce({ text: "نص" });
    const j = await (await POST(req({ ideaDesc: "فكرة", format: "plan" }))).json();
    expect(j.result).toBe("نص");
  });

  it("keeps the old behaviour without format and still validates input", async () => {
    generate.mockResolvedValueOnce({ text: "قديم" });
    expect((await (await POST(req({ ideaDesc: "فكرة" }))).json()).result).toBe("قديم");
    expect((await POST(req({ ideaDesc: "  " }))).status).toBe(400);
  });
});
