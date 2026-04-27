import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const DIAG_DIR = path.join(ROOT, 'diagnostics');
export const ERRORS_DIR = path.join(DIAG_DIR, 'errors');
export const GAPS_DIR = path.join(DIAG_DIR, 'gaps');
export const REPORTS_DIR = path.join(DIAG_DIR, 'reports');
export const HISTORY_DIR = path.join(DIAG_DIR, 'history');

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

export const SEVERITY_RANK = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

export function ensureDirs() {
  for (const d of [DIAG_DIR, ERRORS_DIR, GAPS_DIR, REPORTS_DIR, HISTORY_DIR]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

export function runCmd(cmd, opts = {}) {
  try {
    const out = execSync(cmd, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: opts.timeout ?? 180_000,
      ...opts,
    });
    return { ok: true, code: 0, stdout: out, stderr: '' };
  } catch (err) {
    return {
      ok: false,
      code: err.status ?? 1,
      stdout: err.stdout?.toString?.() ?? '',
      stderr: err.stderr?.toString?.() ?? String(err.message || ''),
    };
  }
}

export function nowISO() {
  return new Date().toISOString();
}

export function dateStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

export function readJSONSafe(file, fallback = null) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeMD(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

const EXCLUDED_DIRS = new Set([
  'node_modules', '.next', '.git', 'dist', 'build', 'coverage',
  '.cache', '.turbo', 'out', 'diagnostics', '.local', '.upm',
  'playwright-report', 'test-results', '.vitest-cache', '.pythonlibs',
  '__pycache__', '.venv', 'eval-reports', '.pytest_cache', '.ruff_cache',
]);

export function* walk(dir, exts = null) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.env.example') continue;
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full, exts);
    } else if (e.isFile()) {
      if (!exts || exts.some((x) => e.name.endsWith(x))) {
        yield full;
      }
    }
  }
}

export function rel(p) {
  return path.relative(ROOT, p);
}

export function summarizeBySeverity(items) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const it of items) {
    const sev = it.severity || 'info';
    counts[sev] = (counts[sev] ?? 0) + 1;
  }
  return counts;
}

export function sortBySeverity(items) {
  return [...items].sort(
    (a, b) =>
      (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0)
  );
}

export function diffCounts(prev, curr) {
  const keys = new Set([...Object.keys(prev || {}), ...Object.keys(curr || {})]);
  const out = {};
  for (const k of keys) {
    const p = prev?.[k] ?? 0;
    const c = curr?.[k] ?? 0;
    out[k] = { prev: p, curr: c, delta: c - p };
  }
  return out;
}
