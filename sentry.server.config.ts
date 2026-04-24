import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV,
    // Avoid double OpenTelemetry setup when Langfuse / @vercel/otel are present
    skipOpenTelemetrySetup: true,
  });
}
