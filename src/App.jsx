import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ConfigBar from './components/ConfigBar';
import TypingArea from './components/TypingArea';
import VirtualKeyboard from './components/VirtualKeyboard';
import ResultsScreen from './components/ResultsScreen';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';

import { SNIPPETS, LANGUAGES } from './data/snippets';
import { KEYBOARD_THEMES, getThemeById } from './utils/themes';
import { tokenizeCode } from './utils/tokenizer';
import { playKeySound, playCompletionSound } from './utils/audio';

export default function App() {
  // Config state
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [mode, setMode] = useState('time'); // 'time' | 'snippet'
  const [duration, setDuration] = useState(60); // 15, 30, 60, 120 for time mode
  const [themeId, setThemeId] = useState('orange');
  const [colorMode, setColorMode] = useState(() => {
    try {
      return localStorage.getItem('devtype_color_mode') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [showKeyHints, setShowKeyHints] = useState(true);
  const [caretStyle, setCaretStyle] = useState('line');
  const [soundType, setSoundType] = useState('thock');
  const [soundVolume, setSoundVolume] = useState(0.75);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [masterMode, setMasterMode] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [difficulty, setDifficulty] = useState('All');

  // Active theme object
  const activeTheme = useMemo(() => getThemeById(themeId), [themeId]);

  // Current snippet & tokens
  const languageSnippets = useMemo(() => SNIPPETS[selectedLanguage] || SNIPPETS.javascript, [selectedLanguage]);
  const currentSnippet = useMemo(() => {
    const snips = languageSnippets;
    return snips[snippetIndex % snips.length];
  }, [languageSnippets, snippetIndex]);

  const tokens = useMemo(() => {
    return tokenizeCode(currentSnippet.code, selectedLanguage);
  }, [currentSnippet, selectedLanguage]);

  // Test Runtime State
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'completed'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedChars, setTypedChars] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [extraCount, setExtraCount] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [lastErrorKey, setLastErrorKey] = useState(null);
  const [isFocused, setIsFocused] = useState(true);

  // Session Stats
  const [sessionStats, setSessionStats] = useState(() => {
    try {
      const saved = localStorage.getItem('devtype_session_stats');
      return saved ? JSON.parse(saved) : { testsCompleted: 0, bestWpm: 0 };
    } catch {
      return { testsCompleted: 0, bestWpm: 0 };
    }
  });

  const [finalStats, setFinalStats] = useState(null);

  const timerRef = useRef(null);
  const stateRef = useRef({});
  stateRef.current = {
    status,
    currentIndex,
    typedChars,
    tokens,
    currentSnippet,
    startTime,
    mode,
    duration,
    correctCount,
    incorrectCount,
    extraCount,
    errorCount,
    soundType,
    soundVolume,
    masterMode,
    timeRemaining,
    elapsedTime
  };

  // Toggle dark/light color mode
  const handleToggleColorMode = useCallback(() => {
    setColorMode((prev) => {
      const nextMode = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('devtype_color_mode', nextMode);
      } catch (e) {}
      return nextMode;
    });
  }, []);

  // Sync CSS theme variables and data-theme attribute to root element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', colorMode);

    root.style.setProperty('--accent', activeTheme.accent);
    root.style.setProperty('--accent-hover', activeTheme.accentHover);
    root.style.setProperty('--accent-muted', activeTheme.accentMuted);
    root.style.setProperty('--accent-glow', activeTheme.accentGlow);

    // Keyboard dynamic styling tokens
    root.style.setProperty('--kb-bg-top', activeTheme.keycapBgTop);
    root.style.setProperty('--kb-bg-bottom', activeTheme.keycapBgBottom);
    root.style.setProperty('--kb-hover-top', activeTheme.keycapHoverTop);
    root.style.setProperty('--kb-hover-bottom', activeTheme.keycapHoverBottom);
    root.style.setProperty('--kb-pressed-top', activeTheme.keycapPressedTop);
    root.style.setProperty('--kb-pressed-bottom', activeTheme.keycapPressedBottom);
    root.style.setProperty('--kb-shadow', activeTheme.keycapShadow);
    root.style.setProperty('--kb-border', activeTheme.keycapBorder);
    root.style.setProperty('--kb-text', activeTheme.keycapText);
    root.style.setProperty('--kb-sub-text', activeTheme.keycapSubText);
    root.style.setProperty('--kb-target-top', activeTheme.keycapTargetTop);
    root.style.setProperty('--kb-target-bottom', activeTheme.keycapTargetBottom);
    root.style.setProperty('--kb-target-text', activeTheme.keycapTargetText);
    root.style.setProperty('--kb-target-shadow', activeTheme.keycapTargetShadow);
    root.style.setProperty('--kb-target-glow', activeTheme.keycapTargetGlow);
  }, [activeTheme, colorMode]);




  // Restart typing test
  const handleRestart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('idle');
    setCurrentIndex(0);
    setTypedChars([]);
    setTimeRemaining(duration);
    setElapsedTime(0);
    setStartTime(null);
    setErrorCount(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setExtraCount(0);
    setTimeline([]);
    setLastErrorKey(null);
    setIsFocused(true);
    setFinalStats(null);
  }, [duration]);

  // Change snippet
  const handleNextSnippet = useCallback(() => {
    setSnippetIndex((prev) => (prev + 1) % languageSnippets.length);
    handleRestart();
  }, [languageSnippets.length, handleRestart]);

  // Switch language
  const handleSelectLanguage = useCallback((langId) => {
    setSelectedLanguage(langId);
    setSnippetIndex(0);
    handleRestart();
  }, [handleRestart]);

  // Switch mode
  const handleSelectMode = useCallback((newMode) => {
    setMode(newMode);
    handleRestart();
  }, [handleRestart]);

  // Switch duration
  const handleSelectDuration = useCallback((dur) => {
    setDuration(dur);
    setTimeRemaining(dur);
    handleRestart();
  }, [handleRestart]);

  // Calculate live metrics
  const totalTyped = correctCount + incorrectCount;
  const timeInMinutes = (status === 'running' || status === 'completed') && startTime
    ? Math.max(0.01, (Date.now() - startTime) / 60000)
    : 0.01;
  const liveWpm = Math.max(0, (correctCount / 5) / timeInMinutes);
  const liveRawWpm = Math.max(0, (totalTyped / 5) / timeInMinutes);
  const liveAccuracy = totalTyped > 0 ? (correctCount / totalTyped) * 100 : 100;

  // Complete test handler
  const completeTest = useCallback((finalTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('completed');
    playCompletionSound(soundVolume);

    const s = stateRef.current;
    const timeSpent = Math.max(1, finalTime);
    const finalMinutes = timeSpent / 60;
    const finalWpm = Math.max(0, (s.correctCount / 5) / finalMinutes);
    const finalRaw = Math.max(0, ((s.correctCount + s.incorrectCount) / 5) / finalMinutes);
    const finalAcc = (s.correctCount + s.incorrectCount) > 0
      ? (s.correctCount / (s.correctCount + s.incorrectCount)) * 100
      : 100;

    setFinalStats({
      wpm: finalWpm,
      rawWpm: finalRaw,
      accuracy: finalAcc,
      correctChars: s.correctCount,
      incorrectChars: s.incorrectCount,
      extraChars: s.extraCount,
      totalChars: s.correctCount + s.incorrectCount,
      duration: s.mode === 'time' ? s.duration : 0,
      timeTaken: timeSpent,
      language: selectedLanguage,
      snippetTitle: s.currentSnippet.title,
      difficulty: s.currentSnippet.difficulty,
      timeline: timeline
    });

    setSessionStats((prev) => {
      const updated = {
        testsCompleted: prev.testsCompleted + 1,
        bestWpm: Math.max(prev.bestWpm, finalWpm)
      };
      try {
        localStorage.setItem('devtype_session_stats', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [soundVolume, selectedLanguage, timeline]);

  // Ticker for running test
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        const s = stateRef.current;
        const now = Date.now();
        const secondsElapsed = Math.floor((now - s.startTime) / 1000);

        setElapsedTime(secondsElapsed);

        if (s.mode === 'time') {
          const remaining = Math.max(0, s.duration - secondsElapsed);
          setTimeRemaining(remaining);

          // Record timeline for graph
          const mins = Math.max(0.01, secondsElapsed / 60);
          const currentWpm = Math.max(0, (s.correctCount / 5) / mins);
          const currentRaw = Math.max(0, ((s.correctCount + s.incorrectCount) / 5) / mins);

          setTimeline((prev) => [
            ...prev,
            { time: secondsElapsed, wpm: currentWpm, rawWpm: currentRaw, errors: s.errorCount }
          ]);

          if (remaining <= 0) {
            completeTest(s.duration);
          }
        } else {
          // Snippet mode
          const mins = Math.max(0.01, secondsElapsed / 60);
          const currentWpm = Math.max(0, (s.correctCount / 5) / mins);
          const currentRaw = Math.max(0, ((s.correctCount + s.incorrectCount) / 5) / mins);

          setTimeline((prev) => [
            ...prev,
            { time: secondsElapsed, wpm: currentWpm, rawWpm: currentRaw, errors: s.errorCount }
          ]);
        }
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [status, completeTest]);

  // Main Keystroke Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in settings modal or inputs
      if (isSettingsOpen) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const code = e.code;
      const key = e.key;

      // Update pressed keys for virtual keyboard
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      // Quick restart shortcuts: Tab + Enter or Esc
      if (key === 'Escape') {
        e.preventDefault();
        handleRestart();
        return;
      }

      if (e.ctrlKey && key === 'Enter') {
        e.preventDefault();
        handleNextSnippet();
        return;
      }

      if (key === 'Tab' && e.altKey) {
        return;
      }

      // If test is completed, allow Esc/Enter to restart
      if (stateRef.current.status === 'completed') {
        if (key === 'Enter') {
          e.preventDefault();
          handleRestart();
        }
        return;
      }

      // Ignore modifier keys by themselves
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ContextMenu'].includes(key)) {
        return;
      }

      const s = stateRef.current;
      const targetCode = s.currentSnippet.code;
      const targetChar = targetCode[s.currentIndex];

      // Handle Backspace
      if (key === 'Backspace') {
        e.preventDefault();
        if (s.currentIndex > 0) {
          playKeySound(s.soundType, s.soundVolume, false);
          setCurrentIndex((prev) => prev - 1);
          setTypedChars((prev) => prev.slice(0, -1));
        }
        return;
      }

      // Start test if in idle state
      if (s.status === 'idle') {
        if (key.length === 1 || key === 'Enter' || key === 'Tab') {
          setStatus('running');
          setStartTime(Date.now());
        } else {
          return;
        }
      }

      // Prevent default scrolling on space / tab / enter
      if (key === ' ' || key === 'Tab' || key === 'Enter') {
        e.preventDefault();
      }

      // Convert pressed key to code character
      let inputChar = key;
      if (key === 'Enter') inputChar = '\n';
      if (key === 'Tab') inputChar = '  '; // 2 spaces

      // Character evaluation
      if (inputChar === targetChar) {
        // Correct character typed
        playKeySound(s.soundType, s.soundVolume, false, inputChar === ' ');
        setCorrectCount((prev) => prev + 1);
        setTypedChars((prev) => [...prev, inputChar]);
        const nextIdx = s.currentIndex + 1;
        setCurrentIndex(nextIdx);

        // Check if finished in snippet mode
        if (s.mode === 'snippet' && nextIdx >= targetCode.length) {
          const totalSecs = Math.max(1, Math.round((Date.now() - (s.startTime || Date.now())) / 1000));
          completeTest(totalSecs);
        }
      } else {
        // Incorrect character typed
        playKeySound(s.soundType, s.soundVolume, true, inputChar === ' ');
        setErrorCount((prev) => prev + 1);
        setIncorrectCount((prev) => prev + 1);
        setLastErrorKey(code);
        setTimeout(() => setLastErrorKey(null), 300);

        if (s.masterMode) {
          // Hardcore Master Mode: Fail immediately
          handleRestart();
          return;
        }

        // Allow advancing with error
        setTypedChars((prev) => [...prev, inputChar]);
        const nextIdx = s.currentIndex + 1;
        setCurrentIndex(nextIdx);

        if (s.mode === 'snippet' && nextIdx >= targetCode.length) {
          const totalSecs = Math.max(1, Math.round((Date.now() - (s.startTime || Date.now())) / 1000));
          completeTest(totalSecs);
        }
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSettingsOpen, handleRestart, handleNextSnippet, completeTest]);

  // Target character for virtual keyboard hint
  const currentTargetChar = currentSnippet.code[currentIndex] || '';

  // Handle virtual key click from mouse/touch
  const handleVirtualKeyPress = (code) => {
    // Optional virtual click fallback
    const keyMap = {
      Space: ' ',
      Enter: '\n',
      Tab: '\t',
      Backspace: 'Backspace'
    };
    const key = keyMap[code] || (code.startsWith('Key') ? code.slice(3).toLowerCase() : null);
    if (key) {
      window.dispatchEvent(new KeyboardEvent('keydown', { code, key }));
      setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { code, key }));
      }, 100);
    }
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        soundType={soundType}
        soundVolume={soundVolume}
        onToggleSound={() => setSoundType(soundType === 'silent' ? 'thock' : 'silent')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />

      {/* Main App Content Area */}
      <main className="main-content">
        {status !== 'completed' ? (
          <div className="typing-view animate-fade-in">
            {/* Top Mode & Language Config Bar */}
            <ConfigBar
              selectedLanguage={selectedLanguage}
              onSelectLanguage={handleSelectLanguage}
              mode={mode}
              onSelectMode={handleSelectMode}
              duration={duration}
              onSelectDuration={handleSelectDuration}
              disabled={status === 'running'}
            />

            {/* Syntax Typing Centerpiece */}
            <TypingArea
              tokens={tokens}
              typedChars={typedChars}
              currentIndex={currentIndex}
              wpm={liveWpm}
              accuracy={liveAccuracy}
              timeRemaining={mode === 'time' ? timeRemaining : elapsedTime}
              mode={mode}
              duration={duration}
              errorCount={errorCount}
              caretStyle={caretStyle}
              onRestart={handleRestart}
              isFocused={isFocused}
              onFocusChange={setIsFocused}
            />

            {/* Tactile Virtual Keyboard */}
            {showKeyboard && (
              <VirtualKeyboard
                pressedKeys={pressedKeys}
                targetChar={currentTargetChar}
                lastErrorKey={lastErrorKey}
                showHints={showKeyHints}
                onVirtualKeyPress={handleVirtualKeyPress}
              />
            )}
          </div>
        ) : (
          /* Results Screen */
          <ResultsScreen
            stats={finalStats || {
              wpm: liveWpm,
              rawWpm: liveRawWpm,
              accuracy: liveAccuracy,
              correctChars: correctCount,
              incorrectChars: incorrectCount,
              extraChars: extraCount,
              totalChars: totalTyped,
              duration: mode === 'time' ? duration : 0,
              timeTaken: mode === 'time' ? duration - timeRemaining : elapsedTime,
              language: selectedLanguage,
              snippetTitle: currentSnippet.title,
              difficulty: currentSnippet.difficulty,
              timeline: timeline
            }}
            onRestart={handleRestart}
            onNextSnippet={handleNextSnippet}
            onOpenLanguagePicker={() => {
              handleRestart();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-links">
          <span>DevType v1.0</span>
          <span className="footer-divider">•</span>
          <span>Made for Ergonomic Syntax Typing</span>
          <span className="footer-divider">•</span>
          <button
            type="button"
            className="footer-btn"
            onClick={() => setIsAboutOpen(true)}
          >
            About
          </button>
        </div>
      </footer>

      {/* Settings & Preferences Modal (Horizontal Layout) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundType={soundType}
        onSoundTypeChange={setSoundType}
        soundVolume={soundVolume}
        onSoundVolumeChange={setSoundVolume}
        caretStyle={caretStyle}
        onCaretStyleChange={setCaretStyle}
        activeTheme={activeTheme}
        onSelectTheme={setThemeId}
        showKeyboard={showKeyboard}
        onToggleKeyboard={() => setShowKeyboard((prev) => !prev)}
        showKeyHints={showKeyHints}
        onToggleKeyHints={() => setShowKeyHints((prev) => !prev)}
        masterMode={masterMode}
        onToggleMasterMode={() => setMasterMode((prev) => !prev)}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />

      {/* About Application Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

