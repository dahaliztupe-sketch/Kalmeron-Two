import { test, expect } from '@playwright/test';

const REQUIRED_HEADERS = [
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
];

test.describe('Security headers', () => {
  for (const path of ['/', '/pricing', '/auth/login']) {
    test(`required headers present on ${path}`, async ({ request }) => {
      const res = await request.get(path);
      const headers = res.headers();
      for (const h of REQUIRED_HEADERS) {
        expect(headers[h], `${h} missing on ${path}`).toBeTruthy();
      }
      const csp = headers['content-security-policy'] ?? headers['content-security-policy-report-only'];
      expect(csp, `CSP missing on ${path}`).toBeTruthy();
    });
  }

  test('no Server header leaks software version', async ({ request }) => {
    const res = await request.get('/');
    const server = res.headers()['server'] ?? '';
    expect(server.toLowerCase()).not.toMatch(/express|node|nginx\/\d/);
  });
});
