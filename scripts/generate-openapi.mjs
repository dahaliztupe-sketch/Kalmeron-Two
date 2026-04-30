#!/usr/bin/env node
/**
 * Pull live OpenAPI 3.1 specs from each FastAPI microservice and write them
 * into `docs/api/services/<name>.openapi.json` as a versioned, reviewable
 * source-of-truth contract.
 *
 * The generated TypeScript clients in `src/lib/api-clients/` derive from
 * these files via `scripts/generate-api-clients.mjs`. Run both whenever a
 * Python service's request/response shape changes:
 *
 *   npm run codegen:openapi
 *   npm run codegen:clients
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUT_DIR = join(REPO_ROOT, "docs", "api", "services");

const SERVICES = [
  { name: "pdf-worker",        port: 8000 },
  { name: "egypt-calc",        port: 8008 },
  { name: "llm-judge",         port: 8080 },
  { name: "embeddings-worker", port: 8099 },
];

await mkdir(OUT_DIR, { recursive: true });

let failed = 0;
for (const svc of SERVICES) {
  const url = `http://localhost:${svc.port}/openapi.json`;
  process.stdout.write(`→ ${svc.name.padEnd(20)} ${url} ... `);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const spec = await res.json();
    const out = join(OUT_DIR, `${svc.name}.openapi.json`);
    await writeFile(out, JSON.stringify(spec, null, 2) + "\n", "utf8");
    console.log(`ok (${(JSON.stringify(spec).length / 1024).toFixed(1)} KiB)`);
  } catch (err) {
    failed++;
    console.log(`FAILED: ${err.message}`);
    console.error(`  hint: make sure the "${svc.name}" workflow is running`);
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${SERVICES.length} service(s) failed.`);
  process.exit(1);
}
console.log(`\nWrote ${SERVICES.length} spec(s) to ${OUT_DIR}`);
