import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE_COOKIE } from "@/src/lib/investor/demo-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONE_DAY = 60 * 60 * 24;

export async function GET(req: NextRequest) {
  const enabled = req.cookies.get(DEMO_MODE_COOKIE)?.value === "1";
  return NextResponse.json({ enabled });
}

export async function POST(req: NextRequest) {
  let body: { enabled?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const enabled = Boolean(body.enabled);
  const res = NextResponse.json({ enabled });
  if (enabled) {
    res.cookies.set(DEMO_MODE_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      maxAge: ONE_DAY,
      path: "/",
    });
  } else {
    res.cookies.delete(DEMO_MODE_COOKIE);
  }
  return res;
}
