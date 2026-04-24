import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Bumped from 0.1 → 0.2 (P0 quick win, audit recommendation).
    // 20% production sampling for richer p95 latency visibility on /api/chat.
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
}
