import {
  SNIPPETS,
  KEYWORDS_SNIPPETS,
  DEV_WORDS_SNIPPETS,
  SYMBOLS_SNIPPETS,
} from '../data/snippets';
import { tokenizeCode } from '../utils/tokenizer';

const preparedPools = new Map();

export function getExercisePool({ category, selectedLanguage, difficulty }) {
  const key = `${category}:${selectedLanguage}:${difficulty}`;
  if (preparedPools.has(key)) return preparedPools.get(key);
  const collections = {
    code: SNIPPETS[selectedLanguage],
    keywords: KEYWORDS_SNIPPETS[selectedLanguage],
    words: DEV_WORDS_SNIPPETS,
    symbols: SYMBOLS_SNIPPETS,
  };
  const available = collections[category] || SNIPPETS.javascript;
  const filtered = available.filter(
    (exercise) => difficulty === 'All' || exercise.difficulty === difficulty,
  );
  const pool = (filtered.length ? filtered : available).map((exercise) => ({
    ...exercise,
    tokens: category === 'words' ? [] : tokenizeCode(exercise.code, selectedLanguage),
  }));
  preparedPools.set(key, pool);
  return pool;
}
