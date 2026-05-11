/**
 * Egypt Calc — API proxy from Next.js to the Python sidecar (port 8008).
 * Handles: income-tax, social-insurance, total-cost, vat, fawry-fee, instapay-fee
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EGYPT_CALC_URL = process.env.EGYPT_CALC_URL ?? "http://localhost:8008";

// S001 — SSRF mitigation: allowlist of hosts that the calc proxy may contact.
// Only loopback addresses are permitted — the sidecar runs locally.
const ALLOWED_CALC_HOSTS = new Set(["localhost", "127.0.0.1"]);

/**
 * Build and validate the target URL before fetching.
 * Throws if the resolved host is not in the allowlist, preventing SSRF
 * even if EGYPT_CALC_URL is tampered via the environment.
 */
function buildCalcUrl(endpoint: string): URL {
  const base = EGYPT_CALC_URL.endsWith("/")
    ? EGYPT_CALC_URL.slice(0, -1)
    : EGYPT_CALC_URL;
  const url = new URL(`${base}/${endpoint}`);
  if (!ALLOWED_CALC_HOSTS.has(url.hostname)) {
    throw new Error(`Disallowed host for calc proxy: ${url.hostname}`);
  }
  return url;
}

const ALLOWED_ENDPOINTS = new Set([
  "income-tax",
  "social-insurance",
  "total-cost",
  "vat",
  "vat/rates",
  "fawry-fee",
  "instapay-fee",
  "health",
]);

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  let body: { endpoint?: string; [key: string]: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { endpoint, ...params } = body;
  if (!endpoint || !ALLOWED_ENDPOINTS.has(String(endpoint))) {
    return NextResponse.json(
      { error: "endpoint غير مسموح به", allowed: [...ALLOWED_ENDPOINTS] },
      { status: 400 }
    );
  }

  try {
    const targetUrl = buildCalcUrl(endpoint);
    const res = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail ?? "خطأ في الحاسبة" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "تعذّر الاتصال بخدمة الحسابات المصرية" },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint") ?? "health";

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json({ error: "endpoint غير مسموح به" }, { status: 400 });
  }

  try {
    const targetUrl = buildCalcUrl(endpoint);
    const res = await fetch(targetUrl.toString(), { method: "GET" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json(
      { error: "تعذّر الاتصال بخدمة الحسابات المصرية" },
      { status: 503 }
    );
  }
}
