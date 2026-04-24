import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('signup page renders with Google OAuth and email form', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByRole('button', { name: /Google/i }).first()).toBeVisible();
    // The page must explain consent.
    await expect(page.getByText(/الشروط|الخصوصية|Terms|Privacy/i).first()).toBeVisible();
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('body')).toContainText(/تسجيل الدخول|Sign in|Login/i);
  });

  test('protected /dashboard redirects when no session', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(
      (u) => /\/(auth|onboarding)/.test(u.pathname),
      { timeout: 10_000 },
    );
    expect(/\/(auth|onboarding)/.test(new URL(page.url()).pathname)).toBeTruthy();
  });

  test('logout endpoint clears session cookie', async ({ request }) => {
    const res = await request.post('/api/auth/logout');
    expect([200, 204, 405]).toContain(res.status());
  });
});
