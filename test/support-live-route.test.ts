import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const verify = vi.fn();
vi.mock("@/src/lib/firebase-admin", () => ({ adminAuth: { verifyIdToken: (t: string) => verify(t) } }));
vi.mock("@/src/lib/security/rate-limit", () => ({
  rateLimit: () => ({ success: true }),
  rateLimitAgent: () => ({ allowed: true }),
  rateLimitResponse: () => new Response("rl", { status: 429 }),
}));
vi.mock("@/src/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
import { GET } from "@/app/api/support/live/route";

const req = (auth?: string) =>
  new NextRequest("http://x/api/support/live", { headers: auth ? { Authorization: auth } : {} });

describe("/api/support/live", () => {
  beforeEach(() => { verify.mockReset(); verify.mockResolvedValue({ uid: "u" }); });
  afterEach(() => { delete process.env.LIVE_SUPPORT_GATEWAY_URL; });
  it("requires a token", async () => {
    expect((await GET(req())).status).toBe(401);
  });
  it("rejects a bad token", async () => {
    verify.mockRejectedValueOnce(new Error("bad"));
    expect((await GET(req("Bearer x"))).status).toBe(401);
  });
  it("returns 503 when no gateway is configured, instead of a made-up URL", async () => {
    const res = await GET(req("Bearer x"));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("live_support_not_configured");
  });
  it("returns url, token and the live model when configured", async () => {
    process.env.LIVE_SUPPORT_GATEWAY_URL = "wss://example.invalid/live";
    const res = await GET(req("Bearer x"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe("wss://example.invalid/live");
    expect(body.model).toBe("gemini-3.1-flash-live-preview");
    expect(body.token.startsWith("u.")).toBe(true);
  });
});
