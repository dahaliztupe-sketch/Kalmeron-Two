import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    // Sentry v10 -> v11 cross-version options. v11 removed
    // skipOpenTelemetrySetup (now the inverted enableOpenTelemetrySetup) and
    // replaced sendDefaultPii with dataCollection, whose default collects
    // MORE (HTTP bodies, cookies, GenAI inputs/outputs). Both spellings are
    // kept so runtime behaviour is identical on v10 and v11; unknown keys
    // are ignored by the SDK, and the Record type keeps both majors
    // typechecking.
    ...({
      skipOpenTelemetrySetup: true,
      enableOpenTelemetrySetup: false,
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: {
          request: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
          response: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
        },
        httpBodies: [],
        urlQueryParams: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
        genAI: { inputs: false, outputs: false },
        databaseQueryData: false,
        queues: false,
        graphQL: { document: false, variables: false },
      },
    } as Record<string, unknown>),
    environment: process.env.NODE_ENV,
  });
}
