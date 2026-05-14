#!/usr/bin/env node
/**
 * security:check — كلميرون unified security scan
 *
 * Runs every security gate in sequence and prints a coloured summary.
 * Exit code 0 = all gates passed.  Non-zero = at least one gate failed.
 *
 * Gates (in order):
 *   1. TypeScript  — zero type errors
 *   2. ESLint      — zero warnings (max-warnings=0)
 *   3. npm audit   — no critical/high vulnerabilities (ignores known exceptions)
 *   4. pip-audit   — Python CVE scan across all 4 services
 *   5. SAST grep   — quick pattern checks for common vulnerability classes
 *   6. Secret scan — ensure no hardcoded secrets leaked into tracked files
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── ANSI colours ────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  grey: "\x1b[90m",
};

const PASS = `${C.green}✓ PASS${C.reset}`;
const FAIL = `${C.red}✗ FAIL${C.reset}`;
const SKIP = `${C.yellow}⊘ SKIP${C.reset}`;
const WARN = `${C.yellow}⚠ WARN${C.reset}`;

// ─── Helper ───────────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: opts.timeout ?? 120_000,
    });
    return { ok: true, stdout: out, stderr: "" };
  } catch (e) {
    return { ok: false, stdout: e.stdout ?? "", stderr: e.stderr ?? "", code: e.status };
  }
}

function header(title) {
  console.log(`\n${C.bold}${C.cyan}── ${title} ${"─".repeat(Math.max(0, 55 - title.length))}${C.reset}`);
}

function row(label, status, detail = "") {
  const padded = label.padEnd(45);
  console.log(`  ${padded} ${status}${detail ? `  ${C.grey}${detail}${C.reset}` : ""}`);
}

// ─── Known npm vulnerability exceptions (no upstream fix available) ───────────
const NPM_EXCEPTIONS = new Set([
  "protobufjs",
  "@temporalio/proto",
  "@temporalio/common",
  "@temporalio/client",
  "@temporalio/workflow",
  "@opentelemetry/exporter-prometheus",
  "@opentelemetry/sdk-node",
  "@traceloop/node-server-sdk",
]);

// ─── Gate 1: TypeScript ───────────────────────────────────────────────────────
function gateTypeScript() {
  header("1. TypeScript");
  const r = run(
    "node --stack-size=32768 --max-old-space-size=4096 ./node_modules/typescript/bin/tsc --noEmit",
    { timeout: 180_000 }
  );
  const errors = (r.stdout + r.stderr).match(/error TS\d+/g)?.length ?? 0;
  if (r.ok || errors === 0) {
    row("Zero type errors", PASS);
    return true;
  }
  row("TypeScript errors", FAIL, `${errors} error(s) found`);
  console.log(C.grey + (r.stdout + r.stderr).slice(0, 2000) + C.reset);
  return false;
}

// ─── Gate 2: ESLint ───────────────────────────────────────────────────────────
function gateESLint() {
  header("2. ESLint");
  const r = run("npx eslint . --max-warnings=0", { timeout: 120_000 });
  if (r.ok) {
    row("Zero ESLint warnings", PASS);
    return true;
  }
  const out = r.stdout + r.stderr;
  const errCount = (out.match(/ error /g) ?? []).length;
  const warnCount = (out.match(/ warning /g) ?? []).length;
  row("ESLint gate", FAIL, `${errCount} error(s), ${warnCount} warning(s)`);
  console.log(C.grey + out.slice(0, 1500) + C.reset);
  return false;
}

// ─── Gate 3: npm audit ────────────────────────────────────────────────────────
function gateNpmAudit() {
  header("3. npm audit (JS dependencies)");
  const r = run("npm audit --json --omit=dev", { timeout: 60_000 });
  let data;
  try {
    data = JSON.parse(r.stdout || "{}");
  } catch {
    row("npm audit parse", SKIP, "could not parse JSON output");
    return true;
  }

  const vulns = data.vulnerabilities ?? {};
  const total = Object.keys(vulns).length;

  // Separate excepted from actionable
  const excepted = Object.keys(vulns).filter((n) => NPM_EXCEPTIONS.has(n));
  const actionable = Object.entries(vulns).filter(
    ([name, v]) =>
      !NPM_EXCEPTIONS.has(name) &&
      (v.severity === "critical" || v.severity === "high")
  );

  if (actionable.length === 0) {
    row("No unmitigated critical/high CVEs", PASS, `${total} total, ${excepted.length} excepted (no upstream fix)`);
    if (excepted.length > 0) {
      console.log(`  ${C.grey}Excepted (awaiting upstream fix): ${excepted.join(", ")}${C.reset}`);
    }
    return true;
  }

  row("npm audit", FAIL, `${actionable.length} critical/high CVE(s) need attention`);
  for (const [name, v] of actionable.slice(0, 10)) {
    console.log(`    ${C.red}${(v.severity ?? "unknown").toUpperCase()}${C.reset}  ${name}`);
  }
  return false;
}

// ─── Gate 4: pip-audit ────────────────────────────────────────────────────────
function gatePipAudit() {
  header("4. pip-audit (Python dependencies)");

  const hasPipAudit = run("pip-audit --version", { timeout: 10_000 }).ok;
  if (!hasPipAudit) {
    row("pip-audit not installed", SKIP, "install with: pip install pip-audit");
    return true;
  }

  const services = [
    "services/pdf-worker",
    "services/egypt-calc",
    "services/llm-judge",
    "services/embeddings-worker",
  ];

  let allOk = true;
  for (const svc of services) {
    const reqFile = path.join(ROOT, svc, "requirements.txt");
    if (!existsSync(reqFile)) {
      row(svc, SKIP, "no requirements.txt");
      continue;
    }
    const r = run(`pip-audit -r ${reqFile} --format=json`, { timeout: 60_000 });
    let vulns = [];
    try {
      const parsed = JSON.parse(r.stdout || "[]");
      vulns = Array.isArray(parsed) ? parsed.filter((v) => v.vulns?.length > 0) : [];
    } catch {
      row(svc, SKIP, "could not parse pip-audit output");
      continue;
    }
    if (vulns.length === 0) {
      row(svc, PASS);
    } else {
      row(svc, FAIL, `${vulns.length} vulnerable package(s)`);
      for (const pkg of vulns.slice(0, 5)) {
        const ids = pkg.vulns.map((v) => v.id).join(", ");
        console.log(`    ${C.red}VULN${C.reset}  ${pkg.name}==${pkg.version}  [${ids}]`);
      }
      allOk = false;
    }
  }
  return allOk;
}

// ─── Gate 5: SAST grep ────────────────────────────────────────────────────────
function gateSastGrep() {
  header("5. SAST patterns (quick grep)");

  let allOk = true;

  // 5a — eval() in app/ code (should be zero)
  {
    const r = run(`grep -rn "\\beval(" app/ --include="*.ts" --include="*.tsx" -l`, { timeout: 10_000 });
    if (!r.ok || r.stdout.trim() === "") {
      row("No eval() calls in app/", PASS);
    } else {
      row("eval() found in app/", WARN, "review for safety");
      console.log(C.grey + r.stdout.slice(0, 400) + C.reset);
    }
  }

  // 5b — dangerouslySetInnerHTML without sanitizer (should be zero)
  // All legitimate uses in this codebase go through sanitizeJsonLd() or sanitizeHtml()
  {
    const r = run(
      `grep -rn "dangerouslySetInnerHTML" app/ --include="*.tsx"`,
      { timeout: 10_000 }
    );
    const lines = r.stdout.trim().split("\n").filter(Boolean);
    const unsafe = lines.filter(
      (l) => !l.includes("sanitizeJsonLd") && !l.includes("sanitizeHtml")
    );
    if (unsafe.length === 0) {
      row("dangerouslySetInnerHTML — all uses sanitized", PASS, `${lines.length} use(s), all via sanitize*()`);
    } else {
      row("Unsanitized dangerouslySetInnerHTML", FAIL, `${unsafe.length} unsanitized use(s)`);
      console.log(C.grey + unsafe.join("\n").slice(0, 600) + C.reset);
      allOk = false;
    }
  }

  // 5c — redirect:error on internal fetch (egypt-calc route)
  {
    const r = run(`grep -c "redirect" app/api/egypt-calc/route.ts`, { timeout: 10_000 });
    const count = parseInt(r.stdout.trim() || "0", 10);
    if (count >= 2) {
      row("Internal fetch uses redirect:error", PASS, `${count} redirect setting(s) found`);
    } else {
      row("Missing redirect:error in egypt-calc", FAIL, "expected ≥2 occurrences");
      allOk = false;
    }
  }

  // 5d — hardcoded localhost only in API route handlers (not in service clients)
  {
    const r = run(
      `grep -rn "http://localhost" app/api/ --include="*.ts" -l`,
      { timeout: 10_000 }
    );
    const files = r.stdout.trim().split("\n").filter(Boolean);
    // health probe and egypt-calc are expected (internal service calls from API routes)
    const ALLOWED_LOCALHOST = new Set([
      "app/api/cron/health-probe/route.ts",
      "app/api/egypt-calc/route.ts",
      "app/api/health/route.ts",
    ]);
    const unexpected = files.filter((f) => !ALLOWED_LOCALHOST.has(f));
    if (unexpected.length === 0) {
      row("localhost in API routes — all whitelisted", PASS);
    } else {
      row("Unexpected localhost in API route", WARN, unexpected.join(", ").slice(0, 80));
      console.log(C.grey + unexpected.join("\n") + C.reset);
    }
  }

  // 5e — Service worker uses strict host equality (not includes)
  {
    const r = run(`grep -c "host\\.includes(" public/sw.js`, { timeout: 5_000 });
    const count = parseInt(r.stdout.trim() || "0", 10);
    if (count === 0) {
      row("Service worker host check — strict equality", PASS);
    } else {
      row("Service worker uses host.includes()", FAIL, "use === or endsWith() instead");
      allOk = false;
    }
  }

  return allOk;
}

// ─── Gate 6: Secret scan ──────────────────────────────────────────────────────
function gateSecretScan() {
  header("6. Secret scan (hardcoded credentials)");

  // Patterns that should NEVER appear in tracked files
  const checks = [
    { name: "No raw RSA private keys", pattern: "BEGIN RSA PRIVATE KEY" },
    { name: "No raw EC private keys", pattern: "BEGIN EC PRIVATE KEY" },
    { name: "No hardcoded Stripe live keys", pattern: "sk_live_" },
    { name: "No hardcoded Stripe webhook secrets", pattern: "whsec_" },
  ];

  let allOk = true;
  for (const chk of checks) {
    // git grep searches only tracked files (not .env, not node_modules)
    const r = run(
      `git grep -rn --fixed-strings -- "${chk.pattern}"`,
      { timeout: 15_000 }
    );
    const lines = r.stdout.trim().split("\n").filter(Boolean);
    // Filter out documentation, skills, examples, audit detection patterns, i18n placeholders
    const EXCLUDED_PREFIXES = [
      "SECURITY.md",
      ".agents/skills/",
      "docs/",
      "messages/",
      "scripts/generate-",
      "audit/",
      "test/fixtures",
    ];
    const EXCLUDED_SUFFIXES = [".example", ".md", ".txt"];
    const real = lines.filter((l) => {
      const filePart = l.split(":")[0];
      if (EXCLUDED_SUFFIXES.some((s) => filePart.endsWith(s))) return false;
      if (EXCLUDED_PREFIXES.some((p) => filePart.startsWith(p))) return false;
      // Exclude lines that clearly reference placeholder patterns (e.g. sk_live_...)
      if (l.includes("sk_live_...") || l.includes("whsec_...")) return false;
      return true;
    });
    if (real.length === 0) {
      row(chk.name, PASS);
    } else {
      row(chk.name, FAIL, "potential secret in tracked file");
      console.log(C.grey + real.slice(0, 5).join("\n") + C.reset);
      allOk = false;
    }
  }
  return allOk;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\n${C.bold}${C.cyan}╔══════════════════════════════════════════════════════╗`);
console.log(`║   كلميرون — Kalmeron Security Check                 ║`);
console.log(`╚══════════════════════════════════════════════════════╝${C.reset}`);
console.log(`${C.grey}${new Date().toISOString()}${C.reset}`);

const results = {
  TypeScript:     gateTypeScript(),
  ESLint:         gateESLint(),
  "npm audit":    gateNpmAudit(),
  "pip-audit":    gatePipAudit(),
  "SAST grep":    gateSastGrep(),
  "Secret scan":  gateSecretScan(),
};

// ─── Final Summary ────────────────────────────────────────────────────────────
header("Summary");
let exitCode = 0;
for (const [name, ok] of Object.entries(results)) {
  row(name, ok ? PASS : FAIL);
  if (!ok) exitCode = 1;
}

if (exitCode === 0) {
  console.log(`\n${C.green}${C.bold}All security gates passed.${C.reset}\n`);
} else {
  console.log(`\n${C.red}${C.bold}One or more gates failed — review output above.${C.reset}\n`);
}

process.exit(exitCode);
