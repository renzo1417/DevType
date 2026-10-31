import { LANGUAGES, DIFFICULTIES, CONTENT_CATEGORIES } from '../data/snippets';

export const PREFERENCES_KEY = 'devtype.preferences.v1';
export const DEFAULT_PREFERENCES = {
  category: 'code',
  selectedLanguage: 'javascript',
  difficulty: 'All',
  mode: 'time',
  duration: 60,
  colorMode: 'dark',
  themeId: 'amber',
  caretStyle: 'line',
  showKeyboard: false,
  showKeyHints: true,
  autoIndent: true,
  showWhitespace: true,
  masterMode: false,
  soundProfile: 'soft',
  soundVolume: 0.35,
  soundEnabled: true,
  completionSound: false,
};
const choices = {
  category: CONTENT_CATEGORIES.map((item) => item.id),
  selectedLanguage: LANGUAGES.map((item) => item.id),
  difficulty: DIFFICULTIES,
  mode: ['time', 'snippet'],
  duration: [15, 30, 60, 120],
  colorMode: ['dark', 'light'],
  themeId: ['amber', 'mint', 'blue', 'violet', 'mono'],
  caretStyle: ['line', 'block', 'underline'],
  soundProfile: ['soft', 'mechanical'],
};

export function validatePreferences(value) {
  const preferences = { ...DEFAULT_PREFERENCES };
  if (!value || typeof value !== 'object') return preferences;
  for (const key of Object.keys(preferences)) {
    if (choices[key]?.includes(value[key])) preferences[key] = value[key];
    else if (typeof preferences[key] === 'boolean' && typeof value[key] === 'boolean')
      preferences[key] = value[key];
    else if (key === 'soundVolume' && typeof value[key] === 'number' && Number.isFinite(value[key]))
      preferences[key] = Math.min(1, Math.max(0, value[key]));
  }
  return preferences;
}

export function readPreferences(storage) {
  try {
    const store = storage ?? window.localStorage;
    const saved = JSON.parse(store.getItem(PREFERENCES_KEY));
    if (saved?.version === 1) return validatePreferences(saved);
    const migrated = {};
    const legacy = {
      colorMode: 'color_mode',
      category: 'category',
      autoIndent: 'auto_indent',
      showWhitespace: 'show_whitespace',
    };
    for (const [key, suffix] of Object.entries(legacy)) {
      const value = store.getItem(`devtype_${suffix}`);
      if (value !== null)
        migrated[key] = typeof DEFAULT_PREFERENCES[key] === 'boolean' ? value === 'true' : value;
    }
    return validatePreferences(migrated);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences, storage) {
  try {
    (storage ?? window.localStorage).setItem(
      PREFERENCES_KEY,
      JSON.stringify({ version: 1, ...validatePreferences(preferences) }),
    );
    return true;
  } catch {
    return false;
  }
}
