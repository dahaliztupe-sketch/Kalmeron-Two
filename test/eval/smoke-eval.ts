// @ts-nocheck
/**
 * Smoke evaluation — fast subset of the full golden dataset.
 *
 * Runs:
 *  - All `safety-*` cases (prompt-injection block-rate, no LLM call).
 *  - All `pii-*` cases (PII redaction coverage, no LLM call).
 *  - A user-configurable sample of `router-*` cases through the supervisor
 *    (env: SMOKE_ROUTER_SAMPLE, default 9 — one per intent).
 *
 * Output is human-readable + a structured JSON dump at
 * test/eval/smoke-results.json so the agent can summarise it.
 *
 * Usage:
 *   npx tsx test/eval/smoke-eval.ts [routerSample]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import dataset from './golden-dataset.json' assert { type: 'json' };
import { redactPII } from '../../src/lib/compliance/pii-redactor';
import { sanitizeInput, validatePromptIntegrity } from '../../src/lib/security/prompt-guard';
import { intelligentOrchestrator } from '../../src/ai/orchestrator/supervisor';
import { HumanMessage } from '@langchain/core/messages';

const ROUTER_SAMPLE = Number(process.env.SMOKE_ROUTER_SAMPLE ?? process.argv[2] ?? 9);
const PER_CASE_TIMEOUT_MS = Number(process.env.SMOKE_PER_CASE_TIMEOUT_MS ?? 25_000);

interface CaseResult {
  id: string;
  group: 'safety' | 'pii' | 'router';
  passed: boolean;
  latencyMs: number;
  details: Record<string, any>;
}

function gatewayWouldBlock(input: string): boolean {
  const sanitized = sanitizeInput(input);
  return !validatePromptIntegrity('SYSTEM', sanitized);
}

async function runSafety(c: any): Promise<CaseResult> {
  const t0 = Date.now();
  const blocked = gatewayWouldBlock(c.input);
  return {
    id: c.id,
    group: 'safety',
    passed: blocked,
    latencyMs: Date.now() - t0,
    details: { blocked, expected: true },
  };
}

async function runPII(c: any): Promise<CaseResult> {
  const t0 = Date.now();
  const { hits } = redactPII(c.input);
  const types = new Set(hits.map((h: any) => h.type));
  const expected: string[] = c.shouldRedact || [];
  const missing = expected.filter((t) => !types.has(t));
  return {
    id: c.id,
    group: 'pii',
    passed: missing.length === 0,
    latencyMs: Date.now() - t0,
    details: { hits: [...types], expected, missing },
  };
}

async function runRouter(c: any): Promise<CaseResult> {
  const t0 = Date.now();
  try {
    const out = await Promise.race([
      intelligentOrchestrator.invoke(
        {
          messages: [new HumanMessage(c.input)],
          isGuest: true,
          messageCount: 0,
          uiContext: {},
          userId: `smoke-${c.id}`,
        },
        { configurable: { thread_id: `smoke-${c.id}` } },
      ),
      new Promise<any>((_, rej) => setTimeout(() => rej(new Error('timeout')), PER_CASE_TIMEOUT_MS)),
    ]);
    const intent = out?.intent;
    return {
      id: c.id,
      group: 'router',
      passed: intent === c.expectedIntent,
      latencyMs: Date.now() - t0,
      details: { intent, expected: c.expectedIntent },
    };
  } catch (e: any) {
    return {
      id: c.id,
      group: 'router',
      passed: false,
      latencyMs: Date.now() - t0,
      details: { error: e?.message?.slice(0, 200) || 'unknown' },
    };
  }
}

function pickOnePerIntent(cases: any[], n: number): any[] {
  const byIntent = new Map<string, any[]>();
  for (const c of cases) {
    if (!c.expectedIntent || c.expectedIntent === 'ANY') continue;
    if (!byIntent.has(c.expectedIntent)) byIntent.set(c.expectedIntent, []);
    byIntent.get(c.expectedIntent)!.push(c);
  }
  const picks: any[] = [];
  for (const [, arr] of byIntent) picks.push(arr[0]);
  return picks.slice(0, n);
}

async function main() {
  const cases = dataset.cases as any[];
  const safety = cases.filter((c) => c.shouldBlock);
  const pii = cases.filter((c) => c.shouldRedact);
  const routerAll = cases.filter((c) => c.expectedIntent && c.expectedIntent !== 'ANY' && !c.shouldBlock && !c.shouldRedact);
  const routerSample = pickOnePerIntent(routerAll, ROUTER_SAMPLE);

  const results: CaseResult[] = [];
  console.log(`Smoke eval — safety:${safety.length} pii:${pii.length} router-sample:${routerSample.length}`);

  for (const c of safety) {
    const r = await runSafety(c);
    results.push(r);
    console.log(`${r.passed ? '✓' : '✗'} [safety]  ${r.id} (${r.latencyMs}ms)`);
  }
  for (const c of pii) {
    const r = await runPII(c);
    results.push(r);
    console.log(`${r.passed ? '✓' : '✗'} [pii]     ${r.id} (${r.latencyMs}ms) hits=${r.details.hits.join('|') || '—'}`);
  }
  for (const c of routerSample) {
    const r = await runRouter(c);
    results.push(r);
    console.log(`${r.passed ? '✓' : '✗'} [router]  ${r.id} (${r.latencyMs}ms) → ${r.details.intent ?? r.details.error}  (expected ${r.details.expected})`);
  }

  const groups = ['safety', 'pii', 'router'] as const;
  const summary: Record<string, { pass: number; total: number; ratio: number }> = {};
  for (const g of groups) {
    const subset = results.filter((r) => r.group === g);
    const pass = subset.filter((r) => r.passed).length;
    summary[g] = { pass, total: subset.length, ratio: subset.length ? pass / subset.length : 0 };
  }
  const passAll = results.filter((r) => r.passed).length;
  console.log('\n=== Summary ===');
  for (const g of groups) {
    const s = summary[g];
    console.log(`${g.padEnd(7)} : ${s.pass}/${s.total} (${(s.ratio * 100).toFixed(1)}%)`);
  }
  console.log(`overall : ${passAll}/${results.length} (${((passAll / results.length) * 100).toFixed(1)}%)`);

  const outPath = 'test/eval/smoke-results.json';
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify({ ranAt: new Date().toISOString(), summary, results }, null, 2),
    'utf8',
  );
  console.log(`\nWrote ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
