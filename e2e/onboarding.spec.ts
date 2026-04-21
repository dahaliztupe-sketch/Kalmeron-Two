import { test, expect } from '@playwright/test';

test.describe('تدفق التسجيل وإكمال الملف الشخصي', () => {
  test('صفحة التسجيل تظهر بشكل صحيح', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByText('انضم إلى كلميرون تو')).toBeVisible();
    await expect(page.getByRole('button', { name: /التسجيل باستخدام Google/i })).toBeVisible();
  });

  test('الصفحة الرئيسية تعرض محتوى التسويق للزوار', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/كلميرون|Kalmeron/i).first()).toBeVisible();
  });

  test('الداشبورد يُعيد التوجيه للتسجيل إذا لم يكن هناك جلسة', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL((url) =>
      url.pathname.includes('/auth/signup') || url.pathname.includes('/onboarding')
    , { timeout: 10000 });
    const pathname = new URL(page.url()).pathname;
    expect(['/auth/signup', '/onboarding'].some(p => pathname.includes(p))).toBeTruthy();
  });

  test('نقطة الصحة تستجيب بـ 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(['healthy', 'degraded']).toContain(body.status);
  });

  test('صفحة الخصوصية تحتوي على بيانات PDPL', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText(/PDPL|قانون.*151|حماية البيانات/i).first()).toBeVisible();
  });

  test('صفحة الشروط تحتوي على محتوى الاستخدام', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText(/شروط|Terms/i).first()).toBeVisible();
  });
});
