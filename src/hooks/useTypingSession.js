import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getExercisePool } from '../engine/exercises';
import { createSession, getStats, sessionReducer } from '../engine/session';
import { keyboardAudio } from '../utils/audio';

const resetFields = ['category', 'selectedLanguage', 'difficulty', 'mode', 'duration'];

export function useTypingSession(initialPreferences) {
  const preferencesRef = useRef(initialPreferences);
  const [session, setSession] = useState(() =>
    createSession(initialPreferences, getExercisePool(initialPreferences)),
  );
  const sessionRef = useRef(session);
  const replace = useCallback((next) => {
    sessionRef.current = next;
    setSession(next);
  }, []);
  const send = useCallback(
    (action) => {
      const previous = sessionRef.current;
      const next = sessionReducer(previous, { ...action, now: performance.now() });
      if (next === previous) return;
      replace(next);
      if (next.feedback && next.feedback !== previous.feedback)
        keyboardAudio.play(next.feedback.keyType);
      if (previous.status !== 'completed' && next.status === 'completed') keyboardAudio.complete();
    },
    [replace],
  );
  const restart = useCallback(() => {
    const previous = sessionRef.current;
    replace(createSession(preferencesRef.current, previous.pool, previous.initialIndex));
  }, [replace]);
  const nextExercise = useCallback(() => {
    const previous = sessionRef.current;
    replace(createSession(preferencesRef.current, previous.pool, previous.initialIndex + 1));
  }, [replace]);
  const configure = useCallback(
    (preferences) => {
      const previous = preferencesRef.current;
      preferencesRef.current = preferences;
      if (resetFields.some((key) => previous[key] !== preferences[key]))
        replace(createSession(preferences, getExercisePool(preferences)));
      else send({ type: 'configure', config: preferences });
    },
    [replace, send],
  );
  useEffect(() => {
    if (session.status !== 'running') return;
    const timer = setInterval(() => send({ type: 'tick' }), 100);
    return () => clearInterval(timer);
  }, [session.status, send]);
  useEffect(() => {
    const pause = () => send({ type: 'pause' });
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [send]);
  const stats = useMemo(() => session.finalStats || getStats(session), [session]);
  return { session, stats, send, restart, nextExercise, configure };
}
