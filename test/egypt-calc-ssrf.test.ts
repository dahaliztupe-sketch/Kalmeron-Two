import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
vi.mock("@/src/lib/security/rate-limit", () => ({ rateLimit: () => ({ success: true }), rateLimitResponse: () => new Response("rl", { status: 429 }) }));
import { POST, GET } from "@/app/api/egypt-calc/route";

const fetchMock = vi.fn();
beforeEach(() => { fetchMock.mockReset(); fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: 1 }), { status: 200 })); vi.stubGlobal("fetch", fetchMock); });
const post = (b: unknown) => new NextRequest("http://x/api/egypt-calc", { method: "POST", body: JSON.stringify(b) });

describe("egypt-calc proxy", () => {
  it("only fetches loopback URLs built from the fixed table", async () => {
    const r = await POST(post({ endpoint: "vat", amount: 1 }));
    expect(r.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8008/vat");
  });
  it.each(["../admin", "http://evil.test/x", "vat/../../x", "__proto__", "constructor", "@evil.test"])("rejects %s without fetching", async (e) => {
    const r = await POST(post({ endpoint: e }));
    expect(r.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("GET rejects unknown endpoints", async () => {
    const r = await GET(new NextRequest("http://x/api/egypt-calc?endpoint=http://evil.test"));
    expect(r.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
