/**
 * OpenLLMetry (Traceloop) bootstrap.
 *
 * Auto-instruments LLM SDK calls (OpenAI, Anthropic, Gemini via @ai-sdk/google,
 * LangChain, Mastra) and emits OpenTelemetry spans. The spans are exported
 * either to a self-hosted Traceloop / Phoenix collector (when
 * `TRACELOOP_BASE_URL` is set) or printed to console for local debugging
 * when `OTEL_LLM_TRACING=debug`.
 *
 * Opt-in: set `OTEL_LLM_TRACING=on` (or `=debug`) in the environment.
 * See `instrumentation.ts` for the boot wiring and
 * `docs/ECOSYSTEM_RESEARCH_2026-04-28.md` §8 for the rationale.
 */

// NOTE: `@traceloop/node-server-sdk` is an OPTIONAL peer dep — it is only
// installed in environments that opt in to LLM tracing (`OTEL_LLM_TRACING=on`).
// We avoid both static `import type` AND a literal `await import('pkg')` here
// because Turbopack/Webpack will eagerly try to resolve those at build time
// and fail when the package is absent. The indirection through a variable
// name keeps the bundler out of it; the import only runs at request time when
// tracing is explicitly enabled.

type InitializeOptions = {
  appName?: string;
  disableBatch?: boolean;
  baseUrl?: string;
  apiKey?: string;
  traceContent?: boolean;
};

let initialised = false;

export async function initOpenLLMetry(): Promise<void> {
  if (initialised) return;
  initialised = true;

  const pkg = '@traceloop/node-server-sdk';
  // Bundler-opaque dynamic import — the literal string never appears in a
  // static `import(...)` expression so Turbopack won't try to resolve it.
  const traceloop = (await import(/* webpackIgnore: true */ /* @vite-ignore */ pkg).catch((err) => {
     
    // traceloop package not installed — skipping OpenLLMetry init
    return null;
  })) as { initialize: (o: InitializeOptions) => void } | null;

  if (!traceloop) return;

  const debug = process.env.OTEL_LLM_TRACING === 'debug';
  const opts: InitializeOptions = {
    appName: process.env.OTEL_SERVICE_NAME || 'kalmeron-next',
    disableBatch: debug,
    // Don't double-instrument when the user has already set
    // OTEL_EXPORTER_OTLP_ENDPOINT — let upstream config win.
    baseUrl: process.env.TRACELOOP_BASE_URL,
    apiKey: process.env.TRACELOOP_API_KEY,
    // PII redaction: never ship raw user prompts off-box unless explicitly
    // allowed. Operators can flip this once their collector enforces RBAC.
    traceContent: process.env.OTEL_LLM_TRACE_CONTENT === 'on',
  };

  traceloop.initialize(opts);

  if (debug) {
     
    // OpenLLMetry initialised in debug mode
  }
}
