import React, { useRef, useEffect } from 'react';
import { RotateCcw, Pause, Play } from 'lucide-react';

export default function TypingArea({
  tokens = [],
  typedChars = [],
  currentIndex = 0,
  wpm = 0,
  accuracy = 100,
  timeRemaining = 60,
  mode = 'time',
  status = 'idle', // 'idle' | 'running' | 'paused' | 'completed'
  caretStyle = 'line',
  onRestart,
  onTogglePause,
  isFocused = true,
  onFocusChange
}) {
  const containerRef = useRef(null);
  const activeCharRef = useRef(null);

  // Auto-scroll to keep active character smoothly in view
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const charEl = activeCharRef.current;
      const container = containerRef.current;

      const charTop = charEl.offsetTop;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (charTop < containerScrollTop + 40 || charTop > containerScrollTop + containerHeight - 80) {
        container.scrollTo({
          top: Math.max(0, charTop - 60),
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  const isPaused = status === 'paused' || (!isFocused && status === 'running');

  return (
    <div className="typing-section">
      {/* Minimal Telemetry Header */}
      <div className="telemetry-bar">
        <div className="telemetry-stats-group">
          {/* WPM */}
          <div className="telemetry-item">
            <span className="telemetry-label">wpm</span>
            <span className="telemetry-value font-mono">{Math.round(wpm)}</span>
          </div>

          {/* Accuracy */}
          <div className="telemetry-item">
            <span className="telemetry-label">acc</span>
            <span className="telemetry-value font-mono">{Math.round(accuracy)}%</span>
          </div>

          {/* Time */}
          <div className="telemetry-item">
            <span className="telemetry-label">time</span>
            <span className="telemetry-value font-mono">
              {timeRemaining}s
            </span>
          </div>
        </div>

        {/* Action Controls: Pause & Restart */}
        <div className="telemetry-actions">
          {status === 'running' || status === 'paused' ? (
            <button
              type="button"
              className="telemetry-action-btn"
              onClick={onTogglePause}
              title={status === 'paused' ? 'Resume typing' : 'Pause typing'}
              aria-label="Pause or resume"
            >
              {status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
              <span>{status === 'paused' ? 'Resume' : 'Pause'}</span>
            </button>
          ) : null}

          <button
            type="button"
            className="telemetry-action-btn"
            onClick={onRestart}
            title="Restart Test (Esc)"
            aria-label="Restart typing test"
          >
            <RotateCcw size={14} />
            <span>Restart <kbd className="btn-kbd">Esc</kbd></span>
          </button>
        </div>
      </div>

      {/* Code Editor Window */}
      <div
        ref={containerRef}
        className={`code-card ${isPaused ? 'is-blurred' : ''}`}
        onClick={() => {
          if (onFocusChange) onFocusChange(true);
          if (status === 'paused' && onTogglePause) onTogglePause();
        }}
      >
        {/* Minimalist Pause / Unfocus Banner */}
        {isPaused && (
          <div className="unfocus-banner">
            <div className="pause-modal-badge">
              <Play size={16} />
              <span>Paused — Click or press any key to resume</span>
            </div>
          </div>
        )}

        <div className="code-display font-mono">
          {tokens.map((item, idx) => {
            const isCurrent = idx === currentIndex;
            const isTyped = idx < currentIndex;
            const typedChar = typedChars[idx];
            const isCorrect = isTyped && typedChar === item.char;
            const isWrong = isTyped && typedChar !== item.char;

            let charClass = 'code-char';
            if (isCorrect) charClass += ` token-${item.type} char-correct`;
            if (isWrong) charClass += ' char-incorrect';
            if (!isTyped) charClass += ` token-${item.type} char-untyped`;
            if (isCurrent) charClass += ` current-char caret-${caretStyle}`;

            // Newlines
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

            // Spaces
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
