/**
 * Eval harness for Kalmeron AI agents.
 * Runs the supervisor on the golden dataset and reports:
 *  - Intent classification accuracy.
 *  - PII redaction coverage.
 *  - Prompt-injection block rate (`shouldBlock` cases).
 *
 * Usage:
 *   npm run eval                      # console output only
 *   npm run eval -- --json            # also writes test/eval/results.json
 *   npm run eval -- --json out.json   # custom output path
 *
 * The JSON output is consumed by `services/eval-analyzer/analyze.py` to
 * produce statistical reports (per-agent recall, confusion matrix, latency
 * histograms). The TS path stays the source of truth for pass/fail; Python
 * only adds analytics on top of the same data.
 *
 * (Requires GEMINI_API_KEY for full intent checks; PII + injection
 *  assertions run regardless.)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import dataset from './golden-dataset.json' assert { type: 'json' };
import { intelligentOrchestrator } from '../../src/ai/orchestrator/supervisor';
import { HumanMessage } from '@langchain/core/messages';
import { redactPII } from '../../src/lib/compliance/pii-redactor';
import { sanitizeInput, validatePromptIntegrity } from '../../src/lib/security/prompt-guard';
import { getRecentAudit } from '../../src/lib/llm/gateway';

interface CaseResult {
  id: string;
  passed: boolean;
  category: 'router' | 'safety' | 'pii' | 'quality' | 'unknown';
  expectedAgent?: string;
  expectedIntent?: string;
  latencyMs: number;
  details: Record<string, unknown>;
}

interface DatasetCase {
  id: string;
  input: string;
  agent?: string;
  expectedIntent?: string;
  shouldBlock?: boolean;
  shouldRedact?: string[];
  rubric?: string;
  expectedKeywords?: string[];
  category?: string;
}

type DatasetCaseCategory = CaseResult['category'];

function classifyCase(c: DatasetCase): DatasetCaseCategory {
  if (c.shouldBlock) return 'safety';
  if (c.shouldRedact) return 'pii';
  if (c.rubric) return 'quality';
  if (c.expectedIntent) return 'router';
  return 'unknown';
}

function parseArgs(argv: string[]): { jsonPath: string | null } {
  const idx = argv.indexOf('--json');
  if (idx === -1) return { jsonPath: null };
  const next = argv[idx + 1];
  const explicit = next && !next.startsWith('--') ? next : null;
  return { jsonPath: explicit ?? 'test/eval/results.json' };
}

/**
 * The same preflight logic used by the LLM gateway. Re-implemented here so the
 * eval can assert on `shouldBlock` cases without spending tokens.
 */
function gatewayWouldBlock(input: string): boolean {
  const sanitized = sanitizeInput(input);
  return !validatePromptIntegrity('SYSTEM', sanitized);
}

async function runOne(c: DatasetCase): Promise<CaseResult> {
  const details: Record<string, unknown> = {};
  let passed = true;
  const startedAt = Date.now();

  // 1. PII redaction check (لا يتطلب LLM)
  if (c.shouldRedact) {
    const { hits } = redactPII(c.input);
    const types = new Set(hits.map((h) => h.type));
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
    c.expectedIntent !== 'BLOCKED' &&
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
    } catch (e: unknown) {
      details.error = e instanceof Error ? e.message : String(e);
      passed = false;
    }
  } else if (c.expectedIntent && c.expectedIntent !== 'ANY' && c.expectedIntent !== 'BLOCKED' && !c.shouldBlock) {
    details.skipped = 'no GEMINI_API_KEY';
  }

  const latencyMs = Date.now() - startedAt;
  return {
    id: c.id,
    passed,
    category: classifyCase(c),
    expectedAgent: c.agent,
    expectedIntent: c.expectedIntent,
    latencyMs,
    details,
  };
}

async function main() {
  const { jsonPath } = parseArgs(process.argv.slice(2));
  const cases = dataset.cases as DatasetCase[];
  console.log(`Running ${cases.length} eval cases...`);
  const results: CaseResult[] = [];
  for (const c of cases) {
    const r = await runOne(c);
    results.push(r);
    console.log(`${r.passed ? '✓' : '✗'} ${r.id} (${r.latencyMs}ms)`, r.details);
  }
  const pass = results.filter(r => r.passed).length;
  const total = results.length;
  const ratio = pass / total;
  console.log(`\n=== Pass rate: ${pass}/${total} (${(ratio * 100).toFixed(1)}%) ===`);

  if (jsonPath) {
    const rubric = dataset.qualityRubric as { passThreshold: number } | undefined;
    const out = {
      meta: {
        version: dataset.version,
        ranAt: new Date().toISOString(),
        nodeVersion: process.version,
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        passThreshold: rubric?.passThreshold ?? null,
      },
      summary: { pass, total, ratio },
      results,
    };
    try {
      mkdirSync(dirname(jsonPath), { recursive: true });
      writeFileSync(jsonPath, JSON.stringify(out, null, 2), 'utf8');
      console.log(`\nWrote machine-readable results → ${jsonPath}`);
    } catch (e: unknown) {
      console.error(`Failed to write JSON output to ${jsonPath}:`, e instanceof Error ? e.message : String(e));
    }
  }

  const threshold = (dataset.qualityRubric as { passThreshold: number } | undefined)?.passThreshold ?? 0;
  if (ratio < threshold) {
    console.error(`Below threshold ${threshold}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}
