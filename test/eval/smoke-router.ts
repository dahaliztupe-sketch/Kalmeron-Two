// @ts-nocheck
/**
 * Router-only smoke — measures intent classification accuracy without
 * running the downstream agents (avoids the 30-40 s tail for PRO-model
 * draft generation). One representative prompt per intent.
 *
 * Usage: npx tsx test/eval/smoke-router.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import dataset from './golden-dataset.json' assert { type: 'json' };
import { MODELS } from '../../src/lib/gemini';
import { safeGenerateText } from '../../src/lib/llm/gateway';

const PROMPT = `أنت المنسق الذكي لمنصة كلميرون تو. صنّف نية رسالة المستخدم إلى إحدى الفئات التالية فقط وأجب بالكلمة المفتاحية وحدها:

- IDEA_VALIDATOR: عندما يطلب تقييم فكرة مشروع أو تحليل SWOT أو دراسة الجدوى.
- PLAN_BUILDER: عندما يطلب خطة عمل أو Business Plan أو خطوات تنفيذية.
- MISTAKE_SHIELD: عندما يسأل عن أخطاء محتملة، تحذيرات، أو مخاطر.
- SUCCESS_MUSEUM: عندما يسأل عن قصص نجاح شركات أو كيف نجحت شركة معينة.
- OPPORTUNITY_RADAR: عندما يسأل عن منح، مسابقات، تمويل، أو هاكاثونات.
- CFO_AGENT: عندما يسأل عن نمذجة مالية، التدفق النقدي، أو توقعات مالية.
- LEGAL_GUIDE: عندما يسأل عن تأسيس شركة، عقود، أو تشريعات مصرية.
- REAL_ESTATE: عندما يسأل عن عقارات استثمارية أو حساب ROI أو صفقات عقارية.
- ADMIN: عندما يسأل عن مراقبة النظام، سجلات، أو لوحة الإدارة.
- GENERAL_CHAT: لأي سؤال عام أو دردشة لا تقع تحت التخصصات أعلاه.`;

const VALID = [
  'IDEA_VALIDATOR', 'PLAN_BUILDER', 'MISTAKE_SHIELD', 'SUCCESS_MUSEUM',
  'OPPORTUNITY_RADAR', 'CFO_AGENT', 'LEGAL_GUIDE', 'REAL_ESTATE',
  'ADMIN', 'GENERAL_CHAT',
];

function pickOnePerIntent(cases: any[]): any[] {
  const byIntent = new Map<string, any>();
  for (const c of cases) {
    if (!c.expectedIntent || c.expectedIntent === 'ANY') continue;
    if (!byIntent.has(c.expectedIntent)) byIntent.set(c.expectedIntent, c);
  }
  return [...byIntent.values()];
}

async function classify(input: string, id: string): Promise<{ raw: string; intent: string; latencyMs: number; error?: string }> {
  const t0 = Date.now();
  try {
    const { result } = await safeGenerateText(
      { model: MODELS.LITE, system: PROMPT, prompt: input, maxRetries: 0 },
      { agent: `smoke-router-${id}`, softCostBudgetUsd: 0.005, timeoutMs: 12_000 },
    );
    const cleaned = (result.text || '').trim().toUpperCase();
    const matched = VALID.find((v) => cleaned.includes(v)) || 'GENERAL_CHAT';
    return { raw: result.text?.slice(0, 80) || '', intent: matched, latencyMs: Date.now() - t0 };
  } catch (e: any) {
    return { raw: '', intent: '__error__', latencyMs: Date.now() - t0, error: e?.message?.slice(0, 200) };
  }
}

async function main() {
  const cases = (dataset.cases as any[]).filter(
    (c) => c.expectedIntent && c.expectedIntent !== 'ANY' && !c.shouldBlock && !c.shouldRedact,
  );
  const sample = pickOnePerIntent(cases);
  console.log(`Router-only smoke — ${sample.length} cases`);

  const results: any[] = [];
  for (const c of sample) {
    const r = await classify(c.input, c.id);
    const ok = r.intent === c.expectedIntent;
    console.log(`${ok ? '✓' : '✗'} ${c.id} (${r.latencyMs}ms)  ${r.intent} (expected ${c.expectedIntent})  raw="${r.raw}"${r.error ? ' err=' + r.error : ''}`);
    results.push({ id: c.id, expected: c.expectedIntent, intent: r.intent, latencyMs: r.latencyMs, error: r.error || null, raw: r.raw });
  }
  const pass = results.filter((r) => r.intent === r.expected).length;
  console.log(`\n=== Router accuracy: ${pass}/${results.length} (${((pass / results.length) * 100).toFixed(1)}%) ===`);
  const out = 'test/eval/smoke-router-results.json';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify({ ranAt: new Date().toISOString(), pass, total: results.length, results }, null, 2), 'utf8');
  console.log(`Wrote ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
