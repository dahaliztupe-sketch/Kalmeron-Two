import { NextResponse } from "next/server";
import { WORKFLOW_LIBRARY } from "@/src/lib/workflows/library";

export const runtime = "nodejs";

export async function GET() {
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
