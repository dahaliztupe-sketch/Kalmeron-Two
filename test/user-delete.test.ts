import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const deleted: string[] = [];
const queried: Array<[string, string, unknown]> = [];
const verify = vi.fn();
let remaining: Record<string, number> = {};
vi.mock("@/src/lib/firebase-admin", () => ({
  adminAuth: { verifyIdToken: (t: string) => verify(t) },
  adminDb: {
    collection: (c: string) => ({
      doc: (id: string) => ({ delete: async () => void deleted.push(`${c}/${id}`), path: `${c}/${id}` }),
      where: (f: string, _o: string, v: unknown) => ({
        limit: (n: number) => ({
          get: async () => {
            queried.push([c, f, v]);
            const k = Math.min(remaining[c] ?? 0, n);
            remaining[c] = (remaining[c] ?? 0) - k;
            const docs = Array.from({ length: k }, (_, i) => ({ ref: { delete: async () => void deleted.push(`${c}/q${i}`) } }));
            return { empty: k === 0, size: k, docs };
          },
        }),
      }),
    }),
    recursiveDelete: async (ref: { path: string }) => void deleted.push(`recursive:${ref.path}`),
  },
}));
vi.mock("@/src/lib/security/rate-limit", () => ({ rateLimit: () => ({ success: true }), rateLimitResponse: () => new Response("rl", { status: 429 }) }));
vi.mock("@/src/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { POST } from "@/app/api/user/delete/route";

const req = (auth = "Bearer t") => new NextRequest("http://x/api/user/delete", { method: "POST", headers: auth ? { Authorization: auth } : {} });

describe("/api/user/delete", () => {
  beforeEach(() => { deleted.length = 0; queried.length = 0; remaining = {}; verify.mockReset(); verify.mockResolvedValue({ uid: "alice" }); });
  it("requires a valid token and touches nothing otherwise", async () => {
    expect((await POST(req(""))).status).toBe(401);
    verify.mockRejectedValue(new Error("x"));
    expect((await POST(req())).status).toBe(401);
    expect(deleted).toEqual([]);
  });
  it("deletes only the token uid's data, including workspace, plans and the users tree", async () => {
    remaining = { validated_plans: 2 };
    const j = await (await POST(req())).json();
    expect(j.success).toBe(true);
    expect(j.complete).toBe(true);
    expect(deleted).toContain("company_workspaces/alice");
    expect(deleted).toContain("runway_snapshots/alice");
    expect(deleted).toContain("recursive:users/alice");
    expect(deleted.filter((d) => d.startsWith("validated_plans/")).length).toBe(2);
    expect(queried.every(([, f, v]) => f === "userId" && v === "alice")).toBe(true);
  });
  it("reports incomplete when a collection exceeds the page limit", async () => {
    remaining = { ideas: 400 * 10 + 5 };
    const j = await (await POST(req())).json();
    expect(j.complete).toBe(false);
  });
});
