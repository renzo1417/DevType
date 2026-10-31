import { describe, expect, it } from 'vitest';
import { createSession, getStats, sessionReducer } from './session';

const pool = [
  { id: 'a', title: 'First', code: 'abc', difficulty: 'Easy' },
  { id: 'b', title: 'Second', code: 'def', difficulty: 'Easy' },
];
const insert = (state, text, now = 1000) => sessionReducer(state, { type: 'insert', text, now });
const action = (state, type, now = 1000, extra = {}) =>
  sessionReducer(state, { type, now, ...extra });
const words = (text) => createSession({ category: 'words' }, [{ ...pool[0], code: text }]);

describe('positional typing', () => {
  it('includes the last character in final scoring and finishes once', () => {
    let state = insert(createSession({ autoIndent: false }, pool), 'a', 0);
    state = insert(state, 'bc', 2000);
    expect(state.status).toBe('completed');
    expect(state.finalStats).toMatchObject({
      correctChars: 3,
      progress: 3,
      wpm: 18,
      accuracy: 100,
    });
    expect(insert(state, 'x', 3000)).toBe(state);
    expect(action(state, 'tick', 4000)).toBe(state);
  });

  it('ignores navigation actions without starting the clock', () => {
    const state = createSession({}, pool);
    expect(action(state, 'ArrowRight')).toBe(state);
    expect(getStats(state).progress).toBe(0);
  });

  it('does not inflate net WPM or erase accuracy errors after correction', () => {
    let state = insert(createSession({}, pool), 'x', 0);
    state = action(state, 'backspace', 100);
    state = insert(state, 'a', 2000);
    expect(getStats(state)).toMatchObject({ correctChars: 1, wpm: 6, rawWpm: 12, accuracy: 50 });
  });

  it('blocks a premature Enter and requires Enter at a newline', () => {
    const exercise = [{ ...pool[0], code: 'a\nb' }];
    let state = insert(createSession({}, exercise), '\n', 0);
    expect(state.entries).toHaveLength(0);
    state = insert(state, 'a');
    state = insert(state, 'x');
    expect(state.entries).toHaveLength(1);
    state = insert(state, '\nb');
    expect(state.finalStats).toMatchObject({ progress: 3, correctChars: 3, errorCount: 2 });
  });

  it('counts auto-indentation as progress but excludes it from speed', () => {
    const exercise = [{ ...pool[0], code: 'a\n  b' }];
    let state = insert(createSession({}, exercise), 'a\n', 0);
    expect(state.entries).toHaveLength(4);
    expect(getStats(state)).toMatchObject({ correctChars: 2, automaticChars: 2, progress: 4 });
    state = action(state, 'backspace');
    expect(state.entries).toHaveLength(1);
    state = insert(state, '\nb', 2000);
    expect(state.finalStats).toMatchObject({ correctChars: 3, automaticChars: 2, progress: 5 });
  });

  it('accepts Tab only as leading indentation', () => {
    let state = createSession({ autoIndent: false }, [{ ...pool[0], code: '  a b' }]);
    state = insert(state, '\t', 0);
    expect(state.entries).toHaveLength(2);
    state = insert(state, 'a');
    expect(insert(state, '\t').entries).toHaveLength(3);
  });

  it('restarts master mode after an error', () => {
    const state = insert(createSession({ masterMode: true }, pool), 'x');
    expect(state.status).toBe('idle');
    expect(state.entries).toHaveLength(0);
    expect(state.notice).toContain('mistake');
  });
});

describe('free-flow words', () => {
  it('keeps extra and missing letters inside their word', () => {
    let state = insert(words('cat dog end'), 'cats d ', 0);
    expect(state.wordIndex).toBe(2);
    expect(state.words.map((w) => w.input)).toEqual(['cats', 'd', '']);
    expect(getStats(state)).toMatchObject({ extraChars: 1, missedChars: 2, errorCount: 3 });
  });

  it('cannot skip empty words using repeated spaces', () => {
    let state = insert(words('cat dog'), '   ', 0);
    expect(state.status).toBe('idle');
    expect(state.attempts).toBe(0);
    state = insert(state, 'cat   ');
    expect(state.wordIndex).toBe(1);
    expect(state.attempts).toBe(4);
  });

  it('allows returning to a committed word and correcting its extra letters', () => {
    let state = insert(words('cat dog'), 'cats ', 0);
    state = action(state, 'backspace');
    expect(state.wordIndex).toBe(0);
    state = action(state, 'backspace');
    expect(state.words[0].input).toBe('cat');
    expect(getStats(state).extraChars).toBe(0);
    expect(getStats(state).accuracy).toBeLessThan(100);
    state = insert(state, ' dog', 2000);
    expect(state.status).toBe('completed');
    expect(state.finalStats.correctChars).toBe(7);
  });

  it('commits the last incorrect word explicitly and scores omissions', () => {
    const state = insert(words('cat'), 'c ', 1000);
    expect(state.status).toBe('completed');
    expect(state.finalStats.missedChars).toBe(2);
    expect(state.finalStats.accuracy).toBe(50);
  });

  it('processes a committed composition once as a batch', () => {
    const state = insert(words('component state'), 'component');
    expect(state.words[0].input).toBe('component');
    expect(state.attempts).toBe(9);
  });
});

describe('time and session boundaries', () => {
  it('initializes a newly selected duration immediately', () => {
    expect(getStats(createSession({ mode: 'time', duration: 15 }, pool)).timeRemaining).toBe(15);
  });

  it('excludes paused time and resumes on the next input', () => {
    let state = insert(createSession({}, pool), 'a', 0);
    state = action(state, 'pause', 1000);
    state = action(state, 'tick', 9000);
    expect(getStats(state).elapsedMs).toBe(1000);
    state = insert(state, 'b', 10_000);
    state = action(state, 'tick', 11_000);
    expect(getStats(state).elapsedMs).toBe(2000);
  });

  it('continues code without restarting the clock and ignores structural separators in scoring', () => {
    let state = insert(createSession({ mode: 'time', duration: 15 }, pool), 'abc', 0);
    expect(state.status).toBe('running');
    expect(state.target[state.entries.length].char).toBe('d');
    state = insert(state, 'def', 1000);
    state = action(state, 'tick', 15_000);
    expect(state.finalStats).toMatchObject({ correctChars: 6, timeTaken: 15, accuracy: 100 });
  });

  it('continues words and rejects input after the deadline even before the next tick', () => {
    let state = createSession({ category: 'words', mode: 'time', duration: 15 }, pool);
    state = insert(state, 'abc ', 0);
    expect(state.words[state.wordIndex].target).toBe('def');
    state = insert(state, 'd', 15_001);
    expect(state.status).toBe('completed');
    expect(state.words[state.wordIndex].input).toBe('');
    expect(state.finalStats.timeTaken).toBe(15);
  });
});
