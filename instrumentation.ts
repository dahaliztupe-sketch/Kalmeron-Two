// Next.js instrumentation hook — runs once at boot, before any route
// handler. Used for two things:
//   1. Aliasing GEMINI_API_KEY → the names @ai-sdk/google expects.
//   2. Wiring observability: Sentry (always) + OpenLLMetry (opt-in).

export async function register() {
  // Make the Gemini key visible to @ai-sdk/google (which expects GOOGLE_GENERATIVE_AI_API_KEY)
  if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  }
  if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    // OpenLLMetry — auto-instruments OpenAI / Anthropic / Gemini / LangChain
    // SDK calls and emits OpenTelemetry spans. Opt-in so the dev path stays
    // zero-config; flip OTEL_LLM_TRACING=on to enable.
    if (process.env.OTEL_LLM_TRACING === 'on') {
      try {
        const { initOpenLLMetry } = await import('./src/lib/observability/openllmetry');
        await initOpenLLMetry();
      } catch (err) {
        // Never let observability bring the app down — log and continue.
         
        console.warn('[openllmetry] failed to initialise:', err);
      }
    }
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs';
