import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const store = new Map<string, any>();
const verify = vi.fn();
vi.mock("@/src/lib/firebase-admin", () => {
  const col = () => ({
    where: () => ({ count: () => ({ get: async () => ({ data: () => ({ count: [...store.values()].filter((v) => v.userId === "u1").length }) }) }) }),
    add: async (d: any) => void store.set(`fb_${store.size}`, d),
    doc: (id: string) => ({
      delete: async () => void store.delete(id),
      set: async (d: any) => void store.set(id, d),
      get: async () => ({ exists: store.has(id), data: () => store.get(id) }),
    }),
  });
  return { adminAuth: { verifyIdToken: (t: string) => verify(t) }, adminDb: { collection: col } };
});
vi.mock("@/src/lib/security/rate-limit", () => ({
  rateLimit: () => ({ success: true }),
  rateLimitResponse: () => new Response("rl", { status: 429 }),
}));

import { POST } from "@/app/api/plans/route";
import { GET, DELETE } from "@/app/api/plans/[id]/route";
import { POST as FEEDBACK } from "@/app/api/plans/feedback/route";
import { isValidPlanId, newPlanId, MAX_PLANS_PER_USER } from "@/src/lib/plan/store";

const plan = {
  idea: "x", verdict: "proceed", verdictReason: "r",
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  targetCustomer: "t", competitors: [], risks: [],
  nextSteps: [{ action: "a", days: 3, costEgp: null }],
};
const post = (body: unknown, auth = "Bearer tok") =>
  new NextRequest("http://x/api/plans", { method: "POST", headers: auth ? { Authorization: auth } : {}, body: JSON.stringify(body) });

describe("plans api", () => {
  beforeEach(() => { store.clear(); verify.mockReset(); });

  it("requires auth", async () => {
    expect((await POST(post({ plan }, ""))).status).toBe(401);
    verify.mockRejectedValueOnce(new Error("bad"));
    expect((await POST(post({ plan }))).status).toBe(401);
  });

  it("rejects invalid plan", async () => {
    verify.mockResolvedValue({ uid: "u1" });
    expect((await POST(post({ plan: { idea: "x" } }))).status).toBe(400);
  });

  it("saves, returns share url, and public GET omits owner", async () => {
    verify.mockResolvedValue({ uid: "u1" });
    const res = await POST(post({ plan }));
    expect(res.status).toBe(201);
    const { id, url } = await res.json();
    expect(isValidPlanId(id)).toBe(true);
    expect(url.endsWith(`/p/${id}`)).toBe(true);
    const got = await GET(new NextRequest(`http://x/api/plans/${id}`), { params: Promise.resolve({ id }) });
    const j = await got.json();
    expect(j.plan.verdict).toBe("proceed");
    expect(JSON.stringify(j)).not.toContain("u1");
  });

  it("returns 404 for unknown or malformed ids", async () => {
    const id = newPlanId();
    expect((await GET(new NextRequest("http://x"), { params: Promise.resolve({ id }) })).status).toBe(404);
    expect((await GET(new NextRequest("http://x"), { params: Promise.resolve({ id: "../etc" }) })).status).toBe(404);
  });

  it("enforces the per-user limit", async () => {
    verify.mockResolvedValue({ uid: "u1" });
    for (let i = 0; i < MAX_PLANS_PER_USER; i++) store.set(`k${i}`, { userId: "u1" });
    expect((await POST(post({ plan }))).status).toBe(409);
  });

  it("lets only the owner delete (revoke) a plan; others get 404", async () => {
    verify.mockResolvedValue({ uid: "u1" });
    const { id } = await (await POST(post({ plan }))).json();
    const del = (auth?: string) =>
      DELETE(new NextRequest(`http://x/api/plans/${id}`, { method: "DELETE", headers: auth ? { Authorization: auth } : {} }), { params: Promise.resolve({ id }) });
    expect((await del()).status).toBe(401);
    verify.mockResolvedValueOnce({ uid: "intruder" });
    expect((await del("Bearer t")).status).toBe(404);
    expect(store.has(id)).toBe(true);
    verify.mockResolvedValueOnce({ uid: "u1" });
    expect((await del("Bearer t")).status).toBe(200);
    expect(store.has(id)).toBe(false);
    const after = await GET(new NextRequest("http://x"), { params: Promise.resolve({ id }) });
    expect(after.status).toBe(404);
  });

  it("accepts valid feedback (guest ok) and rejects bad input", async () => {
    const fb = (b: unknown) => FEEDBACK(new NextRequest("http://x/api/plans/feedback", { method: "POST", body: JSON.stringify(b) }));
    expect((await fb({ rating: "up", verdict: "refine" })).status).toBe(201);
    expect((await fb({ rating: "meh" })).status).toBe(400);
    expect((await fb({ rating: "down", comment: "x".repeat(501) })).status).toBe(400);
  });
});
