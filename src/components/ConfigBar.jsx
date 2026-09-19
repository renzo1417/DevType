import React from 'react';
import { Zap, Shuffle } from 'lucide-react';
import { LANGUAGES, DIFFICULTIES, CONTENT_CATEGORIES } from '../data/snippets';

export const MODES = [
  { id: 'time', label: 'Time' },
  { id: 'snippet', label: 'Snippet' }
];

export const DURATIONS = [15, 30, 60, 120];

export default function ConfigBar({
  category = 'code',
  onSelectCategory,
  selectedLanguage,
  onSelectLanguage,
  difficulty,
  onSelectDifficulty,
  mode,
  onSelectMode,
  duration,
  onSelectDuration,
  autoIndent = true,
  onToggleAutoIndent,
  snippetIndex = 0,
  totalSnippets = 1,
  onShuffleSnippet,
  disabled = false
}) {
  const showLanguages = category === 'code' || category === 'keywords';

  return (
    <div className="config-bar-wrapper">
      <div className="config-bar-container">
        {/* Practice Category Selection */}
        <div className="config-group category-group">
          {CONTENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`config-option-btn category-pill ${category === cat.id ? 'is-active' : ''}`}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              disabled={disabled}
              title={cat.desc}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Language Selection (shown for Code and Keywords) */}
        {showLanguages && (
          <>
            <div className="config-divider" />
            <div className="config-group">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  className={`config-option-btn ${selectedLanguage === lang.id ? 'is-active' : ''}`}
                  onClick={() => onSelectLanguage(lang.id)}
                  disabled={disabled}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="config-divider" />

        {/* Difficulty Selection */}
        <div className="config-group">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              type="button"
              className={`config-option-btn ${difficulty === diff ? 'is-active' : ''}`}
              onClick={() => onSelectDifficulty(diff)}
              disabled={disabled}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="config-divider" />

        {/* Mode Selection */}
        <div className="config-group">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`config-option-btn ${mode === m.id ? 'is-active' : ''}`}
              onClick={() => onSelectMode(m.id)}
              disabled={disabled}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Duration Selection (if Time mode) */}
        {mode === 'time' && (
          <>
            <div className="config-divider" />
            <div className="config-group">
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  className={`config-option-btn ${duration === dur ? 'is-active' : ''}`}
                  onClick={() => onSelectDuration(dur)}
                  disabled={disabled}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </>
        )}

        {/* Auto-Indent Quick Toggle */}
        <div className="config-divider" />
        <div className="config-group">
          <button
            type="button"
            className={`config-option-btn auto-indent-toggle-btn ${autoIndent ? 'is-active is-indent-on' : ''}`}
            onClick={onToggleAutoIndent}
            disabled={disabled}
            title={autoIndent ? 'Auto-Indent is ON: Enter key automatically advances past indentation spaces' : 'Auto-Indent is OFF: Manual spaces required'}
            aria-label="Toggle Auto-Indent"
          >
            <Zap size={13} className="indent-zap-icon" />
            <span>Auto-Indent</span>
          </button>
        </div>

        {/* Quick Shuffle / Next Snippet Button */}
        {totalSnippets > 1 && (
          <>
            <div className="config-divider" />
            <div className="config-group">
              <button
                type="button"
                className="config-option-btn shuffle-snippet-btn"
                onClick={onShuffleSnippet}
                disabled={disabled}
                title={`Shuffle / Next Snippet (${snippetIndex + 1} of ${totalSnippets}) — Shortcut: Ctrl+Enter`}
                aria-label="Load another code snippet"
              >
                <Shuffle size={13} className="shuffle-icon" />
                <span>Code {snippetIndex + 1}/{totalSnippets}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
