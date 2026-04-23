/**
 * Eval harness for Kalmeron AI agents.
 * Runs the supervisor on the golden dataset and reports:
 *  - Intent classification accuracy.
 *  - PII redaction coverage.
 *  - Prompt-injection block rate (`shouldBlock` cases).
 *
 * Usage: pnpm tsx test/eval/run-eval.ts
 * (Requires GEMINI_API_KEY for full intent checks; PII + injection
 *  assertions run regardless.)
 */
// @ts-nocheck
import dataset from './golden-dataset.json' assert { type: 'json' };
import { intelligentOrchestrator } from '../../src/ai/orchestrator/supervisor';
import { HumanMessage } from '@langchain/core/messages';
import { redactPII } from '../../src/lib/compliance/pii-redactor';
import { sanitizeInput, validatePromptIntegrity } from '../../src/lib/security/prompt-guard';
import { getRecentAudit } from '../../src/lib/llm/gateway';

interface CaseResult {
  id: string;
  passed: boolean;
  details: Record<string, any>;
}

/**
 * The same preflight logic used by the LLM gateway. Re-implemented here so the
 * eval can assert on `shouldBlock` cases without spending tokens.
 */
function gatewayWouldBlock(input: string): boolean {
  const sanitized = sanitizeInput(input);
  return !validatePromptIntegrity('SYSTEM', sanitized);
}

async function runOne(c: any): Promise<CaseResult> {
  const details: Record<string, any> = {};
  let passed = true;

  // 1. PII redaction check (لا يتطلب LLM)
  if (c.shouldRedact) {
    const { hits } = redactPII(c.input);
    const types = new Set(hits.map((h: any) => h.type));
    const missing = c.shouldRedact.filter((t: string) => !types.has(t));
    details.pii_missing = missing;
    if (missing.length > 0) passed = false;
  }

  // 2. Prompt-injection block check (لا يتطلب LLM)
  if (c.shouldBlock === true) {
    const blocked = gatewayWouldBlock(c.input);
    details.injection_blocked = blocked;
    if (!blocked) passed = false;
  }

  // 3. Intent classification (يتطلب GEMINI_API_KEY) — يُتخطّى للحالات التي تُحجب
  if (
    c.expectedIntent &&
    c.expectedIntent !== 'ANY' &&
    !c.shouldBlock &&
    process.env.GEMINI_API_KEY
  ) {
    try {
      const auditBefore = getRecentAudit(1000).length;
      const out = await intelligentOrchestrator.invoke(
        { messages: [new HumanMessage(c.input)], isGuest: true, messageCount: 0, uiContext: {}, userId: `eval-${c.id}` },
        { configurable: { thread_id: `eval-${c.id}` } },
      );
      const auditAfter = getRecentAudit(1000).length;
      details.intent = out.intent;
      details.gateway_calls = auditAfter - auditBefore;
      // Every routed request must produce ≥1 gateway audit entry
      // (router classification at minimum). If this is 0, an LLM path
      // bypassed the gateway.
      if (auditAfter - auditBefore < 1) {
        details.gateway_bypass = true;
        passed = false;
      }
      if (out.intent !== c.expectedIntent) {
        details.intent_expected = c.expectedIntent;
        passed = false;
      }
    } catch (e: any) {
      details.error = e?.message;
      passed = false;
    }
  } else if (c.expectedIntent && c.expectedIntent !== 'ANY' && !c.shouldBlock) {
    details.skipped = 'no GEMINI_API_KEY';
  }

  return { id: c.id, passed, details };
}

async function main() {
  console.log(`Running ${dataset.cases.length} eval cases...`);
  const results: CaseResult[] = [];
  for (const c of dataset.cases) {
    const r = await runOne(c);
    results.push(r);
    console.log(`${r.passed ? '✓' : '✗'} ${r.id}`, r.details);
  }
  const pass = results.filter(r => r.passed).length;
  const total = results.length;
  const ratio = pass / total;
  console.log(`\n=== Pass rate: ${pass}/${total} (${(ratio * 100).toFixed(1)}%) ===`);
  if (ratio < dataset.qualityRubric.passThreshold) {
    console.error(`Below threshold ${dataset.qualityRubric.passThreshold}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}
