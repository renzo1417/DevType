import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ConfigBar from './components/ConfigBar';
import TypingArea from './components/TypingArea';
import VirtualKeyboard from './components/VirtualKeyboard';
import ResultsScreen from './components/ResultsScreen';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';

import {
  SNIPPETS,
  LANGUAGES,
  DIFFICULTIES,
  CONTENT_CATEGORIES,
  KEYWORDS_SNIPPETS,
  DEV_WORDS_SNIPPETS,
  SYMBOLS_SNIPPETS,
  getRandomSnippetIndex
} from './data/snippets';
import { KEYBOARD_THEMES, getThemeById } from './utils/themes';
import { tokenizeCode } from './utils/tokenizer';
import { playKeySound, playCompletionSound } from './utils/audio';

export default function App() {
  // Configuration State
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('All');
  const [mode, setMode] = useState('time'); // 'time' | 'snippet'
  const [duration, setDuration] = useState(60); // 15, 30, 60, 120
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
  const [soundType, setSoundType] = useState('creamy'); // Default to authentic Mechvibes creamy sound
  const [soundVolume, setSoundVolume] = useState(0.75);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [masterMode, setMasterMode] = useState(false);

  const [category, setCategory] = useState(() => {
    try {
      return localStorage.getItem('devtype_category') || 'code';
    } catch {
      return 'code';
    }
  });
  const [autoIndent, setAutoIndent] = useState(() => {
    try {
      const saved = localStorage.getItem('devtype_auto_indent');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [showWhitespace, setShowWhitespace] = useState(() => {
    try {
      const saved = localStorage.getItem('devtype_show_whitespace');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Active theme object
  const activeTheme = useMemo(() => getThemeById(themeId), [themeId]);

  // Snippets filtered by category, language, and difficulty
  const languageSnippets = useMemo(() => {
    if (category === 'keywords') {
      const allForLang = KEYWORDS_SNIPPETS[selectedLanguage] || KEYWORDS_SNIPPETS.javascript;
      if (difficulty === 'All') return allForLang;
      const filtered = allForLang.filter((s) => s.difficulty === difficulty);
      return filtered.length > 0 ? filtered : allForLang;
    }
    if (category === 'words') {
      if (difficulty === 'All') return DEV_WORDS_SNIPPETS;
      const filtered = DEV_WORDS_SNIPPETS.filter((s) => s.difficulty === difficulty);
      return filtered.length > 0 ? filtered : DEV_WORDS_SNIPPETS;
    }
    if (category === 'symbols') {
      if (difficulty === 'All') return SYMBOLS_SNIPPETS;
      const filtered = SYMBOLS_SNIPPETS.filter((s) => s.difficulty === difficulty);
      return filtered.length > 0 ? filtered : SYMBOLS_SNIPPETS;
    }
    // Default 'code'
    const allForLang = SNIPPETS[selectedLanguage] || SNIPPETS.javascript;
    if (difficulty === 'All') return allForLang;
    const filtered = allForLang.filter((s) => s.difficulty === difficulty);
    return filtered.length > 0 ? filtered : allForLang;
  }, [category, selectedLanguage, difficulty]);

  // Initialize snippetIndex randomly so page refresh gives a new code
  const [snippetIndex, setSnippetIndex] = useState(() => {
    try {
      const stored = sessionStorage.getItem('devtype_last_snippet_idx');
      const prevIdx = stored !== null ? parseInt(stored, 10) : -1;
      const initialPool = SNIPPETS.javascript;
      const nextIdx = getRandomSnippetIndex(initialPool, prevIdx);
      sessionStorage.setItem('devtype_last_snippet_idx', String(nextIdx));
      return nextIdx;
    } catch {
      return Math.floor(Math.random() * 5);
    }
  });

  const currentSnippet = useMemo(() => {
    return languageSnippets[snippetIndex % languageSnippets.length] || languageSnippets[0];
  }, [languageSnippets, snippetIndex]);

  const tokens = useMemo(() => {
    const lang = (category === 'words' || category === 'symbols') ? 'javascript' : selectedLanguage;
    return tokenizeCode(currentSnippet.code, lang);
  }, [currentSnippet, selectedLanguage, category]);

  // Test Runtime State
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedChars, setTypedChars] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [segmentStartTime, setSegmentStartTime] = useState(null);

  const [errorCount, setErrorCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [extraCount, setExtraCount] = useState(0);

  const [timeline, setTimeline] = useState([]);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [lastErrorKey, setLastErrorKey] = useState(null);
  const [lastCorrectKey, setLastCorrectKey] = useState(null);
  const [isFocused, setIsFocused] = useState(true);
  const [finalStats, setFinalStats] = useState(null);

  const timerRef = useRef(null);
  const stateRef = useRef({});
  stateRef.current = {
    status,
    currentIndex,
    typedChars,
    tokens,
    currentSnippet,
    segmentStartTime,
    accumulatedMs,
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
    elapsedSeconds,
    selectedLanguage,
    category,
    autoIndent,
    showWhitespace,
    timeline,
    isFocused
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

  // Sync CSS theme variables and data-theme attribute
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

  // Restart typing test cleanly
  const handleRestart = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('idle');
    setCurrentIndex(0);
    setTypedChars([]);
    setTimeRemaining(duration);
    setElapsedSeconds(0);
    setAccumulatedMs(0);
    setSegmentStartTime(null);
    setErrorCount(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setExtraCount(0);
    setTimeline([]);
    setLastErrorKey(null);
    setLastCorrectKey(null);
    setIsFocused(true);
    setFinalStats(null);
  }, [duration]);

  // Change snippet (cycle to next in pool)
  const handleNextSnippet = useCallback(() => {
    setSnippetIndex((prev) => {
      const nextIdx = (prev + 1) % languageSnippets.length;
      try {
        sessionStorage.setItem('devtype_last_snippet_idx', String(nextIdx));
      } catch {}
      return nextIdx;
    });
    handleRestart();
  }, [languageSnippets.length, handleRestart]);

  // Shuffle snippet (pick random distinct snippet in pool)
  const handleShuffleSnippet = useCallback(() => {
    setSnippetIndex((prev) => {
      const nextIdx = getRandomSnippetIndex(languageSnippets, prev);
      try {
        sessionStorage.setItem('devtype_last_snippet_idx', String(nextIdx));
      } catch {}
      return nextIdx;
    });
    handleRestart();
  }, [languageSnippets, handleRestart]);

  // Switch language
  const handleSelectLanguage = useCallback((langId) => {
    setSelectedLanguage(langId);
    setSnippetIndex(0);
    handleRestart();
  }, [handleRestart]);

  // Switch difficulty
  const handleSelectDifficulty = useCallback((diff) => {
    setDifficulty(diff);
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

  // Switch category
  const handleSelectCategory = useCallback((catId) => {
    setCategory(catId);
    try {
      localStorage.setItem('devtype_category', catId);
    } catch {}
    setSnippetIndex(0);
    handleRestart();
  }, [handleRestart]);

  // Toggle auto-indent
  const handleToggleAutoIndent = useCallback(() => {
    setAutoIndent((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('devtype_auto_indent', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Toggle whitespace dots
  const handleToggleWhitespace = useCallback(() => {
    setShowWhitespace((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('devtype_show_whitespace', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Pause / Resume toggle
  const handleTogglePause = useCallback(() => {
    if (status === 'running') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const currentSegment = segmentStartTime ? Date.now() - segmentStartTime : 0;
      setAccumulatedMs((prev) => prev + currentSegment);
      setSegmentStartTime(null);
      setStatus('paused');
    } else if (status === 'paused') {
      setSegmentStartTime(Date.now());
      setStatus('running');
      setIsFocused(true);
    }
  }, [status, segmentStartTime]);

  // Accurate live WPM & Accuracy calculation
  const totalTyped = correctCount + incorrectCount;
  const currentTotalActiveMs = accumulatedMs + (status === 'running' && segmentStartTime ? (Date.now() - segmentStartTime) : 0);
  const activeMinutes = Math.max(0.01, currentTotalActiveMs / 60000);
  const liveWpm = Math.max(0, (correctCount / 5) / activeMinutes);
  const liveRawWpm = Math.max(0, (totalTyped / 5) / activeMinutes);
  const liveAccuracy = totalTyped > 0 ? (correctCount / totalTyped) * 100 : 100;

  // Complete test handler: immediately stops timer and calculates final stats accurately
  const completeTest = useCallback((finalTotalSeconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('completed');
    playCompletionSound(soundVolume);

    const s = stateRef.current;
    const timeSpent = Math.max(1, finalTotalSeconds);
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
      timeline: s.timeline
    });
  }, [soundVolume, selectedLanguage]);

  // Centralized snippet completion check (fixes timer running when done typing in any mode)
  const checkSnippetFinished = useCallback((nextIdx, targetCodeLength, s) => {
    if (nextIdx >= targetCodeLength) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const curSegment = s.segmentStartTime ? Date.now() - s.segmentStartTime : 0;
      const totalSecs = Math.max(1, Math.round((s.accumulatedMs + curSegment) / 1000));
      completeTest(totalSecs);
      return true;
    }
    return false;
  }, [completeTest]);

  // 1-second interval ticker for running tests
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        const s = stateRef.current;
        if (s.status !== 'running') return;

        const now = Date.now();
        const seg = s.segmentStartTime ? now - s.segmentStartTime : 0;
        const totalMs = s.accumulatedMs + seg;
        const totalSecs = Math.floor(totalMs / 1000);

        setElapsedSeconds(totalSecs);

        const mins = Math.max(0.01, totalSecs / 60);
        const curWpm = Math.max(0, (s.correctCount / 5) / mins);
        const curRaw = Math.max(0, ((s.correctCount + s.incorrectCount) / 5) / mins);

        setTimeline((prev) => [
          ...prev,
          { time: totalSecs, wpm: curWpm, rawWpm: curRaw, errors: s.errorCount }
        ]);

        if (s.mode === 'time') {
          const rem = Math.max(0, s.duration - totalSecs);
          setTimeRemaining(rem);
          if (rem <= 0) {
            completeTest(s.duration);
          }
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [status, completeTest]);

  // Window blur listener to auto-pause when leaving window
  useEffect(() => {
    const handleBlur = () => {
      setIsFocused(false);
      if (stateRef.current.status === 'running') {
        handleTogglePause();
      }
    };
    const handleFocus = () => {
      setIsFocused(true);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleTogglePause]);

  // Main Keystroke Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if modals or inputs are active
      if (isSettingsOpen || isAboutOpen) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const code = e.code;
      const key = e.key;

      // Update physical pressed keycap set
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      // Quick restart shortcuts: Esc
      if (key === 'Escape') {
        e.preventDefault();
        handleRestart();
        return;
      }

      // Next snippet shortcut: Ctrl + Enter
      if (e.ctrlKey && key === 'Enter') {
        e.preventDefault();
        handleShuffleSnippet();
        return;
      }

      // If test is completed, allow Enter to load next snippet
      if (stateRef.current.status === 'completed') {
        if (key === 'Enter') {
          e.preventDefault();
          handleNextSnippet();
        }
        return;
      }

      // Resume if paused
      if (stateRef.current.status === 'paused') {
        if (key.length === 1 || key === 'Enter' || key === 'Tab' || key === 'Backspace') {
          handleTogglePause();
        }
      }

      // Ignore modifier keys by themselves
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ContextMenu'].includes(key)) {
        return;
      }

      const s = stateRef.current;
      const targetCode = s.currentSnippet.code;
      const targetChar = targetCode[s.currentIndex];

      // Handle Backspace with Smart Indent support
      if (key === 'Backspace') {
        e.preventDefault();
        if (s.currentIndex > 0) {
          playKeySound(s.soundType, s.soundVolume, false, 'backspace');

          let charsToRemove = 1;
          if (s.autoIndent) {
            let lastNewlineIdx = -1;
            for (let j = s.currentIndex - 1; j >= 0; j--) {
              if (targetCode[j] === '\n') {
                lastNewlineIdx = j;
                break;
              }
              if (targetCode[j] !== ' ') {
                break;
              }
            }
            if (lastNewlineIdx !== -1) {
              charsToRemove = s.currentIndex - lastNewlineIdx;
            }
          }

          const newIdx = Math.max(0, s.currentIndex - charsToRemove);
          setCurrentIndex(newIdx);
          setTypedChars((prev) => prev.slice(0, newIdx));
        }
        return;
      }

      // Start test if in idle state
      if (s.status === 'idle') {
        if (key.length === 1 || key === 'Enter' || key === 'Tab') {
          setStatus('running');
          setSegmentStartTime(Date.now());
        } else {
          return;
        }
      }

      // Prevent default page scroll on space / tab / enter
      if (key === ' ' || key === 'Tab' || key === 'Enter') {
        e.preventDefault();
      }

      // Smart Tab Key handling
      if (key === 'Tab') {
        if (targetChar === ' ') {
          let spaceCount = 0;
          while (s.currentIndex + spaceCount < targetCode.length && targetCode[s.currentIndex + spaceCount] === ' ') {
            spaceCount++;
          }
          const numToAdvance = Math.min(spaceCount, 2);
          if (numToAdvance > 0) {
            playKeySound(s.soundType, s.soundVolume, false, 'space');
            setCorrectCount((prev) => prev + numToAdvance);
            const spaces = Array(numToAdvance).fill(' ');
            setTypedChars((prev) => [...prev, ...spaces]);
            const nextIdx = s.currentIndex + numToAdvance;
            setCurrentIndex(nextIdx);

            // Check if finished (stops timer immediately in any mode)
            checkSnippetFinished(nextIdx, targetCode.length, s);
          }
        }
        return;
      }

      // Map keys to code characters
      let inputChar = key;
      if (key === 'Enter') inputChar = '\n';

      const soundKeyType = inputChar === ' ' ? 'space' : inputChar === '\n' ? 'enter' : 'regular';

      // Character evaluation
      if (inputChar === targetChar) {
        // Correct character typed
        playKeySound(s.soundType, s.soundVolume, false, soundKeyType);

        let charsToAdd = [inputChar];
        let correctIncrement = 1;
        let nextIdx = s.currentIndex + 1;

        // Smart Auto-Indent on Enter
        if (inputChar === '\n' && s.autoIndent) {
          let indentCount = 0;
          while (nextIdx + indentCount < targetCode.length && targetCode[nextIdx + indentCount] === ' ') {
            indentCount++;
          }
          if (indentCount > 0) {
            for (let k = 0; k < indentCount; k++) {
              charsToAdd.push(' ');
            }
            correctIncrement += indentCount;
            nextIdx += indentCount;
          }
        }

        setCorrectCount((prev) => prev + correctIncrement);
        setTypedChars((prev) => [...prev, ...charsToAdd]);
        setCurrentIndex(nextIdx);

        // Correct key visual feedback on keyboard
        setLastCorrectKey(code);
        setTimeout(() => setLastCorrectKey(null), 150);

        // Check if finished (stops timer immediately in any mode)
        checkSnippetFinished(nextIdx, targetCode.length, s);
      } else {
        // Incorrect character typed
        playKeySound(s.soundType, s.soundVolume, true, soundKeyType);
        setErrorCount((prev) => prev + 1);
        setIncorrectCount((prev) => prev + 1);

        // Error key visual feedback on keyboard
        setLastErrorKey(code);
        setTimeout(() => setLastErrorKey(null), 300);

        if (s.masterMode) {
          handleRestart();
          return;
        }

        // Advance index with error
        setTypedChars((prev) => [...prev, inputChar]);
        const nextIdx = s.currentIndex + 1;
        setCurrentIndex(nextIdx);

        // Check if finished (stops timer immediately in any mode)
        checkSnippetFinished(nextIdx, targetCode.length, s);
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
  }, [
    isSettingsOpen,
    isAboutOpen,
    handleRestart,
    handleNextSnippet,
    handleShuffleSnippet,
    handleTogglePause,
    checkSnippetFinished
  ]);

  // Expected character for virtual keyboard hint
  const currentTargetChar = currentSnippet.code[currentIndex] || '';

  // Handle virtual key click from mouse/touch
  const handleVirtualKeyPress = (code) => {
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
      {/* Streamlined Minimalist Header */}
      <Header
        soundType={soundType}
        soundVolume={soundVolume}
        onToggleSound={() => setSoundType(soundType === 'silent' ? 'creamy' : 'silent')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {status !== 'completed' ? (
          <div className="typing-view animate-fade-in">
            {/* Minimal Config Bar with Shuffle and Snippet Count */}
            <ConfigBar
              category={category}
              onSelectCategory={handleSelectCategory}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={handleSelectLanguage}
              difficulty={difficulty}
              onSelectDifficulty={handleSelectDifficulty}
              mode={mode}
              onSelectMode={handleSelectMode}
              duration={duration}
              onSelectDuration={handleSelectDuration}
              autoIndent={autoIndent}
              onToggleAutoIndent={handleToggleAutoIndent}
              snippetIndex={snippetIndex}
              totalSnippets={languageSnippets.length}
              onShuffleSnippet={handleShuffleSnippet}
              disabled={status === 'running'}
            />

            {/* Core Typing Engine Window */}
            <TypingArea
              tokens={tokens}
              typedChars={typedChars}
              currentIndex={currentIndex}
              wpm={liveWpm}
              accuracy={liveAccuracy}
              timeRemaining={mode === 'time' ? timeRemaining : elapsedSeconds}
              mode={mode}
              status={status}
              caretStyle={caretStyle}
              showWhitespace={showWhitespace}
              autoIndent={autoIndent}
              snippetTitle={currentSnippet.title}
              onRestart={handleRestart}
              onTogglePause={handleTogglePause}
              isFocused={isFocused}
              onFocusChange={setIsFocused}
            />

            {/* Interactive Tactile Orange Mechanical Keyboard */}
            {showKeyboard && (
              <VirtualKeyboard
                pressedKeys={pressedKeys}
                targetChar={currentTargetChar}
                lastErrorKey={lastErrorKey}
                lastCorrectKey={lastCorrectKey}
                showHints={showKeyHints}
                onVirtualKeyPress={handleVirtualKeyPress}
              />
            )}
          </div>
        ) : (
          /* Sleek Minimalist Results Screen */
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
              timeTaken: mode === 'time' ? duration - timeRemaining : elapsedSeconds,
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

      {/* Minimal Footer */}
      <footer className="app-footer">
        <div className="footer-links">
          <span>DevType v2.0</span>
          <span className="footer-divider">•</span>
          <span>Ergonomic Syntax Speedtyper</span>
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

      {/* Settings Modal */}
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
        autoIndent={autoIndent}
        onToggleAutoIndent={handleToggleAutoIndent}
        showWhitespace={showWhitespace}
        onToggleWhitespace={handleToggleWhitespace}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
