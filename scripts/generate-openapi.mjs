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

// S009 — Network data written to file mitigation:
// Validate that the fetched data is a well-formed OpenAPI 3.x JSON object
// before writing it to disk. This guards against a compromised sidecar
// serving malicious content that could be later read by automated tooling.
const MAX_SPEC_BYTES = 2 * 1024 * 1024; // 2 MiB sanity cap

function validateOpenApiSpec(raw) {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("spec is not a JSON object");
  }
  const openapi = raw.openapi ?? raw.swagger;
  if (typeof openapi !== "string" || !openapi.match(/^\d+\.\d/)) {
    throw new Error(`missing or invalid openapi/swagger version: ${openapi}`);
  }
  if (typeof raw.info !== "object" || !raw.info) {
    throw new Error("missing required 'info' field");
  }
  return true;
}

let failed = 0;
for (const svc of SERVICES) {
  const url = `http://localhost:${svc.port}/openapi.json`;
  process.stdout.write(`→ ${svc.name.padEnd(20)} ${url} ... `);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Guard against huge responses before parsing
    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_SPEC_BYTES) {
      throw new Error(`response too large: ${contentLength} bytes`);
    }
    const rawText = await res.text();
    if (rawText.length > MAX_SPEC_BYTES) {
      throw new Error(`spec body too large: ${rawText.length} bytes`);
    }

    const spec = JSON.parse(rawText);
    validateOpenApiSpec(spec);

    const out = join(OUT_DIR, `${svc.name}.openapi.json`);
    await writeFile(out, JSON.stringify(spec, null, 2) + "\n", "utf8");
    console.log(`ok (${(rawText.length / 1024).toFixed(1)} KiB)`);
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
