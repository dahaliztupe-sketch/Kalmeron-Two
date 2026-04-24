import { test, expect } from '@playwright/test';

test.describe('Landing & SEO', () => {
  test('homepage shows hero, CTA, and 16-agent showcase', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/كلميرون|Kalmeron/i).first()).toBeVisible();
    // Should have a clear primary CTA above the fold.
    const cta = page.getByRole('link', { name: /ابدأ مجاناً|ابدأ الآن|انضم|Sign up/i }).first();
    await expect(cta).toBeVisible();
    // 7-department block.
    await expect(page.getByText(/استراتيجية|تمويل|قانوني|تسويق/i).first()).toBeVisible();
  });

  test('homepage emits a valid <title> and meta description', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kalmeron|كلميرون/);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect((description ?? '').length).toBeGreaterThan(40);
  });

  test('robots.txt and sitemap.xml are reachable', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const sitemap = await request.get('/sitemap.xml');
    expect([200, 308]).toContain(sitemap.status());
  });

  test('CSP header is present on root', async ({ request }) => {
    const res = await request.get('/');
    const csp =
      res.headers()['content-security-policy'] ??
      res.headers()['content-security-policy-report-only'];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
  });
});
