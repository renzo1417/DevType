import { expect, it } from 'vitest';
import { LANGUAGES, CONTENT_CATEGORIES, DIFFICULTIES } from '../data/snippets';
import { getExercisePool } from './exercises';

it('provides intact exercises for every category, language, and difficulty', () => {
  for (const { id: category } of CONTENT_CATEGORIES) {
    for (const { id: selectedLanguage } of LANGUAGES) {
      for (const difficulty of DIFFICULTIES) {
        const pool = getExercisePool({ category, selectedLanguage, difficulty });
        expect(pool.length).toBeGreaterThan(0);
        for (const exercise of pool) {
          expect(exercise.code.length).toBeGreaterThan(0);
          if (category !== 'words')
            expect(exercise.tokens.map((token) => token.char).join('')).toBe(exercise.code);
        }
      }
    }
  }
});
