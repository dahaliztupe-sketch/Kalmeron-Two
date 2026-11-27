import { briefToPromptBlock, type CompanyBrief } from "@/src/lib/company/brief";
import { extractJson } from "@/src/lib/plan/validated-plan";
import type { Issue, RoleSpec } from "@/src/lib/company/roles/spec";

export type RoleRun<T> =
  | { ok: true; output: T; issues: Issue[]; attempts: number; quality: "unverified" }
  | { ok: false; error: string; issues: Issue[]; attempts: number };

export type Generate = (system: string, prompt: string) => Promise<string>;

/**
 * Runs one role: prompt -> JSON -> schema -> quality checks. One repair
 * attempt if the output is malformed or has error-level issues. `quality`
 * stays "unverified": automated checks are not a substitute for a human
 * reading real outputs.
 */
export async function runRole<T>(spec: RoleSpec<T>, brief: CompanyBrief, generate: Generate, maxAttempts = 2, extraContext = "", totalBudgetMs?: number, now: () => number = Date.now): Promise<RoleRun<T>> {
  const startedAt = now();
  let firstAttemptMs = 0;
  const base = `ملخص الشركة:\n${briefToPromptBlock(brief)}${extraContext}\n\nأعد كائن JSON بهذا الشكل بالضبط:\n${spec.outputShape}`;
  let feedback = "";
  let lastIssues: Issue[] = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // A repair attempt takes about as long as the first one. If it cannot finish inside the budget,
    // stop with a clear error instead of being killed by the platform timeout with no response.
    if (attempt > 1 && totalBudgetMs !== undefined && now() - startedAt + firstAttemptMs * 1.2 > totalBudgetMs) {
      return { ok: false, error: "time_budget", issues: lastIssues, attempts: attempt - 1 };
    }
    const attemptStart = now();
    let text: string;
    try {
      text = await generate(spec.systemPrompt, base + feedback);
    } catch {
      return { ok: false, error: "model_error", issues: lastIssues, attempts: attempt };
    }
    if (attempt === 1) firstAttemptMs = now() - attemptStart;
    let parsed;
    try {
      parsed = spec.outputSchema.safeParse(extractJson(text));
    } catch {
      feedback = "\n\nالمحاولة السابقة لم تكن JSON صالحاً. أعد JSON فقط.";
      lastIssues = [{ level: "error", code: "invalid_json", message: "المخرج ليس JSON صالحاً." }];
      continue;
    }
    if (!parsed.success) {
      const msg = parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      feedback = `\n\nالمحاولة السابقة خالفت الشكل المطلوب: ${msg}. صحّحها.`;
      lastIssues = [{ level: "error", code: "schema_mismatch", message: msg }];
      continue;
    }
    const issues = spec.checks(parsed.data, brief);
    const errors = issues.filter((i) => i.level === "error");
    if (errors.length === 0) return { ok: true, output: parsed.data, issues, attempts: attempt, quality: "unverified" };
    feedback = `\n\nالمحاولة السابقة فشلت في فحوص الجودة: ${errors.map((e) => e.message).join(" | ")}. صحّحها.`;
    lastIssues = issues;
  }
  return { ok: false, error: "quality_failed", issues: lastIssues, attempts: maxAttempts };
}
