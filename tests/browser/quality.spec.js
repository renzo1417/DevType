import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { DEV_WORDS_SNIPPETS } from '../../src/data/snippets.js';

async function open(page, preferences = {}) {
  await page.addInitScript(
    (settings) =>
      localStorage.setItem(
        'devtype.preferences.v1',
        JSON.stringify({ version: 1, category: 'words', mode: 'time', duration: 120, ...settings }),
      ),
    preferences,
  );
  await page.goto('/');
}

test('recorded sounds load once, overlap, and stop immediately on mute', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/recordings.json')) requests.push(request.url());
  });
  await open(page, { soundEnabled: true });
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('button', { name: 'sound', exact: true }).click();
  await page.getByRole('button', { name: 'Preview sound' }).click();
  await expect
    .poll(() =>
      page.evaluate(async () => (await import('/src/utils/audio.js')).keyboardAudio.getStatus()),
    )
    .toBe('ready');
  await page.evaluate(async () => {
    const { keyboardAudio } = await import('/src/utils/audio.js');
    const play = keyboardAudio.play.bind(keyboardAudio);
    window.recordedPlayback = [];
    keyboardAudio.play = (...args) => {
      const played = play(...args);
      window.recordedPlayback.push({
        played,
        voices: keyboardAudio.sources.size,
        context: keyboardAudio.context.state,
        status: keyboardAudio.getStatus(),
      });
      return played;
    };
  });
  await page.getByRole('button', { name: 'Preview sound' }).click();
  await expect
    .poll(() => page.evaluate(() => window.recordedPlayback.filter((call) => call.played).length))
    .toBe(3);
  const playback = await page.evaluate(async () => {
    const { keyboardAudio } = await import('/src/utils/audio.js');
    return {
      voices: Math.max(...window.recordedPlayback.map((call) => call.voices)),
      buffers: keyboardAudio.buffers.filter(Boolean).length,
      context: keyboardAudio.context.state,
      calls: window.recordedPlayback,
    };
  });
  expect(playback.buffers).toBe(32);
  expect(playback.voices, JSON.stringify(playback)).toBeGreaterThan(1);
  expect(playback.context).toBe('running');
  await page.getByRole('checkbox', { name: 'Keyboard sounds', exact: true }).uncheck();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const { keyboardAudio } = await import('/src/utils/audio.js');
        return { voices: keyboardAudio.sources.size, gain: keyboardAudio.master.gain.value };
      }),
    )
    .toEqual({ voices: 0, gain: 0 });
  expect(requests).toHaveLength(1);
  await expect(page.getByRole('button', { name: 'Preview sound' })).toBeDisabled();
});

test('unmuting from zero volume restores an audible level', async ({ page }) => {
  await open(page, { soundEnabled: true, soundVolume: 0 });
  await page.getByRole('button', { name: 'Unmute keyboard sounds' }).click();
  await expect(page.getByRole('button', { name: 'Mute keyboard sounds' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('devtype.preferences.v1')).soundVolume,
    ),
  ).toBe(0.35);
});

test('typing does not wait for pending sound downloads', async ({ page }) => {
  const pending = [];
  await page.route('**/audio/keyboard/recordings.json', (route) => {
    pending.push(route);
  });
  await open(page, { soundEnabled: true });
  await page.getByRole('textbox', { name: 'Typing input' }).focus();
  await page.keyboard.insertText('component');
  await expect(page.locator('[data-word="0"] .char-correct')).toHaveCount(9);
  expect(pending.length).toBeGreaterThan(0);
  await Promise.all(pending.map((route) => route.abort()));
});

test('input reaches a frame without per-keystroke long tasks', async ({ page }, testInfo) => {
  await open(page, { soundEnabled: true });
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('textbox', { name: 'Typing input' }).focus();
  await page.evaluate(() => {
    window.typingProbe = { frames: [], longTasks: [] };
    new PerformanceObserver((list) =>
      window.typingProbe.longTasks.push(...list.getEntries().map((entry) => entry.duration)),
    ).observe({ type: 'longtask' });
    document.addEventListener(
      'beforeinput',
      () => {
        const start = performance.now();
        requestAnimationFrame(() => window.typingProbe.frames.push(performance.now() - start));
      },
      { capture: true },
    );
  });
  const text = DEV_WORDS_SNIPPETS[0].code.slice(0, 180);
  await page.keyboard.type(text);
  await expect(page.locator('.char-correct')).toHaveCount(text.replace(/ /g, '').length);
  await expect.poll(() => page.evaluate(() => window.typingProbe.frames.length)).toBe(text.length);
  const report = await page.evaluate(() => {
    const { frames, longTasks } = window.typingProbe;
    frames.sort((a, b) => a - b);
    return {
      inputCount: frames.length,
      medianMs: frames[Math.floor(frames.length / 2)],
      p95Ms: frames[Math.floor(frames.length * 0.95)],
      maxMs: frames.at(-1),
      longTasks,
    };
  });
  const reportPath = testInfo.outputPath('input-performance.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  await testInfo.attach('input-performance.json', {
    path: reportPath,
    contentType: 'application/json',
  });
  expect(report.p95Ms).toBeLessThan(50);
  expect(report.longTasks).toEqual([]);
});

test('the visible exercise is available to assistive technology', async ({ page }) => {
  await open(page, { soundEnabled: false });
  await expect(page.getByRole('textbox', { name: 'Typing input' })).toHaveAccessibleDescription(
    /Current exercise: component useState useEffect/,
  );
});
