import { test, expect } from '@playwright/test';

test('changing duration immediately resets the displayed time', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '15s', exact: true }).click();
  const timer = page
    .locator('.telemetry-item')
    .filter({ has: page.getByText('time', { exact: true }) });
  await expect(timer.locator('.telemetry-value')).toHaveText('15s');
});

test('ArrowRight cannot insert an error or advance typing', async ({ page }) => {
  await page.goto('/');
  await page.locator('.code-card').click();
  const first = await page.locator('.code-char').first().textContent();
  await page.keyboard.type(first);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.char-incorrect')).toHaveCount(0);
});
