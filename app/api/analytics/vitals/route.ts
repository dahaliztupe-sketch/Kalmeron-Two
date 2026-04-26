import { NextRequest, NextResponse } from "next/server";
import { sanitizeLogValue } from "@/src/lib/security/sanitize-log";
import { rateLimit } from "@/src/lib/security/rate-limit";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Per-IP rate limit — analytics beacon; ~120/min handles even chatty SPAs.
  const rl = rateLimit(req, { limit: 120, windowMs: 60_000 });
  if (!rl.success) return new NextResponse("Too Many Requests", { status: 429 });

  try {
    const body = await req.json();
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[vitals]",
        sanitizeLogValue(body?.name),
        sanitizeLogValue(body?.value),
        sanitizeLogValue(body?.rating),
        sanitizeLogValue(body?.url),
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
