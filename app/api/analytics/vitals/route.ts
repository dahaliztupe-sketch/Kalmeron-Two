import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (process.env.NODE_ENV !== "production") {
      console.log("[vitals]", body.name, body.value, body.rating, body.url);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
