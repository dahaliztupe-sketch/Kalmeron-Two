/**
 * Egypt Calc — API proxy from Next.js to the Python sidecar (port 8008).
 * Handles: income-tax, social-insurance, total-cost, vat, fawry-fee, instapay-fee
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EGYPT_CALC_URL = process.env.EGYPT_CALC_URL ?? "http://localhost:8008";

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
    const res = await fetch(`${EGYPT_CALC_URL}/${endpoint}`, {
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
    const res = await fetch(`${EGYPT_CALC_URL}/${endpoint}`, {
      method: "GET",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json(
      { error: "تعذّر الاتصال بخدمة الحسابات المصرية" },
      { status: 503 }
    );
  }
}
