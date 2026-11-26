import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";

const docs = new Map<string, unknown>();
const verify = vi.fn();
vi.mock("@/src/lib/firebase-admin", () => ({
  adminAuth: { verifyIdToken: (t: string) => verify(t) },
  adminDb: {
    collection: () => ({
      doc: (id: string) => ({
        set: async (v: unknown) => void docs.set(id, v),
        get: async () => ({ exists: docs.has(id), data: () => docs.get(id) }),
        delete: async () => void docs.delete(id),
      }),
    }),
  },
}));
vi.mock("@/src/lib/security/rate-limit", () => ({ rateLimit: () => ({ success: true }), rateLimitResponse: () => new Response("rl", { status: 429 }) }));
import { GET, PUT, DELETE } from "@/app/api/company/workspace/route";
import { sanitizeWorkspace } from "@/src/lib/company/workspace-store";

const plan = {
  idea: "x", verdict: "proceed", verdictReason: "r",
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  targetCustomer: "t", competitors: [], risks: [], nextSteps: [{ action: "a", days: 3, costEgp: null }],
};
const mk = (state: unknown) => ({ plan, intake: { stage: "idea", team: "solo" }, state });
const req = (method: string, body?: unknown, auth = "Bearer t") =>
  new NextRequest("http://x/api/company/workspace", { method, headers: auth ? { Authorization: auth } : {}, body: body === undefined ? undefined : JSON.stringify(body) });

describe("workspace sanitize", () => {
  it("drops unknown roles, resets roles whose output fails their schema, never stores running", () => {
    const ws = sanitizeWorkspace(mk({
      marketing: { status: "approved", output: { nope: 1 }, warnings: [] },
      ceo: { status: "idle", warnings: [] },
      sales: { status: "idle", warnings: [] },
    }));
    expect(ws).not.toBeNull();
    expect(Object.keys(ws!.state).sort()).toEqual(["marketing", "sales"]);
    expect(ws!.state.marketing.status).toBe("idle");
    expect(ws!.state.marketing.output).toBeUndefined();
    expect(sanitizeWorkspace(mk({ sales: { status: "running", warnings: [] } }))).toBeNull();
  });
  it("rejects unknown intake keys", () => {
    expect(sanitizeWorkspace({ ...mk({}), intake: { x: 1 } })).toBeNull();
  });
});

describe("/api/company/workspace", () => {
  beforeEach(() => { docs.clear(); verify.mockReset(); verify.mockResolvedValue({ uid: "alice" }); });
  it("requires a valid token for every method", async () => {
    for (const m of ["GET", "PUT", "DELETE"]) expect((await (({ GET, PUT, DELETE } as never)[m] as (r: NextRequest) => Promise<Response>)(req(m, m === "PUT" ? mk({}) : undefined, ""))).status).toBe(401);
    verify.mockRejectedValue(new Error("bad"));
    expect((await GET(req("GET"))).status).toBe(401);
  });
  it("saves under the token uid only and round-trips", async () => {
    expect((await PUT(req("PUT", { ...mk({}), userId: "bob" }))).status).toBe(200);
    expect([...docs.keys()]).toEqual(["alice"]);
    const j = await (await GET(req("GET"))).json();
    expect(j.workspace.plan.idea).toBe("x");
    verify.mockResolvedValue({ uid: "bob" });
    expect((await (await GET(req("GET"))).json()).workspace).toBeNull();
  });
  it("rejects invalid bodies and deletes", async () => {
    expect((await PUT(req("PUT", { plan: {} }))).status).toBe(400);
    await PUT(req("PUT", mk({})));
    expect((await DELETE(req("DELETE"))).status).toBe(200);
    expect(docs.size).toBe(0);
  });
});

describe("firestore.rules", () => {
  it("explicitly denies client access to the server-only collections", () => {
    const r = readFileSync("firestore.rules", "utf8");
    expect(r).toMatch(/match \/company_workspaces\/\{doc\}\s*\{ allow read, write: if false; \}/);
    expect(r).toMatch(/match \/validated_plans\/\{doc\}\s*\{ allow read, write: if false; \}/);
  });
});
