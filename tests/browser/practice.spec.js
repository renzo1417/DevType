import { test, expect } from '@playwright/test';
import { SNIPPETS, DEV_WORDS_SNIPPETS } from '../../src/data/snippets.js';

const firstCode = SNIPPETS.javascript[0].code;
async function openPractice(page, preferences = {}) {
  await page.addInitScript((settings) => {
    if (!localStorage.getItem('devtype.preferences.v1'))
      localStorage.setItem(
        'devtype.preferences.v1',
        JSON.stringify({
          version: 1,
          category: 'code',
          selectedLanguage: 'javascript',
          difficulty: 'Easy',
          mode: 'snippet',
          autoIndent: false,
          soundEnabled: false,
          ...settings,
        }),
      );
  }, preferences);
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Typing input' }).focus();
}
const type = (page, text) => page.keyboard.insertText(text);

test('a perfect 38-character snippet includes its final character and next advances once', async ({
  page,
}) => {
  await openPractice(page);
  expect(firstCode.length).toBe(38);
  await type(page, firstCode);
  await expect(page.getByRole('region', { name: 'Test results' })).toBeVisible();
  await expect(page.getByTestId('character-breakdown')).toHaveText('38 / 0 / 0 / 0');
  await expect(page.getByTestId('result-progress')).toContainText('38 characters completed');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Test results' })).toHaveCount(0);
  await expect(page.locator('.exercise-name')).toContainText(SNIPPETS.javascript[1].title);
});

test('words contain extras and omissions and can be corrected across word boundaries', async ({
  page,
}) => {
  await openPractice(page, { category: 'words', difficulty: 'All' });
  await type(page, 'componentx useSta   ');
  await expect(page.locator('.char-extra')).toHaveCount(1);
  await expect(page.locator('.char-missed')).toHaveCount(2);
  await expect(page.locator('.word-incorrect')).toHaveCount(2);
  await page.keyboard.press('Backspace');
  await type(page, 'te ');
  await expect(page.locator('[data-word="1"] .char-correct')).toHaveCount(8);
  await expect(page.locator('.char-missed')).toHaveCount(0);
  await expect(page.locator('.word-incorrect')).toHaveCount(1);
});

test('early Enter and a missing newline cannot shift subsequent code', async ({ page }) => {
  await openPractice(page, { autoIndent: true });
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-active="true"]')).toHaveAttribute('data-expected', 'f');
  await type(page, firstCode.split('\n')[0]);
  await type(page, 'x');
  await expect(page.locator('[data-active="true"]')).toHaveAttribute('data-expected', '\n');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-active="true"]')).toHaveAttribute('data-expected', 'r');
  await expect(page.locator('.char-automatic')).toHaveCount(2);
});

test('Tab reaches controls and typing while a button is focused does not edit the exercise', async ({
  page,
}) => {
  await openPractice(page);
  await type(page, 'f');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Restart typing test' })).toBeFocused();
  await page.keyboard.press('x');
  await expect(page.locator('.char-correct')).toHaveCount(1);
  await expect(page.locator('.char-incorrect')).toHaveCount(0);
  await page.keyboard.press('Enter');
  await expect(page.locator('.char-correct')).toHaveCount(0);
});

test('settings trap focus, Escape closes them, and focus is restored', async ({ page }) => {
  await openPractice(page);
  await type(page, 'f');
  const settings = page.getByRole('button', { name: 'Open settings' });
  await settings.click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press('Tab');
    expect(
      await page.getByRole('dialog').evaluate((dialog) => dialog.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(settings).toBeFocused();
  await expect(page.locator('.char-correct')).toHaveCount(1);
  await page.locator('.code-card').click();
  await type(page, 'u');
  await expect(page.locator('.char-correct')).toHaveCount(2);
});

test('timed sessions continue past a snippet and finish at the selected deadline', async ({
  page,
}) => {
  await page.clock.install();
  await openPractice(page, { mode: 'time', duration: 15 });
  await type(page, firstCode);
  await expect(page.getByRole('region', { name: 'Test results' })).toHaveCount(0);
  await expect(page.locator('.exercise-name')).toContainText(SNIPPETS.javascript[1].title);
  await page.clock.fastForward(15_100);
  await expect(page.getByRole('region', { name: 'Test results' })).toBeVisible();
  await expect(page.getByTestId('character-breakdown')).toHaveText('38 / 0 / 0 / 0');
  await expect(page.locator('.results-stats')).toContainText('15.0s');
});

test('paused time is excluded while a dialog is open', async ({ page }) => {
  await page.clock.install();
  await openPractice(page, { mode: 'time', duration: 15 });
  await type(page, 'f');
  await page.clock.fastForward(1000);
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.clock.fastForward(5000);
  await expect(page.getByTestId('time-remaining')).toHaveText('14s');
  await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Typing input' }).focus();
  await type(page, 'u');
  await page.clock.fastForward(1000);
  await expect(page.getByTestId('time-remaining')).toHaveText('13s');
});

test('mobile-style input and composition commit text once, while paste is blocked', async ({
  page,
}) => {
  await openPractice(page, { category: 'words', difficulty: 'All' });
  const input = page.getByRole('textbox', { name: 'Typing input' });
  await input.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    element.value = 'component';
    element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertCompositionText',
        data: 'component',
        isComposing: true,
      }),
    );
    element.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: 'component' }),
    );
    element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertFromComposition',
        data: 'component',
      }),
    );
  });
  await expect(page.locator('[data-word="0"] .char-correct')).toHaveCount(9);
  await expect(page.locator('.char-extra')).toHaveCount(0);
  expect(
    await input.evaluate((element) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', 'unwanted');
      return element.dispatchEvent(
        new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }),
      );
    }),
  ).toBe(false);
  await expect(page.locator('.char-extra')).toHaveCount(0);
  await type(page, ' useState');
  await expect(page.locator('[data-word="1"] .char-correct')).toHaveCount(8);
});

test('all supported virtual keys use the same controller, including shifted symbols', async ({
  page,
}) => {
  await openPractice(page, { category: 'symbols' });
  await page.getByRole('button', { name: 'Show keyboard' }).click();
  const keyboard = page.getByRole('group', { name: 'On-screen keyboard' });
  await keyboard.getByRole('button', { name: 'Shift', exact: true }).first().click();
  await keyboard.getByRole('button', { name: '9', exact: true }).click();
  await keyboard.getByRole('button', { name: 'Space', exact: true }).click();
  await keyboard.getByRole('button', { name: 'Shift', exact: true }).first().click();
  await keyboard.getByRole('button', { name: '0', exact: true }).click();
  await expect(page.locator('.char-correct')).toHaveCount(3);
  await expect(page.locator('.char-incorrect')).toHaveCount(0);
});

test('mute persists independently from the selected recording profile', async ({ page }) => {
  await openPractice(page);
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('button', { name: 'sound', exact: true }).click();
  await page.getByRole('button', { name: /^Mechanical/ }).click();
  await expect(page.getByRole('button', { name: 'Preview sound' })).toBeDisabled();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('button', { name: 'sound', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Mechanical/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('checkbox', { name: /^Keyboard sounds/ })).not.toBeChecked();
});

test('audio failures never block input or results', async ({ page }) => {
  await page.route('**/audio/keyboard/recordings.json', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await openPractice(page, { soundEnabled: true });
  await type(page, firstCode);
  await expect(page.getByTestId('character-breakdown')).toHaveText('38 / 0 / 0 / 0');
});

test('Change language focuses its actual selector, and clipboard failures are reported', async ({
  page,
  context,
}) => {
  await context.clearPermissions();
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Not allowed')) },
    }),
  );
  await openPractice(page);
  await type(page, firstCode);
  await page.getByRole('button', { name: 'Copy result' }).click();
  await expect(page.getByRole('status')).toContainText('Could not copy');
  await page.getByRole('button', { name: 'Change language' }).click();
  await expect(page.getByRole('combobox', { name: 'Language' })).toBeFocused();
  await page.getByRole('combobox', { name: 'Language' }).selectOption('python');
  await expect(page.locator('.exercise-name')).toContainText(SNIPPETS.python[0].title);
});

test('rapid typing preserves every letter and keeps the previous row visible', async ({ page }) => {
  test.setTimeout(45_000);
  await openPractice(page, { category: 'words', difficulty: 'All', mode: 'time', duration: 120 });
  await page.evaluate(() => document.fonts.ready);
  const text = DEV_WORDS_SNIPPETS[0].code.slice(0, 200);
  await page.keyboard.type(text, { delay: 80 });
  await expect(page.locator('.char-correct')).toHaveCount(text.replace(/ /g, '').length);
  await expect(page.locator('.char-incorrect')).toHaveCount(0);
  await expect
    .poll(() =>
      page.locator('.typing-caret').evaluate((caret) => {
        const viewport = caret.closest('.code-card').getBoundingClientRect();
        const bounds = caret.getBoundingClientRect();
        return bounds.top >= viewport.top + 10 && bounds.bottom <= viewport.bottom;
      }),
    )
    .toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
