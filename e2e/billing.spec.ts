import { test, expect } from '@playwright/test';

test.describe('Billing & quotas', () => {
  test('pricing page renders 3 tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toContainText(/مجاني|Free/i);
    await expect(page.locator('body')).toContainText(/Pro|محترف/i);
    await expect(page.locator('body')).toContainText(/شركات|Enterprise/i);
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
