/**
 * Kalmeron Workflows — pure-engine runner
 * ---------------------------------------
 * A workflow chains 2-10 agent calls together with explicit input/output
 * mapping. The engine is dependency-free at the model layer: each step
 * declares which agent to invoke and how to wire the previous step's
 * output into its input via a tiny template syntax (`{{steps.<id>.<key>}}`,
 * `{{input.<key>}}`).
 *
 * Why a tiny custom engine instead of LangGraph here?
 *   - We already have `src/lib/orchestrator/router.ts`. This adds the
 *     declarative chaining layer on top without pulling another framework.
 *   - The spec is JSON-serialisable so it can be authored in the UI,
 *     stored in Firestore, and audited.
 *
 * Production model calls are routed through the existing `routeModel(..)`;
 * if no `GOOGLE_GENERATIVE_AI_API_KEY` is configured the engine falls
 * back to a deterministic stub so the UI is always functional in dev.
 */

import { z } from "zod";

export const WorkflowStepSchema = z.object({
  id: z.string().min(1).max(48),
  agent: z.enum([
    "idea-analyst",
    "plan-builder",
    "mistake-shield",
    "opportunity-radar",
    "cfo",
    "legal",
    "general-chat",
    "real-estate",
    "echo", // dev-only deterministic echo agent
  ]),
  prompt: z.string().min(1).max(4000),
  outputs: z.array(z.string().min(1).max(48)).default(["text"]),
});

export const WorkflowSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
  description: z.string().max(500).default(""),
  inputs: z.array(z.object({
    name: z.string().min(1).max(48),
    label: z.string().min(1).max(120),
    placeholder: z.string().max(200).optional(),
    required: z.boolean().default(true),
  })).default([]),
  steps: z.array(WorkflowStepSchema).min(1).max(10),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;

export interface StepResult {
  id: string;
  agent: WorkflowStep["agent"];
  status: "ok" | "error";
  durationMs: number;
  outputs: Record<string, string>;
  prompt: string;
  error?: string;
}

export interface WorkflowRunResult {
  workflowId: string;
  startedAt: string;
  finishedAt: string;
  totalMs: number;
  status: "ok" | "error";
  steps: StepResult[];
  finalOutput?: string;
  error?: string;
}

/* ─────────────── Template interpolation ─────────────── */

const TOKEN_RE = /\{\{\s*([a-zA-Z_][\w.-]*)\s*\}\}/g;

export function interpolate(
  template: string,
  scope: { input: Record<string, string>; steps: Record<string, Record<string, string>> },
): string {
  return template.replace(TOKEN_RE, (_, path: string) => {
    const parts = path.split(".");
    if (parts[0] === "input" && parts[1]) {
      return scope.input[parts[1]] ?? "";
    }
    if (parts[0] === "steps" && parts[1] && parts[2]) {
      return scope.steps[parts[1]]?.[parts[2]] ?? "";
    }
    return "";
  });
}

/* ─────────────── Agent call layer ─────────────── */

/**
 * Adapter contract: every agent receives the interpolated prompt and
 * must return a `Record<string,string>` keyed by the names declared in
 * `step.outputs`. The default field is "text".
 */
export type AgentAdapter = (prompt: string, outputs: string[]) => Promise<Record<string, string>>;

/**
 * Default adapter: real Gemini call when an API key is present;
 * deterministic echo otherwise so dev / preview is never blocked.
 */
async function defaultAgentAdapter(prompt: string, outputs: string[]): Promise<Record<string, string>> {
  const hasKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!hasKey) {
    const stub = `[stub] ${prompt.slice(0, 200)}${prompt.length > 200 ? "…" : ""}`;
    const out: Record<string, string> = {};
    for (const k of outputs) out[k] = stub;
    return out;
  }
  try {
    const { generateText } = await import("ai");
    const { routeModel } = await import("@/src/lib/model-router");
    const { text } = await generateText({
      model: routeModel("medium") as any,
      prompt,
    });
    const out: Record<string, string> = {};
    for (const k of outputs) out[k] = text;
    return out;
  } catch (e: any) {
    throw new Error(`agent_call_failed: ${e?.message ?? "unknown"}`);
  }
}

/* ─────────────── Runner ─────────────── */

export async function runWorkflow(
  workflow: Workflow,
  inputs: Record<string, string>,
  adapter: AgentAdapter = defaultAgentAdapter,
): Promise<WorkflowRunResult> {
  const startedAt = new Date();
  const stepsResult: StepResult[] = [];
  const stepOutputs: Record<string, Record<string, string>> = {};
  const scope = { input: inputs, steps: stepOutputs };

  for (const step of workflow.steps) {
    const t0 = Date.now();
    const interpolated = interpolate(step.prompt, scope);
    try {
      const outs = await adapter(interpolated, step.outputs);
      stepOutputs[step.id] = outs;
      stepsResult.push({
        id: step.id,
        agent: step.agent,
        status: "ok",
        durationMs: Date.now() - t0,
        outputs: outs,
        prompt: interpolated,
      });
    } catch (e: any) {
      stepsResult.push({
        id: step.id,
        agent: step.agent,
        status: "error",
        durationMs: Date.now() - t0,
        outputs: {},
        prompt: interpolated,
        error: e?.message ?? "unknown",
      });
      const finishedAt = new Date();
      return {
        workflowId: workflow.id,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        totalMs: finishedAt.getTime() - startedAt.getTime(),
        status: "error",
        steps: stepsResult,
        error: e?.message ?? "step failed",
      };
    }
  }

  const finishedAt = new Date();
  const last = stepsResult[stepsResult.length - 1];
  return {
    workflowId: workflow.id,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    totalMs: finishedAt.getTime() - startedAt.getTime(),
    status: "ok",
    steps: stepsResult,
    finalOutput: last?.outputs?.text ?? Object.values(last?.outputs ?? {})[0],
  };
}
