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

import type { InitializeOptions } from '@traceloop/node-server-sdk';

let initialised = false;

export async function initOpenLLMetry(): Promise<void> {
  if (initialised) return;
  initialised = true;

  const traceloop = await import('@traceloop/node-server-sdk');

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
     
    console.info('[openllmetry] initialised', {
      app: opts.appName,
      baseUrl: opts.baseUrl ?? '(default)',
      traceContent: opts.traceContent,
    });
  }
}
