import { NextResponse } from "next/server";
import { sanitizeLogValue } from "@/src/lib/security/sanitize-log";

export const runtime = "edge";

export async function POST(req: Request) {
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
