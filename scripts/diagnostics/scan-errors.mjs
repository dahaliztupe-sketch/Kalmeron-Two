#!/usr/bin/env node
/**
 * Internal Error Scanner
 * Collects: TypeScript errors, ESLint issues, npm audit, broken imports,
 * Python service issues, missing modules, and Sentry/runtime hints.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  ensureDirs, runCmd, nowISO, dateStamp, writeJSON, writeMD, readJSONSafe,
  ERRORS_DIR, HISTORY_DIR, ROOT, SEVERITY, summarizeBySeverity,
  sortBySeverity, rel, diffCounts, walk,
} from './lib/utils.mjs';

const findings = [];
const sources = {};

function add(item) {
  findings.push({
    id: `${item.scanner}:${item.code || 'X'}:${item.file || ''}:${item.line || ''}`,
    timestamp: nowISO(),
    ...item,
  });
}

// ---------- 1. TypeScript ----------
function scanTypeScript() {
  process.stdout.write('  • TypeScript ... ');
  const r = runCmd('npx tsc --noEmit --pretty false', { timeout: 240_000 });
  sources.typescript = { ok: r.ok, exitCode: r.code };
  const lines = (r.stdout + '\n' + r.stderr).split(/\r?\n/);
  let count = 0;
  // Pattern: file.ts(12,5): error TS2304: Cannot find name 'foo'.
  const re = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.*)$/;
  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    const [, file, lno, col, level, ts, msg] = m;
    add({
      scanner: 'typescript',
      severity: level === 'error' ? SEVERITY.HIGH : SEVERITY.MEDIUM,
      code: `TS${ts}`,
      file: rel(path.resolve(ROOT, file)),
      line: Number(lno),
      column: Number(col),
      message: msg.trim(),
    });
    count++;
  }
  console.log(count + ' issue(s)');
}

// ---------- 2. ESLint ----------
function scanEslint() {
  process.stdout.write('  • ESLint ... ');
  const r = runCmd('npx eslint . --format json --no-error-on-unmatched-pattern', {
    timeout: 240_000,
  });
  sources.eslint = { ok: r.ok, exitCode: r.code };
  let report;
  try {
    report = JSON.parse(r.stdout || '[]');
  } catch {
    console.log('parse-fail');
    add({
      scanner: 'eslint',
      severity: SEVERITY.LOW,
      code: 'PARSE_FAIL',
      message: 'Could not parse ESLint output',
      details: r.stderr.slice(0, 500),
    });
    return;
  }
  let count = 0;
  for (const f of report) {
    for (const m of f.messages || []) {
      add({
        scanner: 'eslint',
        severity:
          m.severity === 2 ? SEVERITY.MEDIUM : SEVERITY.LOW,
        code: m.ruleId || 'eslint',
        file: rel(f.filePath),
        line: m.line,
        column: m.column,
        message: m.message,
      });
      count++;
    }
  }
  console.log(count + ' issue(s)');
}

// ---------- 3. npm audit ----------
function scanNpmAudit() {
  process.stdout.write('  • npm audit ... ');
  const r = runCmd('npm audit --json --omit=dev', { timeout: 60_000 });
  sources.npmAudit = { ok: r.ok, exitCode: r.code };
  let data;
  try {
    data = JSON.parse(r.stdout || '{}');
  } catch {
    console.log('parse-fail');
    return;
  }
  let count = 0;
  const vulns = data.vulnerabilities || {};
  for (const [name, v] of Object.entries(vulns)) {
    const sev = ({
      critical: SEVERITY.CRITICAL,
      high: SEVERITY.HIGH,
      moderate: SEVERITY.MEDIUM,
      low: SEVERITY.LOW,
      info: SEVERITY.INFO,
    })[v.severity] || SEVERITY.LOW;
    add({
      scanner: 'npm-audit',
      severity: sev,
      code: v.severity,
      package: name,
      message: `${name}: ${v.severity} vulnerability (via ${v.via?.map?.((x) => x.title || x).join(', ') || 'transitive'})`,
      fixAvailable: !!v.fixAvailable,
    });
    count++;
  }
  console.log(count + ' vulnerable package(s)');
}

// ---------- 4. Broken imports / missing files ----------
function scanBrokenImports() {
  process.stdout.write('  • Broken imports ... ');
  let count = 0;
  const importRe =
    /(?:^|\s)(?:import\s+(?:[^'"]+\s+from\s+)?|require\(\s*)['"]([^'"]+)['"]/g;
  for (const file of walk(ROOT, ['.ts', '.tsx', '.js', '.jsx', '.mjs'])) {
    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    // Strip template literals to avoid false positives in scaffolders
    // that contain `import X from './...'` inside backticks.
    const cleaned = src.replace(/`[\s\S]*?`/g, (m) => ' '.repeat(m.length));
    const dir = path.dirname(file);
    let m;
    while ((m = importRe.exec(cleaned))) {
      const spec = m[1];
      if (!spec.startsWith('.') && !spec.startsWith('/')) continue;
      const base = spec.startsWith('/')
        ? path.join(ROOT, spec.slice(1))
        : path.resolve(dir, spec);
      const candidates = [
        base,
        base + '.ts', base + '.tsx', base + '.js', base + '.jsx', base + '.mjs',
        path.join(base, 'index.ts'),
        path.join(base, 'index.tsx'),
        path.join(base, 'index.js'),
      ];
      const found = candidates.some((c) => {
        try { return fs.statSync(c).isFile(); } catch { return false; }
      });
      if (!found) {
        const lineNum = src.slice(0, m.index).split('\n').length;
        add({
          scanner: 'imports',
          severity: SEVERITY.HIGH,
          code: 'MISSING_MODULE',
          file: rel(file),
          line: lineNum,
          message: `Cannot resolve relative import "${spec}"`,
        });
        count++;
      }
    }
  }
  console.log(count + ' broken import(s)');
}

// ---------- 5. Python services syntax ----------
function scanPythonSyntax() {
  process.stdout.write('  • Python syntax ... ');
  let count = 0;
  const servicesDir = path.join(ROOT, 'services');
  if (!fs.existsSync(servicesDir)) {
    console.log('skip');
    return;
  }
  for (const file of walk(servicesDir, ['.py'])) {
    const r = runCmd(`python3 -m py_compile "${file}"`, { timeout: 15_000 });
    if (!r.ok) {
      const msg = (r.stderr || r.stdout).split('\n').filter(Boolean).slice(-3).join(' | ');
      add({
        scanner: 'python',
        severity: SEVERITY.HIGH,
        code: 'PY_SYNTAX',
        file: rel(file),
        message: msg.slice(0, 400) || 'Python compile error',
      });
      count++;
    }
  }
  console.log(count + ' syntax error(s)');
}

// ---------- 6. Recent log scan (workflow / app logs) ----------
function scanRecentLogs() {
  process.stdout.write('  • Recent logs ... ');
  let count = 0;
  const candidates = [
    '/tmp/logs',
    path.join(ROOT, 'logs'),
    path.join(ROOT, '.next', 'trace'),
  ];
  const errRe = /\b(ERROR|FATAL|UnhandledPromiseRejection|TypeError|ReferenceError|EADDRINUSE|ECONNREFUSED|MODULE_NOT_FOUND|Cannot find module|Failed to compile)\b/;
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch { continue; }
    for (const name of entries) {
      const file = path.join(dir, name);
      let stat;
      try { stat = fs.statSync(file); } catch { continue; }
      if (!stat.isFile()) continue;
      if (Date.now() - stat.mtimeMs > 24 * 60 * 60 * 1000) continue;
      let content;
      try {
        content = fs.readFileSync(file, 'utf8');
      } catch { continue; }
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (errRe.test(line) && line.length < 1000) {
          add({
            scanner: 'logs',
            severity: SEVERITY.MEDIUM,
            code: 'LOG_ERROR',
            file: rel(file),
            line: i + 1,
            message: line.trim().slice(0, 400),
          });
          count++;
          if (count > 100) break;
        }
      }
      if (count > 100) break;
    }
    if (count > 100) break;
  }
  console.log(count + ' log error(s)');
}

// ---------- main ----------
function main() {
  ensureDirs();
  const startedAt = nowISO();
  console.log(`\n[diagnostics:errors] ${startedAt}`);

  scanTypeScript();
  scanEslint();
  scanNpmAudit();
  scanBrokenImports();
  scanPythonSyntax();
  scanRecentLogs();

  const sorted = sortBySeverity(findings);
  const summary = summarizeBySeverity(sorted);
  const byScanner = {};
  for (const f of sorted) {
    byScanner[f.scanner] = (byScanner[f.scanner] || 0) + 1;
  }

  // Compare to previous
  const latestPath = path.join(ERRORS_DIR, 'latest.json');
  const prev = readJSONSafe(latestPath);
  const delta = diffCounts(prev?.summary, summary);

  const result = {
    type: 'errors',
    generatedAt: startedAt,
    finishedAt: nowISO(),
    totals: { all: sorted.length, ...summary },
    byScanner,
    delta,
    sources,
    findings: sorted,
  };

  // Write outputs
  writeJSON(latestPath, result);
  writeJSON(path.join(HISTORY_DIR, `errors-${dateStamp()}.json`), result);

  const md = renderMarkdown(result);
  writeMD(path.join(ERRORS_DIR, 'latest.md'), md);

  console.log(`\n  Total: ${sorted.length} issue(s)`);
  console.log(`  Critical: ${summary.critical}, High: ${summary.high}, Medium: ${summary.medium}, Low: ${summary.low}`);
  console.log(`  → diagnostics/errors/latest.md`);
  console.log(`  → diagnostics/errors/latest.json\n`);

  return result;
}

function renderMarkdown(r) {
  const top = r.findings.slice(0, 50);
  const sev = r.totals;
  const dl = (k) => {
    const d = r.delta?.[k]?.delta ?? 0;
    if (d === 0) return '±0';
    return d > 0 ? `+${d}` : String(d);
  };
  let out = `# Error Scan Report

**Generated:** ${r.generatedAt}
**Total findings:** ${r.totals.all}

## Severity breakdown
| Severity | Count | Δ since last run |
|---|---|---|
| Critical | ${sev.critical} | ${dl('critical')} |
| High     | ${sev.high}     | ${dl('high')} |
| Medium   | ${sev.medium}   | ${dl('medium')} |
| Low      | ${sev.low}      | ${dl('low')} |
| Info     | ${sev.info}     | ${dl('info')} |

## By scanner
${Object.entries(r.byScanner).map(([k, v]) => `- **${k}**: ${v}`).join('\n') || '_(none)_'}

## Top issues (max 50)
`;
  if (top.length === 0) {
    out += '\n_No issues found._\n';
  } else {
    for (const f of top) {
      const loc = f.file ? `\`${f.file}${f.line ? ':' + f.line : ''}\`` : '';
      out += `\n- **[${f.severity}]** \`${f.scanner}/${f.code || ''}\` ${loc}\n  ${f.message || ''}\n`;
    }
  }
  return out;
}

main();
