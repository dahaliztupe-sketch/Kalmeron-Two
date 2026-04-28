#!/usr/bin/env node
/**
 * Comprehensive agent integration test.
 * Sends realistic Arabic prompts to /api/chat (one conversation per agent),
 * captures the SSE stream, and reports quality metrics.
 */

const BASE = process.env.BASE_URL || 'http://localhost:5000';

const SCENARIOS = [
  {
    id: 'idea_validator',
    label: 'مُحلّل الأفكار',
    expectedIntent: 'IDEA_VALIDATOR',
    messages: [
      'عايز أقيّم فكرة مشروع تطبيق توصيل أكل بيتي صحي للموظفين في القاهرة الجديدة. ايه رأيك في الفكرة وحلل لي SWOT بسرعة؟',
    ],
  },
  {
    id: 'plan_builder',
    label: 'بنّاء الخطط',
    expectedIntent: 'PLAN_BUILDER',
    messages: [
      'محتاج خطة عمل تفصيلية لمشروع كافيه متخصص في القهوة المختصة في مدينة نصر برأس مال 500 ألف جنيه.',
    ],
  },
  {
    id: 'mistake_shield',
    label: 'حارس الأخطاء',
    expectedIntent: 'MISTAKE_SHIELD',
    messages: [
      'إيه أكتر الأخطاء القاتلة اللي بيقع فيها رواد الأعمال المصريين أول سنة من تأسيس الستارت أب؟',
    ],
  },
  {
    id: 'success_museum',
    label: 'متحف النجاح',
    expectedIntent: 'SUCCESS_MUSEUM',
    messages: [
      'ازاي شركة سويفل نجحت في مصر وايه الدروس اللي اقدر أتعلمها منها لمشروعي؟',
    ],
  },
  {
    id: 'opportunity_radar',
    label: 'رادار الفرص',
    expectedIntent: 'OPPORTUNITY_RADAR',
    messages: [
      'إيه المنح والمسابقات المتاحة حالياً في مصر لرواد الأعمال في مجال التكنولوجيا؟',
    ],
  },
  {
    id: 'cfo_agent',
    label: 'المدير المالي',
    expectedIntent: 'CFO_AGENT',
    messages: [
      'محتاج تحليل التدفق النقدي لمشروع متجر إلكتروني متوقع إيراد شهري 200 ألف جنيه ومصاريف 120 ألف. وضّح break-even و runway لو رأس المال 600 ألف.',
    ],
  },
  {
    id: 'legal_guide',
    label: 'الدليل القانوني',
    expectedIntent: 'LEGAL_GUIDE',
    messages: [
      'عايز أأسس شركة ذات مسئولية محدودة في مصر، إيه الخطوات والمستندات المطلوبة وكام رسوم التأسيس؟',
    ],
  },
  {
    id: 'real_estate',
    label: 'خبير العقارات',
    expectedIntent: 'REAL_ESTATE',
    messages: [
      'حلل لي عائد الاستثمار (ROI) لشراء شقة 120 متر في التجمع الخامس بـ 4 مليون جنيه وتأجيرها 25 ألف شهرياً.',
    ],
  },
  {
    id: 'general_chat',
    label: 'دردشة عامة',
    expectedIntent: 'GENERAL_CHAT',
    messages: [
      'أهلاً، إيه هي منصة كلميرون وإزاي ممكن تساعدني كرائد أعمال في مصر؟',
    ],
  },
];

function pad(s, n) { return (s + ' '.repeat(n)).slice(0, n); }

async function runScenario(s) {
  const t0 = Date.now();
  const url = `${BASE}/api/chat`;
  const body = {
    messages: s.messages.map(m => ({ role: 'user', content: m })),
    isGuest: true,
    threadId: `test-${s.id}-${Date.now()}`,
    uiContext: { source: 'integration-test', stage: 'idea' },
  };

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Request-ID': `test-${s.id}` },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, error: `network: ${e.message}` };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: text.slice(0, 200) };
  }

  // parse SSE stream
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let firstByteAt = null;
  let firstTokenAt = null;
  let routedIntent = null;
  let phases = [];
  let finalText = '';
  let chunks = 0;
  let errorEvent = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (firstByteAt === null) firstByteAt = Date.now();
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const lines = raw.split('\n');
      let event = 'message';
      let data = '';
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      let parsed;
      try { parsed = JSON.parse(data); } catch { parsed = data; }

      if (event === 'phase') {
        if (parsed?.id) phases.push(parsed.id);
      } else if (event === 'delta') {
        if (firstTokenAt === null) firstTokenAt = Date.now();
        const t = typeof parsed === 'string' ? parsed : (parsed?.text ?? '');
        finalText += t;
        chunks++;
      } else if (event === 'done') {
        if (parsed?.intent) routedIntent = parsed.intent;
      } else if (event === 'error') {
        errorEvent = parsed;
      }
    }
  }

  const tEnd = Date.now();
  const wordCount = finalText.split(/\s+/).filter(Boolean).length;
  const arabicChars = (finalText.match(/[\u0600-\u06FF]/g) || []).length;
  const arabicRatio = finalText.length ? arabicChars / finalText.length : 0;
  const intentCorrect = routedIntent === s.expectedIntent;

  return {
    ok: !errorEvent && finalText.length > 50,
    routedIntent,
    intentCorrect,
    phases,
    chunks,
    wordCount,
    arabicRatio,
    finalLen: finalText.length,
    finalPreview: finalText.slice(0, 320).replace(/\s+/g, ' '),
    ttfb: firstByteAt ? firstByteAt - t0 : null,
    ttft: firstTokenAt ? firstTokenAt - t0 : null,
    totalMs: tEnd - t0,
    errorEvent,
  };
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const delayMs = parseInt(process.env.DELAY_MS || '8000', 10);
  const onlyIds = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
  const list = onlyIds.length ? SCENARIOS.filter(s => onlyIds.includes(s.id)) : SCENARIOS;
  console.log(`\nTesting agents at ${BASE} (sequential, ${delayMs}ms between)  [${list.map(s=>s.id).join(',')}]\n`);
  console.log(pad('Agent', 22), pad('OK', 4), pad('Intent', 22), pad('TTFT', 8), pad('Total', 8), pad('Words', 7), pad('AR%', 5));
  console.log('-'.repeat(90));
  // Use a per-process tmp directory with secure (0700) permissions instead
  // of a hard-coded, world-writable /tmp/agent-test-report.json path. This
  // avoids symlink races and other untrusted-location issues flagged by
  // CodeQL js/insecure-temporary-file.
  const fsMod = await import('fs');
  const osMod = await import('os');
  const pathMod = await import('path');
  const reportDir = fsMod.mkdtempSync(pathMod.join(osMod.tmpdir(), 'kalmeron-agent-test-'));
  const reportPath = pathMod.join(reportDir, 'agent-test-report.json');
  const results = [];
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    if (i > 0) await sleep(delayMs);
    const r = await runScenario(s);
    results.push({ scenario: s, result: r });
    // incremental persist
    try {
      fsMod.writeFileSync(reportPath, JSON.stringify(results, null, 2), { mode: 0o600 });
    } catch {}
    const intentCell = r.routedIntent ? `${r.routedIntent}${r.intentCorrect ? '✓' : '✗'}` : '—';
    console.log(
      pad(s.label, 22),
      pad(r.ok ? 'YES' : 'NO', 4),
      pad(intentCell, 22),
      pad(r.ttft ? `${r.ttft}ms` : '—', 8),
      pad(r.totalMs ? `${r.totalMs}ms` : '—', 8),
      pad(String(r.wordCount || 0), 7),
      pad((r.arabicRatio * 100).toFixed(0) + '%', 5),
    );
    if (r.errorEvent) console.log('   ERROR:', JSON.stringify(r.errorEvent).slice(0, 200));
    if (r.finalPreview) console.log('   →', r.finalPreview.slice(0, 180), r.finalPreview.length > 180 ? '…' : '');
    console.log();
  }

  console.log('\n=== SUMMARY ===');
  const ok = results.filter(r => r.result.ok).length;
  const intents = results.filter(r => r.result.intentCorrect).length;
  console.log(`Passed: ${ok}/${results.length}   Correct intent routing: ${intents}/${results.length}`);
  const avgTtft = results.filter(r => r.result.ttft).reduce((a, r) => a + r.result.ttft, 0) / Math.max(1, results.filter(r => r.result.ttft).length);
  const avgTotal = results.filter(r => r.result.totalMs).reduce((a, r) => a + r.result.totalMs, 0) / Math.max(1, results.filter(r => r.result.totalMs).length);
  console.log(`Avg TTFT: ${avgTtft.toFixed(0)}ms   Avg total: ${avgTotal.toFixed(0)}ms`);

  // Save full report into the per-process secure tmp dir created above.
  fsMod.writeFileSync(reportPath, JSON.stringify(results, null, 2), { mode: 0o600 });
  console.log(`\nFull report → ${reportPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
