import React, { useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function TypingArea({
  tokens = [],
  typedChars = [],
  currentIndex = 0,
  wpm = 0,
  accuracy = 100,
  timeRemaining = 60,
  mode = 'time',
  duration = 60,
  errorCount = 0,
  caretStyle = 'block',
  onRestart,
  isFocused = true,
  onFocusChange
}) {
  const containerRef = useRef(null);
  const activeCharRef = useRef(null);

  // Auto-scroll to keep active character in view
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const charEl = activeCharRef.current;
      const container = containerRef.current;

      const charTop = charEl.offsetTop;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (charTop < containerScrollTop + 30 || charTop > containerScrollTop + containerHeight - 60) {
        container.scrollTo({
          top: Math.max(0, charTop - 50),
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  return (
    <div className="typing-section">
      {/* Telemetry Stats Bar */}
      <div className="telemetry-bar">
        <div className="telemetry-stats-group">
          {/* WPM Stat */}
          <div className="telemetry-item">
            <span className="telemetry-label">WPM</span>
            <span className="telemetry-value font-mono">{Math.round(wpm)}</span>
          </div>

          {/* Accuracy Stat */}
          <div className="telemetry-item">
            <span className="telemetry-label">ACCURACY</span>
            <span className="telemetry-value font-mono">{Math.round(accuracy)}%</span>
          </div>

          {/* Time Stat */}
          <div className="telemetry-item">
            <span className="telemetry-label">TIME</span>
            <span className="telemetry-value font-mono">
              {mode === 'time' ? `${timeRemaining}s` : `${timeRemaining}s`}
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          type="button"
          className="restart-btn"
          onClick={onRestart}
          title="Restart Test (Esc or Tab + Enter)"
          aria-label="Restart typing test"
        >
          <RotateCcw size={15} />
          <span>Restart</span>
        </button>
      </div>

      {/* Code Editor Card */}
      <div
        ref={containerRef}
        className={`code-card ${!isFocused ? 'is-blurred' : ''}`}
        onClick={() => onFocusChange && onFocusChange(true)}
      >
        {!isFocused && (
          <div className="unfocus-banner">
            <span>Click to focus</span>
          </div>
        )}

        <div className="code-display font-mono">
          {tokens.map((item, idx) => {
            const isCurrent = idx === currentIndex;
            const isTyped = idx < currentIndex;
            const typedChar = typedChars[idx];
            const isCorrect = isTyped && typedChar === item.char;
            const isWrong = isTyped && typedChar !== item.char;

            let charClass = `code-char token-${item.type}`;
            if (isCurrent) charClass += ` current-char caret-${caretStyle}`;
            if (isCorrect) charClass += ' char-correct';
            if (isWrong) charClass += ' char-incorrect';
            if (!isTyped && !isCurrent) charClass += ' char-untyped';

            // Special rendering for newlines and spaces
            if (item.char === '\n') {
              return (
                <span
                  key={`char-${idx}`}
                  ref={isCurrent ? activeCharRef : null}
                  className={`${charClass} char-newline`}
                >
                  {'\n'}
                </span>
              );
            }

            if (item.char === ' ') {
              return (
                <span
                  key={`char-${idx}`}
                  ref={isCurrent ? activeCharRef : null}
                  className={`${charClass} char-space`}
                >
                  {isWrong ? '•' : ' '}
                </span>
              );
            }

            return (
              <span
                key={`char-${idx}`}
                ref={isCurrent ? activeCharRef : null}
                className={charClass}
              >
                {item.char}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

