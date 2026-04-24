import { test, expect } from '@playwright/test';

test.describe('Public API surface', () => {
  test('/api-docs page loads', async ({ page }) => {
    await page.goto('/api-docs');
    expect(page.url()).toContain('/api-docs');
  });

  test('OpenAPI spec is reachable and parseable', async ({ request }) => {
    const res = await request.get('/api-docs/openapi.yaml');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('openapi: 3.1.0');
    expect(text).toContain('Kalmeron Two');
  });

  test('health endpoint declines caching', async ({ request }) => {
    const res = await request.get('/api/health');
    const cc = res.headers()['cache-control'] ?? '';
    expect(cc.toLowerCase()).toContain('no-store');
  });
});
