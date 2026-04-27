#!/usr/bin/env node
/**
 * Internal Gap Scanner
 * Detects what's missing or needs to be developed:
 *   - TODO / FIXME / HACK / XXX / @ts-ignore / @ts-expect-error markers
 *   - Empty files and stub implementations (throw "not implemented")
 *   - Missing tests for components / pages / API routes
 *   - Missing translation keys between locales
 *   - Missing env vars (defined in .env.example but not in .env)
 *   - Components missing error/loading states (loading.tsx / error.tsx)
 *   - Missing README / docs in major folders
 *   - Unfinished routes: page.tsx with very low LOC
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  ensureDirs, nowISO, dateStamp, writeJSON, writeMD, readJSONSafe,
  GAPS_DIR, HISTORY_DIR, ROOT, SEVERITY, summarizeBySeverity,
  sortBySeverity, rel, diffCounts, walk,
} from './lib/utils.mjs';

const findings = [];

function add(item) {
  findings.push({
    id: `${item.scanner}:${item.code || 'X'}:${item.file || ''}:${item.line || ''}`,
    timestamp: nowISO(),
    ...item,
  });
}

// ---------- 1. TODO / FIXME markers ----------
function scanTodos() {
  process.stdout.write('  • TODO/FIXME/HACK markers ... ');
  let count = 0;
  const re = /\b(TODO|FIXME|HACK|XXX|BUG|@ts-ignore|@ts-expect-error)\b[:\s-]*(.{0,200})/i;
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.py', '.md'];
  for (const file of walk(ROOT, exts)) {
    let src;
    try { src = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(re);
      if (!m) continue;
      const tag = m[1].toUpperCase();
      const sev =
        tag === 'FIXME' || tag === 'BUG' ? SEVERITY.HIGH :
        tag === 'HACK' || tag === 'XXX' ? SEVERITY.MEDIUM :
        tag === '@TS-IGNORE' || tag === '@TS-EXPECT-ERROR' ? SEVERITY.MEDIUM :
        SEVERITY.LOW;
      add({
        scanner: 'todos',
        severity: sev,
        code: tag,
        file: rel(file),
        line: i + 1,
        message: lines[i].trim().slice(0, 200),
      });
      count++;
    }
  }
  console.log(count + ' marker(s)');
}

// ---------- 2. Empty / stub files ----------
function scanStubs() {
  process.stdout.write('  • Empty / stub files ... ');
  let count = 0;
  const stubRe = /(throw\s+new\s+Error\s*\(\s*['"`](Not implemented|not implemented|TODO|TBD)|raise\s+NotImplementedError)/;
  for (const file of walk(ROOT, ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.py'])) {
    let src;
    try { src = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const trimmed = src.trim();
    if (trimmed.length === 0) {
      add({
        scanner: 'stubs',
        severity: SEVERITY.MEDIUM,
        code: 'EMPTY_FILE',
        file: rel(file),
        message: 'File is empty',
      });
      count++;
      continue;
    }
    // Tiny file — likely placeholder
    if (trimmed.length < 30 && !file.endsWith('.d.ts')) {
      add({
        scanner: 'stubs',
        severity: SEVERITY.LOW,
        code: 'TINY_FILE',
        file: rel(file),
        message: `Possibly placeholder (${trimmed.length} chars)`,
      });
      count++;
      continue;
    }
    if (stubRe.test(src)) {
      const lineNo = src.split('\n').findIndex((l) => stubRe.test(l)) + 1;
      add({
        scanner: 'stubs',
        severity: SEVERITY.HIGH,
        code: 'NOT_IMPLEMENTED',
        file: rel(file),
        line: lineNo,
        message: 'Contains not-implemented stub',
      });
      count++;
    }
  }
  console.log(count + ' stub/empty file(s)');
}

// ---------- 3. Missing tests for source files ----------
function scanMissingTests() {
  process.stdout.write('  • Missing tests ... ');
  let count = 0;
  // Build set of test files
  const tests = new Set();
  for (const f of walk(ROOT, ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'])) {
    const base = path.basename(f).replace(/\.(test|spec)\.(ts|tsx)$/, '');
    tests.add(base);
  }
  const sourceDirs = ['app', 'components', 'hooks', 'services', 'src'].filter((d) =>
    fs.existsSync(path.join(ROOT, d))
  );
  for (const d of sourceDirs) {
    for (const file of walk(path.join(ROOT, d), ['.ts', '.tsx'])) {
      const base = path.basename(file);
      if (/\.(test|spec|d)\.(ts|tsx)$/.test(base)) continue;
      // Skip tiny next.js boilerplate
      if (/^(layout|loading|error|not-found|head|template|default|page|route)\.tsx?$/.test(base)) continue;
      const stem = base.replace(/\.(ts|tsx)$/, '');
      if (!tests.has(stem)) {
        add({
          scanner: 'tests',
          severity: SEVERITY.LOW,
          code: 'NO_TEST',
          file: rel(file),
          message: `No matching test file for ${stem}`,
        });
        count++;
      }
    }
  }
  console.log(count + ' file(s) without tests');
}

// ---------- 4. Translation keys mismatch ----------
function scanI18n() {
  process.stdout.write('  • i18n key parity ... ');
  const dir = path.join(ROOT, 'messages');
  if (!fs.existsSync(dir)) { console.log('skip'); return; }
  const locales = {};
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    try {
      locales[f.replace('.json', '')] = JSON.parse(
        fs.readFileSync(path.join(dir, f), 'utf8')
      );
    } catch (e) {
      add({
        scanner: 'i18n',
        severity: SEVERITY.HIGH,
        code: 'INVALID_JSON',
        file: rel(path.join(dir, f)),
        message: `Invalid JSON: ${e.message}`,
      });
    }
  }
  function flatten(obj, prefix = '') {
    const out = new Set();
    for (const [k, v] of Object.entries(obj || {})) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        for (const x of flatten(v, key)) out.add(x);
      } else {
        out.add(key);
      }
    }
    return out;
  }
  const flat = Object.fromEntries(
    Object.entries(locales).map(([l, o]) => [l, flatten(o)])
  );
  const all = new Set();
  Object.values(flat).forEach((s) => s.forEach((k) => all.add(k)));
  let count = 0;
  for (const [locale, keys] of Object.entries(flat)) {
    for (const k of all) {
      if (!keys.has(k)) {
        add({
          scanner: 'i18n',
          severity: SEVERITY.MEDIUM,
          code: 'MISSING_KEY',
          file: `messages/${locale}.json`,
          message: `Missing translation key: "${k}"`,
        });
        count++;
      }
    }
  }
  console.log(count + ' missing translation(s)');
}

// ---------- 5. Env vars defined in .env.example but missing ----------
function scanEnv() {
  process.stdout.write('  • Env vars ... ');
  const examplePath = path.join(ROOT, '.env.example');
  if (!fs.existsSync(examplePath)) { console.log('skip'); return; }
  const example = fs.readFileSync(examplePath, 'utf8');
  const expected = new Set();
  for (const line of example.split('\n')) {
    const m = line.match(/^([A-Z][A-Z0-9_]+)\s*=/);
    if (m) expected.add(m[1]);
  }
  const present = new Set(Object.keys(process.env));
  let count = 0;
  for (const k of expected) {
    if (!present.has(k) || !process.env[k]) {
      add({
        scanner: 'env',
        severity: SEVERITY.MEDIUM,
        code: 'MISSING_ENV',
        message: `Env var "${k}" defined in .env.example but not set`,
      });
      count++;
    }
  }
  console.log(count + ' missing env var(s)');
}

// ---------- 6. Next.js routes missing loading/error states ----------
function scanRouteStates() {
  process.stdout.write('  • Route loading/error states ... ');
  const appDir = path.join(ROOT, 'app');
  if (!fs.existsSync(appDir)) { console.log('skip'); return; }
  let count = 0;
  function walkApp(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    const names = entries.map((e) => e.name);
    const hasPage = names.some((n) => /^page\.(tsx?|jsx?|mdx)$/.test(n));
    if (hasPage) {
      const hasLoading = names.some((n) => /^loading\.(tsx?|jsx?)$/.test(n));
      const hasError = names.some((n) => /^error\.(tsx?|jsx?)$/.test(n));
      if (!hasLoading) {
        add({
          scanner: 'routes',
          severity: SEVERITY.LOW,
          code: 'NO_LOADING',
          file: rel(dir),
          message: 'Route is missing a loading.tsx fallback',
        });
        count++;
      }
      if (!hasError) {
        add({
          scanner: 'routes',
          severity: SEVERITY.MEDIUM,
          code: 'NO_ERROR_BOUNDARY',
          file: rel(dir),
          message: 'Route is missing an error.tsx boundary',
        });
        count++;
      }
    }
    for (const e of entries) {
      if (e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.')) {
        walkApp(path.join(dir, e.name));
      }
    }
  }
  walkApp(appDir);
  console.log(count + ' route(s) needing fallback');
}

// ---------- 7. Major folders missing README ----------
function scanReadmes() {
  process.stdout.write('  • Folder docs ... ');
  const targets = ['app', 'components', 'hooks', 'services', 'src', 'i18n', 'contexts'];
  let count = 0;
  for (const t of targets) {
    const full = path.join(ROOT, t);
    if (!fs.existsSync(full)) continue;
    const entries = fs.readdirSync(full);
    const hasReadme = entries.some((e) => /^readme(\.md)?$/i.test(e));
    if (!hasReadme) {
      add({
        scanner: 'docs',
        severity: SEVERITY.LOW,
        code: 'NO_README',
        file: t,
        message: `Folder "${t}/" has no README — onboarding gap`,
      });
      count++;
    }
  }
  console.log(count + ' folder(s) without README');
}

// ---------- 8. Suspiciously short pages ----------
function scanShortPages() {
  process.stdout.write('  • Skeleton pages ... ');
  const appDir = path.join(ROOT, 'app');
  if (!fs.existsSync(appDir)) { console.log('skip'); return; }
  let count = 0;
  for (const f of walk(appDir, ['.tsx'])) {
    if (!/page\.tsx$/.test(f)) continue;
    let src;
    try { src = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const loc = src.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//')).length;
    if (loc < 10) {
      add({
        scanner: 'pages',
        severity: SEVERITY.LOW,
        code: 'SKELETON_PAGE',
        file: rel(f),
        message: `Page has only ${loc} lines — possibly a skeleton`,
      });
      count++;
    }
  }
  console.log(count + ' skeleton page(s)');
}

// ---------- main ----------
function main() {
  ensureDirs();
  const startedAt = nowISO();
  console.log(`\n[diagnostics:gaps] ${startedAt}`);

  scanTodos();
  scanStubs();
  scanMissingTests();
  scanI18n();
  scanEnv();
  scanRouteStates();
  scanReadmes();
  scanShortPages();

  const sorted = sortBySeverity(findings);
  const summary = summarizeBySeverity(sorted);
  const byScanner = {};
  for (const f of sorted) {
    byScanner[f.scanner] = (byScanner[f.scanner] || 0) + 1;
  }

  const latestPath = path.join(GAPS_DIR, 'latest.json');
  const prev = readJSONSafe(latestPath);
  const delta = diffCounts(prev?.totals, { all: sorted.length, ...summary });

  const result = {
    type: 'gaps',
    generatedAt: startedAt,
    finishedAt: nowISO(),
    totals: { all: sorted.length, ...summary },
    byScanner,
    delta,
    findings: sorted,
  };

  writeJSON(latestPath, result);
  writeJSON(path.join(HISTORY_DIR, `gaps-${dateStamp()}.json`), result);

  const md = renderMarkdown(result);
  writeMD(path.join(GAPS_DIR, 'latest.md'), md);

  console.log(`\n  Total: ${sorted.length} gap(s)`);
  console.log(`  High: ${summary.high}, Medium: ${summary.medium}, Low: ${summary.low}`);
  console.log(`  → diagnostics/gaps/latest.md`);
  console.log(`  → diagnostics/gaps/latest.json\n`);

  return result;
}

function renderMarkdown(r) {
  const top = r.findings.slice(0, 75);
  const sev = r.totals;
  const dl = (k) => {
    const d = r.delta?.[k]?.delta ?? 0;
    if (d === 0) return '±0';
    return d > 0 ? `+${d}` : String(d);
  };
  let out = `# Gap Analysis Report

**Generated:** ${r.generatedAt}
**Total gaps:** ${r.totals.all}

> What's missing, unfinished, or needs to be added/developed.

## Severity breakdown
| Severity | Count | Δ since last run |
|---|---|---|
| Critical | ${sev.critical} | ${dl('critical')} |
| High     | ${sev.high}     | ${dl('high')} |
| Medium   | ${sev.medium}   | ${dl('medium')} |
| Low      | ${sev.low}      | ${dl('low')} |
| Info     | ${sev.info}     | ${dl('info')} |

## By category
${Object.entries(r.byScanner).map(([k, v]) => `- **${k}**: ${v}`).join('\n') || '_(none)_'}

## Top gaps (max 75)
`;
  if (top.length === 0) {
    out += '\n_No gaps detected._\n';
  } else {
    for (const f of top) {
      const loc = f.file ? `\`${f.file}${f.line ? ':' + f.line : ''}\`` : '';
      out += `\n- **[${f.severity}]** \`${f.scanner}/${f.code || ''}\` ${loc}\n  ${f.message || ''}\n`;
    }
  }
  return out;
}

main();
