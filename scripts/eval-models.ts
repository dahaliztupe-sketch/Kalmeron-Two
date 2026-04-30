/**
 * Eval matrix — runs N golden prompts × M (provider, tier) combinations and
 * scores each response with the LLM Judge. Output is a Markdown report under
 * `audit/reports/model-eval-<ts>.md`.
 *
 * Usage:
 *   npm run eval:models
 *   npm run eval:models -- --tiers=medium,complex --providers=openrouter,groq
 *
 * Env:
 *   LLM_JUDGE_URL   default http://localhost:8080
 *   EVAL_RUBRIC     default factual_accuracy
 *   EVAL_PROMPTS    optional path to a JSON file with [{question, expected}]
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  listAvailableProviders,
  getProviderModel,
  type ProviderId,
} from '../src/lib/llm/providers';
import { getModelInstance } from '../src/lib/llm/adapters';
import { generateText } from 'ai';
import type { TaskTier } from '../src/lib/model-router';

interface GoldenPrompt {
  question: string;
  /** Optional reference answer; used by the judge as ground truth context. */
  expected?: string;
}

const DEFAULT_PROMPTS: GoldenPrompt[] = [
  { question: 'ما هو معدل ضريبة الدخل على الشركات في مصر عام 2025؟' },
  { question: 'اشرح بإيجاز الفرق بين الشركة المساهمة وذات المسؤولية المحدودة.' },
  { question: 'ما هي الخطوات الأساسية لتسجيل علامة تجارية في مصر؟' },
  { question: 'احسب قسط القرض الشهري لمبلغ 100,000 جنيه على 5 سنوات بفائدة 18% سنوياً.' },
];

function parseArgs(): { tiers: TaskTier[]; providers: ProviderId[] } {
  const args = process.argv.slice(2);
  const get = (k: string) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? '';
  const tiers = (get('tiers') || 'medium').split(',').filter(Boolean) as TaskTier[];
  const provs = (get('providers') || listAvailableProviders().join(','))
    .split(',').filter(Boolean) as ProviderId[];
  return { tiers, providers: provs };
}

interface EvalCell {
  provider: ProviderId;
  tier: TaskTier;
  modelId: string;
  question: string;
  answer: string;
  durationMs: number;
  judgeScore?: number;
  judgeReasoning?: string;
  error?: string;
}

async function judge(question: string, answer: string): Promise<{ score: number; reasoning: string } | null> {
  const url = (process.env.LLM_JUDGE_URL || 'http://localhost:8080').replace(/\/$/, '');
  const rubric = process.env.EVAL_RUBRIC || 'factual_accuracy';
  try {
    const res = await fetch(`${url}/judge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, rubric }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { score?: number; reasoning?: string };
    return { score: Number(data.score ?? 0), reasoning: String(data.reasoning ?? '') };
  } catch {
    return null;
  }
}

async function runOne(provider: ProviderId, tier: TaskTier, prompt: GoldenPrompt): Promise<EvalCell> {
  const m = getProviderModel(provider, tier);
  const cell: EvalCell = {
    provider, tier, modelId: m.id, question: prompt.question, answer: '', durationMs: 0,
  };
  const t0 = Date.now();
  try {
    const model = await getModelInstance(provider, m.id);
    const out = await generateText({
      model, prompt: prompt.question, maxRetries: 0,
      abortSignal: AbortSignal.timeout(45_000),
    });
    cell.answer = out.text;
    cell.durationMs = Date.now() - t0;
    const j = await judge(prompt.question, cell.answer);
    if (j) { cell.judgeScore = j.score; cell.judgeReasoning = j.reasoning; }
  } catch (e) {
    cell.durationMs = Date.now() - t0;
    cell.error = e instanceof Error ? e.message : String(e);
  }
  return cell;
}

async function main(): Promise<void> {
  const { tiers, providers } = parseArgs();
  if (providers.length === 0) {
    console.error('No providers configured. Set at least one provider key in env.');
    process.exit(2);
  }
  const prompts = DEFAULT_PROMPTS;
  console.log(`Running eval: ${providers.length} providers × ${tiers.length} tiers × ${prompts.length} prompts`);

  const cells: EvalCell[] = [];
  for (const p of providers) {
    for (const t of tiers) {
      for (const q of prompts) {
        process.stdout.write(`  ${p}/${t} … ${q.question.slice(0, 40)}…  `);
        const c = await runOne(p, t, q);
        cells.push(c);
        process.stdout.write(c.error ? `FAIL (${c.error.slice(0, 60)})\n` : `OK ${c.durationMs}ms${c.judgeScore !== undefined ? ` score=${c.judgeScore.toFixed(2)}` : ''}\n`);
      }
    }
  }

  // Aggregate per (provider, tier).
  const groups: Record<string, EvalCell[]> = {};
  for (const c of cells) {
    const k = `${c.provider}|${c.tier}|${c.modelId}`;
    (groups[k] ??= []).push(c);
  }

  const lines: string[] = [
    `# LLM Eval Matrix — ${new Date().toISOString()}`,
    '',
    `Prompts: **${prompts.length}** | Providers: **${providers.join(', ')}** | Tiers: **${tiers.join(', ')}**`,
    '',
    '| Provider | Tier | Model | Avg Score | Avg Latency | Success Rate |',
    '|---|---|---|---:|---:|---:|',
  ];
  for (const [k, list] of Object.entries(groups)) {
    const [provider, tier, model] = k.split('|');
    const ok = list.filter((c) => !c.error);
    const scored = ok.filter((c) => c.judgeScore !== undefined);
    const avgScore = scored.length ? (scored.reduce((s, c) => s + (c.judgeScore || 0), 0) / scored.length) : 0;
    const avgLat = ok.length ? Math.round(ok.reduce((s, c) => s + c.durationMs, 0) / ok.length) : 0;
    const rate = ((ok.length / list.length) * 100).toFixed(0);
    lines.push(`| ${provider} | ${tier} | \`${model}\` | ${avgScore.toFixed(3)} | ${avgLat} ms | ${rate}% |`);
  }

  lines.push('', '## Per-prompt details', '');
  for (const c of cells) {
    lines.push(`### ${c.provider}/${c.tier} — ${c.modelId}`);
    lines.push(`**Q:** ${c.question}`);
    lines.push(`**A:** ${c.error ? `_(error: ${c.error})_` : c.answer.slice(0, 600)}`);
    if (c.judgeScore !== undefined) {
      lines.push(`**Judge:** ${c.judgeScore.toFixed(2)} — ${c.judgeReasoning?.slice(0, 200) || ''}`);
    }
    lines.push('');
  }

  const outDir = join(process.cwd(), 'audit', 'reports');
  await mkdir(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const path = join(outDir, `model-eval-${ts}.md`);
  await writeFile(path, lines.join('\n'), 'utf8');
  console.log(`\nReport written: ${path}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
