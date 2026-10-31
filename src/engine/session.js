import { tokenizeCode } from '../utils/tokenizer';

const characterCount = (text) => Array.from(text).length;

function appendExercise(state) {
  const exercise = state.pool[state.nextPoolIndex];
  const chunkId = state.chunks.length;
  const next = { ...state, nextPoolIndex: (state.nextPoolIndex + 1) % state.pool.length };
  if (state.config.category === 'words') {
    const words = exercise.code
      .trim()
      .split(/\s+/)
      .map((target) => ({ target, input: '', committed: false, separator: false, chunkId }));
    next.words = [...state.words, ...words];
    next.chunks = [
      ...state.chunks,
      { exercise, start: state.words.length, end: next.words.length },
    ];
  } else {
    const separator = chunkId
      ? [
          { char: '\n', automatic: true, chunkId },
          { char: '\n', automatic: true, chunkId },
        ]
      : [];
    const tokens = exercise.tokens || tokenizeCode(exercise.code, state.config.selectedLanguage);
    next.target = [
      ...state.target,
      ...separator,
      ...tokens.map((token) => ({ ...token, chunkId })),
    ];
    next.chunks = [
      ...state.chunks,
      { exercise, start: state.target.length + separator.length, end: next.target.length },
    ];
  }
  return next;
}

export function createSession(config, pool, initialIndex = 0) {
  if (!pool.length) throw new Error('A typing session needs at least one exercise.');
  const index = ((initialIndex % pool.length) + pool.length) % pool.length;
  let state = {
    config: {
      mode: 'snippet',
      duration: 60,
      category: 'code',
      autoIndent: true,
      masterMode: false,
      ...config,
    },
    pool,
    initialIndex: index,
    nextPoolIndex: index,
    status: 'idle',
    target: [],
    entries: [],
    words: [],
    wordIndex: 0,
    chunks: [],
    activeMs: 0,
    startedAt: null,
    now: 0,
    attempts: 0,
    correctAttempts: 0,
    omissions: 0,
    timeline: [],
    sampledErrors: 0,
    feedback: null,
    blockedAt: null,
    notice: '',
    finalStats: null,
  };
  state = appendExercise(state);
  return state.config.mode === 'time' ? appendExercise(state) : state;
}

export function elapsedAt(state, now = state.now) {
  return state.activeMs + (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt));
}

export function getStats(state, now = state.now) {
  let correctChars = 0,
    incorrectChars = 0,
    extraChars = 0,
    missedChars = 0,
    automaticChars = 0;
  if (state.config.category === 'words') {
    for (const word of state.words) {
      const target = Array.from(word.target);
      Array.from(word.input).forEach((char, i) => {
        if (i >= target.length) extraChars++;
        else if (char === target[i]) correctChars++;
        else incorrectChars++;
      });
      if (word.separator) correctChars++;
      if (word.committed) missedChars += Math.max(0, target.length - characterCount(word.input));
    }
  } else {
    state.entries.forEach((entry, i) => {
      if (entry.automatic) automaticChars++;
      else if (entry.char === state.target[i].char) correctChars++;
      else incorrectChars++;
    });
  }
  const elapsedMs = elapsedAt(state, now);
  const minutes = elapsedMs / 60000;
  const evaluated = state.attempts + state.omissions;
  return {
    wpm: minutes > 0 ? correctChars / 5 / minutes : 0,
    rawWpm: minutes > 0 ? state.attempts / 5 / minutes : 0,
    accuracy: evaluated ? (state.correctAttempts / evaluated) * 100 : 100,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    automaticChars,
    progress: state.config.category === 'words' ? state.wordIndex : state.entries.length,
    total: state.config.category === 'words' ? state.words.length : state.target.length,
    errorCount: state.attempts - state.correctAttempts + state.omissions,
    elapsedMs,
    timeTaken: elapsedMs / 1000,
    timeRemaining: Math.max(0, Math.ceil(state.config.duration - elapsedMs / 1000)),
  };
}

export function getCurrentExercise(state) {
  const chunkId =
    state.config.category === 'words'
      ? state.words[state.wordIndex]?.chunkId
      : state.target[state.entries.length]?.chunkId;
  return state.chunks[chunkId ?? state.chunks.length - 1].exercise;
}

function sample(state, terminal = false) {
  const stats = getStats(state);
  const time = terminal ? stats.timeTaken : Math.floor(stats.timeTaken);
  const previous = state.timeline.at(-1);
  if (!terminal && (time < 1 || previous?.time >= time)) return state;
  const point = {
    time,
    wpm: stats.wpm,
    rawWpm: stats.rawWpm,
    errors: stats.errorCount - state.sampledErrors,
  };
  const timeline =
    previous?.time === time
      ? [...state.timeline.slice(0, -1), { ...point, errors: previous.errors + point.errors }]
      : [...state.timeline, point];
  return { ...state, timeline, sampledErrors: stats.errorCount };
}

function finish(state) {
  if (state.status === 'completed') return state;
  const activeMs =
    state.config.mode === 'time'
      ? Math.min(elapsedAt(state), state.config.duration * 1000)
      : elapsedAt(state);
  const completed = sample({ ...state, status: 'completed', startedAt: null, activeMs }, true);
  return { ...completed, finalStats: { ...getStats(completed), timeline: completed.timeline } };
}

function start(state) {
  return state.status === 'running'
    ? state
    : { ...state, status: 'running', startedAt: state.now, notice: '' };
}

function recordAttempt(state, correct, keyType = 'regular', count = 1) {
  const next = {
    ...start(state),
    attempts: state.attempts + count,
    correctAttempts: state.correctAttempts + (correct ? count : 0),
    feedback: { correct, keyType },
    blockedAt: null,
  };
  if (!correct && state.config.masterMode) {
    return {
      ...createSession(state.config, state.pool, state.initialIndex),
      feedback: next.feedback,
      notice: 'Restarted after a mistake. Try again.',
    };
  }
  return next;
}

function continueStream(state) {
  if (state.config.mode !== 'time') return state;
  let next = state;
  if (state.config.category !== 'words') {
    const entries = [...state.entries];
    while (state.target[entries.length]?.automatic)
      entries.push({ char: state.target[entries.length].char, automatic: true });
    if (entries.length !== state.entries.length) next = { ...state, entries };
  }
  const position = state.config.category === 'words' ? next.wordIndex : next.entries.length;
  return position >= next.chunks.at(-1).start ? appendExercise(next) : next;
}

function insertWordCharacter(state, char) {
  const word = state.words[state.wordIndex];
  if (char === '\t') return state;
  if (char === ' ' || char === '\n') {
    if (!word.input) return state;
    let next = recordAttempt(state, true, char === ' ' ? 'space' : 'enter');
    const omissions = Math.max(0, characterCount(word.target) - characterCount(word.input));
    if (state.config.masterMode && word.input !== word.target) {
      return {
        ...createSession(state.config, state.pool, state.initialIndex),
        notice: 'Restarted after a mistake. Try again.',
        feedback: { correct: false, keyType: 'space' },
      };
    }
    const words = [...state.words];
    words[state.wordIndex] = {
      ...word,
      committed: true,
      separator: state.wordIndex < state.words.length - 1,
    };
    next = {
      ...next,
      words,
      wordIndex: state.wordIndex + 1,
      omissions: next.omissions + omissions,
    };
    return next.wordIndex === words.length ? finish(next) : continueStream(next);
  }
  const offset = characterCount(word.input);
  const correct = char === Array.from(word.target)[offset];
  let next = recordAttempt(state, correct);
  if (next.status === 'idle') return next;
  const words = [...state.words];
  words[state.wordIndex] = { ...word, input: word.input + char };
  next = { ...next, words };
  if (
    state.config.mode === 'snippet' &&
    state.wordIndex === words.length - 1 &&
    words[state.wordIndex].input === word.target
  ) {
    words[state.wordIndex] = { ...words[state.wordIndex], committed: true };
    return finish({ ...next, wordIndex: state.wordIndex + 1 });
  }
  return next;
}

export function canIndent(state) {
  if (state.config.category === 'words' || state.target[state.entries.length]?.char !== ' ')
    return false;
  let index = state.entries.length - 1;
  while (index >= 0 && state.target[index].char === ' ') index--;
  return index < 0 || state.target[index].char === '\n';
}

function insertCodeCharacter(state, char) {
  const index = state.entries.length;
  const target = state.target[index]?.char;
  if (target === undefined) return state;
  if (char === '\t') {
    if (!canIndent(state)) return state;
    const count = state.target[index + 1]?.char === ' ' ? 2 : 1;
    const next = recordAttempt(state, true, 'space', count);
    const entries = [
      ...state.entries,
      ...Array.from({ length: count }, () => ({ char: ' ', automatic: false })),
    ];
    return finishOrContinue({ ...next, entries });
  }
  const correct = char === target;
  const keyType = char === ' ' ? 'space' : char === '\n' ? 'enter' : 'regular';
  let next = recordAttempt(state, correct, keyType);
  if (next.status === 'idle') return next;
  // A misplaced Enter or a missing newline must not shift every following line.
  if (!correct && (char === '\n' || target === '\n')) return { ...next, blockedAt: index };
  const entries = [...state.entries, { char, automatic: false }];
  if (correct && char === '\n' && state.config.autoIndent) {
    while (state.target[entries.length]?.char === ' ') entries.push({ char: ' ', automatic: true });
  }
  next = { ...next, entries };
  return finishOrContinue(next);
}

function finishOrContinue(state) {
  return state.config.mode === 'snippet' && state.entries.length === state.target.length
    ? finish(state)
    : continueStream(state);
}

function backspace(state, wholeWord) {
  if (state.config.category === 'words') {
    let index = state.wordIndex;
    let word = state.words[index];
    if (!word?.input && index > 0) {
      index--;
      word = state.words[index];
      const words = [...state.words];
      words[index] = {
        ...word,
        input: wholeWord ? '' : word.input,
        committed: false,
        separator: false,
      };
      return {
        ...start(state),
        words,
        wordIndex: index,
        feedback: { correct: true, keyType: 'backspace' },
      };
    }
    if (!word?.input) return state;
    const words = [...state.words];
    words[index] = {
      ...word,
      input: wholeWord ? '' : Array.from(word.input).slice(0, -1).join(''),
    };
    return { ...start(state), words, feedback: { correct: true, keyType: 'backspace' } };
  }
  if (!state.entries.length) return state;
  let index = state.entries.length;
  while (index > 0 && state.entries[index - 1].automatic) index--;
  if (index > 0) index--;
  if (wholeWord) {
    while (
      index > 0 &&
      !/\s/.test(state.target[index - 1].char) &&
      !state.entries[index - 1].automatic
    )
      index--;
  }
  return {
    ...start(state),
    entries: state.entries.slice(0, index),
    blockedAt: null,
    feedback: { correct: true, keyType: 'backspace' },
  };
}

/** All accepted input is evaluated synchronously before the next browser event. */
export function sessionReducer(state, action) {
  if (action.type === 'configure')
    return { ...state, config: { ...state.config, ...action.config } };
  if (state.status === 'completed') return state;
  const now = action.now ?? state.now;
  if (
    state.status === 'running' &&
    state.config.mode === 'time' &&
    elapsedAt(state, now) >= state.config.duration * 1000
  ) {
    return finish({ ...state, now });
  }
  if (action.type === 'tick') return state.status === 'running' ? sample({ ...state, now }) : state;
  if (action.type === 'pause') {
    return state.status === 'running'
      ? { ...state, status: 'paused', activeMs: elapsedAt(state, now), startedAt: null, now }
      : state;
  }
  if (action.type === 'resume') return state.status === 'paused' ? start({ ...state, now }) : state;
  if (action.type === 'backspace') return backspace({ ...state, now }, action.wholeWord);
  if (action.type !== 'insert' || !action.text) return state;
  let next = { ...state, now };
  for (const char of action.text.replace(/\r\n?/g, '\n')) {
    if (next.status === 'completed') break;
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(char)) continue;
    next =
      next.config.category === 'words'
        ? insertWordCharacter(next, char)
        : insertCodeCharacter(next, char);
    if (next.notice) break;
  }
  return next;
}
