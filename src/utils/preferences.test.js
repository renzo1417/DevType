import { expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_KEY,
  readPreferences,
  savePreferences,
  validatePreferences,
} from './preferences';
const storage = (values) => ({
  getItem: (key) => values[key] ?? null,
  setItem: (key, value) => {
    values[key] = value;
  },
});
it('migrates legacy settings and saves validated, versioned preferences', () => {
  const values = {
    devtype_color_mode: 'light',
    devtype_category: 'words',
    devtype_auto_indent: 'false',
  };
  const store = storage(values);
  const preferences = readPreferences(store);
  expect(preferences).toMatchObject({
    colorMode: 'light',
    category: 'words',
    autoIndent: false,
    soundVolume: 0.35,
  });
  savePreferences(preferences, store);
  expect(JSON.parse(values[PREFERENCES_KEY]).version).toBe(1);
  expect(readPreferences(store)).toEqual(preferences);
});
it('rejects corrupt values and unsupported choices', () => {
  expect(
    validatePreferences({
      category: 'bad',
      duration: -1,
      soundVolume: Infinity,
      showKeyboard: 'true',
      extra: true,
    }),
  ).toEqual(DEFAULT_PREFERENCES);
  expect(readPreferences(storage({ [PREFERENCES_KEY]: '{invalid' }))).toEqual(DEFAULT_PREFERENCES);
  expect(validatePreferences({ soundVolume: 20 }).soundVolume).toBe(1);
});
it('survives disabled storage', () => {
  const store = {
    getItem() {
      throw new Error('Blocked');
    },
    setItem() {
      throw new Error('Full');
    },
  };
  expect(readPreferences(store)).toEqual(DEFAULT_PREFERENCES);
  expect(savePreferences(DEFAULT_PREFERENCES, store)).toBe(false);
});
