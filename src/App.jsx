import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Keyboard, Pause, Play, RotateCcw } from 'lucide-react';
import Header from './components/Header';
import ConfigBar from './components/ConfigBar';
import TypingArea from './components/TypingArea';
import VirtualKeyboard from './components/VirtualKeyboard';
import ResultsScreen from './components/ResultsScreen';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import { useTypingSession } from './hooks/useTypingSession';
import { getCurrentExercise } from './engine/session';
import { keyboardAudio } from './utils/audio';
import { readPreferences, savePreferences, validatePreferences } from './utils/preferences';

export default function App() {
  const [preferences, setPreferences] = useState(readPreferences);
  const preferencesRef = useRef(preferences);
  const [modal, setModal] = useState(null);
  const inputRef = useRef(null);
  const languageRef = useRef(null);
  const { session, stats, send, restart, nextExercise, configure } = useTypingSession(preferences);
  const focusInput = useCallback(
    () => requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true })),
    [],
  );
  const retry = useCallback(() => {
    restart();
    focusInput();
  }, [restart, focusInput]);
  const next = useCallback(() => {
    nextExercise();
    focusInput();
  }, [nextExercise, focusInput]);

  const changePreferences = useCallback(
    (patch) => {
      const updated = validatePreferences({ ...preferencesRef.current, ...patch });
      preferencesRef.current = updated;
      keyboardAudio.setOptions(updated);
      configure(updated);
      setPreferences(updated);
      savePreferences(updated);
    },
    [configure],
  );

  useEffect(() => {
    savePreferences(preferencesRef.current);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.colorMode;
    document.documentElement.dataset.accent = preferences.themeId;
    keyboardAudio.setOptions(preferences);
    if (preferences.soundEnabled && preferences.soundVolume > 0) keyboardAudio.preload();
  }, [preferences]);

  useEffect(() => {
    const shortcut = (event) => {
      if (modal || event.isComposing || event.repeat) return;
      const target = event.target;
      const otherInput =
        target.closest?.('input, select, textarea, [contenteditable="true"]') &&
        target !== inputRef.current;
      if (otherInput) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        retry();
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        next();
      } else if (
        event.key === 'Enter' &&
        session.status === 'completed' &&
        !target.closest?.('button, a')
      ) {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [modal, session.status, retry, next]);

  const openModal = (name) => {
    send({ type: 'pause' });
    setModal(name);
  };
  const exercise = getCurrentExercise(session);
  const word = session.words[session.wordIndex];
  const targetChar =
    preferences.category === 'words'
      ? Array.from(word?.target || '')[Array.from(word?.input || '').length] || ' '
      : session.target[session.entries.length]?.char;
  const changeLanguage = () => {
    changePreferences({ category: 'code' });
    restart();
    requestAnimationFrame(() => languageRef.current?.focus());
  };
  const virtualInput = (key, modifiers = {}) => {
    if (key === 'Backspace')
      send({ type: 'backspace', wholeWord: modifiers.ctrl || modifiers.alt });
    else if (key === 'Enter' && modifiers.ctrl) next();
    else send({ type: 'insert', text: key === 'Enter' ? '\n' : key === 'Tab' ? '\t' : key });
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="app-layout">
      <a className="skip-link" href="#practice">
        Skip to practice
      </a>
      <Header
        preferences={preferences}
        onChange={changePreferences}
        onSettings={() => openModal('practice')}
        onHome={retry}
      />
      <main id="practice" className="main-content">
        {session.status === 'completed' ? (
          <ResultsScreen
            session={session}
            stats={stats}
            onRestart={retry}
            onNext={next}
            onLanguage={changeLanguage}
          />
        ) : (
          <div className={`practice-workspace${session.status === 'running' ? ' is-running' : ''}`}>
            <h1 className="sr-only">Developer typing practice</h1>
            <ConfigBar
              preferences={preferences}
              onChange={changePreferences}
              languageRef={languageRef}
            />
            <div className="exercise-meta">
              <div className="exercise-name">
                <span className="exercise-marker" aria-hidden="true">
                  {preferences.category === 'code'
                    ? '</>'
                    : preferences.category === 'words'
                      ? 'Aa'
                      : '{}'}
                </span>
                <span>{exercise.title}</span>
                {preferences.masterMode && <span className="master-label">master</span>}
              </div>
              <div className="telemetry" aria-label="Live statistics">
                <div className="telemetry-item">
                  <span className="telemetry-label">wpm</span>
                  <span className="telemetry-value">
                    {stats.elapsedMs >= 1000 ? Math.round(stats.wpm) : '—'}
                  </span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">acc</span>
                  <span className="telemetry-value">{Math.round(stats.accuracy)}%</span>
                </div>
                <div className="telemetry-item timer-stat">
                  <span className="telemetry-label">time</span>
                  <span className="telemetry-value" data-testid="time-remaining">
                    {preferences.mode === 'time'
                      ? stats.timeRemaining
                      : Math.floor(stats.timeTaken)}
                    s
                  </span>
                </div>
              </div>
            </div>
            <TypingArea
              session={session}
              preferences={preferences}
              send={send}
              inputRef={inputRef}
            />
            <div className="practice-actions">
              <div className="session-actions">
                <button
                  className="text-button"
                  type="button"
                  aria-label="Restart typing test"
                  onClick={retry}
                >
                  <RotateCcw size={16} />
                  <span>restart</span>
                </button>
                <button className="text-button" type="button" onClick={next}>
                  <ArrowRight size={16} />
                  <span>next exercise</span>
                </button>
                <button
                  className="text-button pause-button"
                  type="button"
                  onPointerDown={(event) => event.preventDefault()}
                  disabled={session.status === 'idle'}
                  onClick={() => {
                    send({ type: session.status === 'running' ? 'pause' : 'resume' });
                    if (session.status === 'paused') focusInput();
                  }}
                >
                  {session.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}
                  <span>{session.status === 'paused' ? 'resume' : 'pause'}</span>
                </button>
              </div>
              <button
                className={`text-button keyboard-toggle ${preferences.showKeyboard ? 'is-active' : ''}`}
                type="button"
                aria-expanded={preferences.showKeyboard}
                onClick={() => changePreferences({ showKeyboard: !preferences.showKeyboard })}
              >
                <Keyboard size={17} />
                <span>{preferences.showKeyboard ? 'Hide keyboard' : 'Show keyboard'}</span>
              </button>
            </div>
            {preferences.showKeyboard && (
              <VirtualKeyboard
                targetChar={targetChar}
                showHints={preferences.showKeyHints}
                onVirtualKeyPress={virtualInput}
                inputRef={inputRef}
              />
            )}
          </div>
        )}
      </main>
      <footer className="app-footer">
        <div>
          <button type="button" onClick={() => openModal('about')}>
            about
          </button>
          <span className="footer-dot">·</span>
          <button type="button" onClick={() => openModal('shortcuts')}>
            keyboard shortcuts
          </button>
        </div>
        <div className="footer-shortcuts">
          <span>
            <kbd>esc</kbd> restart
          </span>
          <span>
            <kbd>ctrl</kbd> + <kbd>enter</kbd> next
          </span>
        </div>
      </footer>
      {modal === 'about' ? (
        <AboutModal onClose={() => setModal(null)} />
      ) : (
        modal && (
          <SettingsModal
            preferences={preferences}
            onChange={changePreferences}
            initialTab={modal}
            onClose={() => setModal(null)}
          />
        )
      )}
    </div>
  );
}
