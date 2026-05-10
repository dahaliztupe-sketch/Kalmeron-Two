---
name: sentry-monitoring
description: Sentry error monitoring and performance tracking for Next.js App Router. Use when setting up error tracking, performance monitoring, session replay, or when debugging production errors. Covers Kalmeron's monitoring strategy and alert configuration.
---

# Sentry Monitoring for Next.js App Router

Official patterns from Sentry engineering.

## Installation
```bash
npx @sentry/wizard@latest -i nextjs
# or manual:
npm install @sentry/nextjs
```

## Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.05,  // 5% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% of error sessions
  integrations: [Sentry.replayIntegration()],
  // Filter out known non-errors
  beforeSend(event) {
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') return null;
    return event;
  },
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.05, // 5% in production — cost control
  // Never send PII to Sentry
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

## Error Boundary Integration
```tsx
// components/ui/ErrorBoundary.tsx — add Sentry reporting
import * as Sentry from '@sentry/nextjs';

componentDidCatch(error: Error, info: React.ErrorInfo) {
  Sentry.captureException(error, {
    extra: { componentStack: info.componentStack },
    tags: { component: 'ErrorBoundary' },
  });
}
```

## Custom Error Capture (Kalmeron patterns)
```typescript
// app/api/chat/route.ts — capture AI errors
try {
  const response = await gemini.generateContent(prompt);
} catch (error) {
  Sentry.captureException(error, {
    tags: { service: 'gemini', agent: agentName },
    extra: { userId: session.user.id, promptLength: prompt.length },
    // Don't include the prompt itself (may contain PII)
  });
  return NextResponse.json({ error: 'AI service error' }, { status: 503 });
}

// Fawry payment errors
Sentry.captureException(error, {
  tags: { service: 'fawry', action: 'checkout' },
  extra: { amount, planId }, // no card numbers!
  user: { id: session.user.id }, // Sentry user context
});
```

## Performance Monitoring
```typescript
// Track custom transactions
const transaction = Sentry.startTransaction({ name: 'AI Agent Response', op: 'ai.inference' });
const span = transaction.startChild({ op: 'gemini.generate', description: agentName });
try {
  const result = await generateContent(prompt);
  span.setStatus('ok');
  return result;
} finally {
  span.finish();
  transaction.finish();
}
```

## Alerts Configuration (Recommended for Kalmeron)

| Alert | Threshold | Channel |
|---|---|---|
| Error rate spike | >10 errors/min | Slack #alerts |
| New error (first seen) | Any | Slack #dev |
| Payment failure | Any Fawry error | Slack #payments |
| AI service down | 3+ consecutive errors | PagerDuty |
| P95 response time | >3000ms | Slack #perf |

## Privacy Rules (MENA/GDPR)
- Never send user email or name to Sentry
- Scrub `authorization` headers in `beforeSend`
- Use `user: { id }` not `user: { email }`
- Enable data scrubbing in Sentry project settings
- For Egypt users: PDPL compliance — consider Sentry's EU data residency

## Environment Variables
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/yyy  # client
SENTRY_DSN=https://xxx@sentry.io/yyy              # server
SENTRY_ORG=your-org
SENTRY_PROJECT=kalmeron
SENTRY_AUTH_TOKEN=                                 # for source maps upload
```
