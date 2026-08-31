import React from 'react';
import { LANGUAGES, DIFFICULTIES } from '../data/snippets';

export const MODES = [
  { id: 'time', label: 'Time' },
  { id: 'snippet', label: 'Snippet' }
];

export const DURATIONS = [15, 30, 60, 120];

export default function ConfigBar({
  selectedLanguage,
  onSelectLanguage,
  difficulty,
  onSelectDifficulty,
  mode,
  onSelectMode,
  duration,
  onSelectDuration,
  disabled = false
}) {
  return (
    <div className="config-bar-wrapper">
      <div className="config-bar-container">
        {/* Language Selection */}
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
      </div>
    </div>
  );
}
