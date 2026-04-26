import { NextRequest, NextResponse } from "next/server";
import { WORKFLOW_LIBRARY } from "@/src/lib/workflows/library";
import { rateLimit } from "@/src/lib/security/rate-limit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Per-IP rate limit — public catalog; 60/min is well above any honest UI.
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return new NextResponse("Too Many Requests", { status: 429 });

  return NextResponse.json({
    count: WORKFLOW_LIBRARY.length,
    workflows: WORKFLOW_LIBRARY.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      stepCount: w.steps.length,
      inputs: w.inputs,
    })),
  });
}
