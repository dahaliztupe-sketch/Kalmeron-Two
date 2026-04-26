#!/usr/bin/env tsx
/**
 * Pre-demo health check — run this from the terminal before showing
 * the platform to investors. Exits with code 1 if anything critical is broken.
 *
 * Usage:
 *   npx tsx scripts/pre-demo-check.ts
 *   npx tsx scripts/pre-demo-check.ts --base http://localhost:5000
 */

const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const BASE =
  baseIdx >= 0 && args[baseIdx + 1]
    ? args[baseIdx + 1]!
    : process.env.PRE_DEMO_BASE_URL || "http://localhost:5000";

const COLOR = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function line() {
  console.log(COLOR.gray + "─".repeat(70) + COLOR.reset);
}

interface SidecarStatus {
  name: string;
  role: string;
  url: string;
  critical: boolean;
  ok: boolean;
  latencyMs: number | null;
  detail?: string;
}
interface EnvStatus {
  key: string;
  label: string;
  critical: boolean;
  set: boolean;
}
interface HealthResponse {
  ok: boolean;
  readyForDemo: boolean;
  readinessScore: number;
  sidecars: SidecarStatus[];
  environment: EnvStatus[];
  summary: {
    sidecarsTotal: number;
    sidecarsHealthy: number;
    envTotal: number;
    envSet: number;
    criticalSidecarFailures: number;
    criticalEnvMissing: number;
  };
}

async function main() {
  console.log(`${COLOR.bold}${COLOR.cyan}Kalmeron — Pre-Demo Check${COLOR.reset}`);
  console.log(`${COLOR.gray}Target: ${BASE}${COLOR.reset}`);
  line();

  let data: HealthResponse;
  try {
    const res = await fetch(`${BASE}/api/investor/health`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(
        `${COLOR.red}✗${COLOR.reset} health endpoint returned HTTP ${res.status}`,
      );
      process.exit(1);
    }
    data = (await res.json()) as HealthResponse;
  } catch (err) {
    console.error(
      `${COLOR.red}✗ unable to reach ${BASE}/api/investor/health${COLOR.reset}`,
    );
    console.error(
      `  ${COLOR.gray}${err instanceof Error ? err.message : String(err)}${COLOR.reset}`,
    );
    console.error(
      `\n  ${COLOR.yellow}Tip:${COLOR.reset} make sure the Next.js dev server is running on port 5000.`,
    );
    process.exit(1);
  }

  // Sidecars
  console.log(`${COLOR.bold}Sidecars${COLOR.reset}`);
  for (const s of data.sidecars) {
    const icon = s.ok ? `${COLOR.green}✓${COLOR.reset}` : `${COLOR.red}✗${COLOR.reset}`;
    const tag = s.critical ? `${COLOR.yellow}[critical]${COLOR.reset}` : "";
    const latency = s.ok ? `${COLOR.gray}${s.latencyMs}ms${COLOR.reset}` : `${COLOR.gray}${s.detail ?? ""}${COLOR.reset}`;
    console.log(`  ${icon} ${s.name.padEnd(22)} ${tag.padEnd(12)} ${latency}`);
  }
  line();

  // Env
  console.log(`${COLOR.bold}Environment Variables${COLOR.reset}`);
  for (const e of data.environment) {
    const icon = e.set ? `${COLOR.green}✓${COLOR.reset}` : e.critical ? `${COLOR.red}✗${COLOR.reset}` : `${COLOR.gray}○${COLOR.reset}`;
    const tag = e.critical ? `${COLOR.yellow}[critical]${COLOR.reset}` : "";
    console.log(`  ${icon} ${e.key.padEnd(38)} ${tag}`);
  }
  line();

  const ready = data.readyForDemo;
  const score = data.readinessScore;
  const summary = data.summary;

  console.log(
    `${COLOR.bold}Score:${COLOR.reset} ${
      ready ? COLOR.green : score >= 60 ? COLOR.yellow : COLOR.red
    }${score}/100${COLOR.reset}`,
  );
  console.log(
    `${COLOR.bold}Sidecars:${COLOR.reset} ${summary.sidecarsHealthy}/${summary.sidecarsTotal} healthy`,
  );
  console.log(
    `${COLOR.bold}Env vars:${COLOR.reset} ${summary.envSet}/${summary.envTotal} set`,
  );

  if (ready) {
    console.log(`\n${COLOR.green}${COLOR.bold}✓ READY FOR DEMO${COLOR.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${COLOR.red}${COLOR.bold}✗ NOT READY${COLOR.reset}`);
    if (summary.criticalSidecarFailures > 0) {
      console.log(
        `  ${COLOR.red}${summary.criticalSidecarFailures} critical sidecar(s) down${COLOR.reset}`,
      );
    }
    if (summary.criticalEnvMissing > 0) {
      console.log(
        `  ${COLOR.red}${summary.criticalEnvMissing} critical env var(s) missing${COLOR.reset}`,
      );
    }
    console.log("");
    process.exit(1);
  }
}

void main();
