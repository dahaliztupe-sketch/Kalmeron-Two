import { test, expect } from '@playwright/test';

test.describe('Billing & quotas', () => {
  test('pricing page is honest: no price decided', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toContainText('الأسعار لم تُحدَّد بعد');
    await expect(page.locator('body')).not.toContainText(/399|\$15/);
  });

  test('Stripe webhook endpoint rejects unsigned payload', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: { fake: true },
      headers: { 'content-type': 'application/json' },
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test('checkout endpoint requires auth', async ({ request }) => {
    const res = await request.post('/api/billing/checkout', {
      data: { priceId: 'price_x' },
    });
    expect([401, 403]).toContain(res.status());
  });
});
