import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Kalmeron Two/);
});

test('user flow: chat redirection', async ({ page }) => {
  await page.goto('/');
  await page.click('text=ابدأ المهام الآن');
  await expect(page).toHaveURL(/.*chat/);
});
