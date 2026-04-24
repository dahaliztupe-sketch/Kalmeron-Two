/**
 * POST /api/workflows/run
 * -----------------------
 * Body: { workflowId: string, inputs: Record<string,string> }
 * Resp: WorkflowRunResult (see src/lib/workflows/runner.ts)
 *
 * The agent adapter is the engine default — real model call when an API
 * key is present, deterministic stub otherwise. Inputs are routed through
 * the Arabic PII redactor before reaching any model so secrets cannot
 * leak into the prompt.
 */

import { NextRequest, NextResponse } from "next/server";
import { runWorkflow } from "@/src/lib/workflows/runner";
import { findWorkflow } from "@/src/lib/workflows/library";
import { redactPii } from "@/src/lib/security/pii-redactor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const workflowId: string = body?.workflowId;
  const rawInputs: Record<string, unknown> = body?.inputs ?? {};

  if (typeof workflowId !== "string" || !workflowId) {
    return NextResponse.json({ error: "workflow_id_required" }, { status: 400 });
  }
  const wf = findWorkflow(workflowId);
  if (!wf) {
    return NextResponse.json({ error: "workflow_not_found" }, { status: 404 });
  }

  // Coerce + redact every input into a string before interpolation.
  const cleaned: Record<string, string> = {};
  for (const f of wf.inputs) {
    const v = rawInputs[f.name];
    const s = typeof v === "string" ? v : v == null ? "" : String(v);
    if (f.required && !s.trim()) {
      return NextResponse.json({ error: `missing_input:${f.name}` }, { status: 400 });
    }
    cleaned[f.name] = s ? redactPii(s).redacted : "";
  }

  try {
    const result = await runWorkflow(wf, cleaned);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: "runner_failed", message: e?.message ?? "unknown" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST { workflowId, inputs } to run a workflow. Use /api/workflows/list (TBD) to enumerate.",
  });
}
