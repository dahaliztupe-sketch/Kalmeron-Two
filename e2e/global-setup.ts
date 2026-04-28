import type { FullConfig } from '@playwright/test';

/**
 * Pre-warm Next.js production routes before any test runs.
 *
 * Background
 * ----------
 * In CI we serve the built app with `next start`. The first request to a
 * given route compiles its server bundle on demand and can take 8-12 seconds
 * — comfortably longer than a single Playwright `expect` timeout (10s). The
 * symptom in CI was that the FIRST attempt of every cold route timed out,
 * the SECOND attempt (Playwright auto-retry) passed in <2s. We saw this on:
 *   • / (landing.spec.ts)
 *   • /auth/signup (onboarding.spec.ts)
 *   • /privacy (onboarding.spec.ts)
 *
 * Webserver readiness only verifies that `/` returns a 2xx response — it does
 * not warm any other route. By issuing one HTTP GET per slow route here we
 * pay the compile cost once, before tests start, so each test sees a hot
 * route and stays inside its 10s expect window.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL =
    process.env.PLAYWRIGHT_BASE_URL ||
    config.projects[0]?.use?.baseURL ||
    `http://localhost:${process.env.PORT || 5000}`;

  const routes = [
    '/',
    '/auth/signup',
    '/auth/login',
    '/privacy',
    '/terms',
    '/pricing',
    '/api-docs',
    '/api/health',
  ];

  // 30s per-route ceiling — production cold compile rarely exceeds 15s.
  const fetchOnce = async (path: string) => {
    const url = `${baseURL.replace(/\/$/, '')}${path}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30_000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, redirect: 'manual' });
      // 2xx-3xx = compiled successfully, 4xx still means the route exists and
      // compiled (e.g. /api/health may return 503 if degraded — both are fine).
      if (res.status >= 500) {
        // eslint-disable-next-line no-console
        console.warn(`[playwright:warmup] ${path} -> ${res.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        `[playwright:warmup] ${path} failed:`,
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      clearTimeout(t);
    }
  };

  // Sequential, not parallel: avoids saturating the dev server during the
  // very first cold start (which itself can be slower than a single hot
  // request).
  for (const r of routes) {
    await fetchOnce(r);
  }
}
