import { test, expect } from '@playwright/test';

for (const theme of ['dark', 'light']) {
  test(`${theme} layout fits its viewport and honors reduced motion`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (colorMode) =>
        localStorage.setItem(
          'devtype.preferences.v1',
          JSON.stringify({ version: 1, colorMode, soundEnabled: false }),
        ),
      theme,
    );
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('textbox', { name: 'Typing input' }).focus();
    await expect(page.getByRole('button', { name: 'Show keyboard' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(await page.evaluate(() => document.body.scrollWidth <= innerWidth)).toBe(true);
    if (testInfo.project.name === 'desktop') {
      const actions = await page.locator('.practice-actions').boundingBox();
      expect(actions.y + actions.height).toBeLessThan(768);
      expect(await page.evaluate(() => document.body.scrollHeight)).toBeLessThanOrEqual(768);
    }
    await page.screenshot({ path: testInfo.outputPath(`${theme}-practice.png`), fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
      await page
        .getByTestId('typing-caret')
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe('0s');
    await page.getByRole('button', { name: 'words', exact: true }).click();
    await page.getByRole('textbox', { name: 'Typing input' }).focus();
    await page.screenshot({ path: testInfo.outputPath(`${theme}-words.png`), fullPage: true });
  });
}
