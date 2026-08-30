import React from 'react';
import { LANGUAGES } from '../data/snippets';

export const MODES = [
  { id: 'time', label: 'Time' },
  { id: 'snippet', label: 'Snippet' }
];

export const DURATIONS = [15, 30, 60, 120];

export default function ConfigBar({
  selectedLanguage,
  onSelectLanguage,
  mode,
  onSelectMode,
  duration,
  onSelectDuration,
  disabled = false
}) {
  return (
    <div className="config-bar-wrapper">
      <div className="config-bar-container">
        {/* Left: Language Selection */}
        <div className="config-section">
          <span className="config-label">Language</span>
          <div className="config-items">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                className={`config-tab ${selectedLanguage === lang.id ? 'is-active' : ''}`}
                onClick={() => onSelectLanguage(lang.id)}
                disabled={disabled}
              >
                <span className="lang-name">{lang.name}</span>
              </button>
            ))}
          </div>

        </div>

        <div className="config-separator" />

        {/* Right: Mode & Length Selection */}
        <div className="config-section">
          <span className="config-label">Mode</span>
          <div className="config-items">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`config-tab ${mode === m.id ? 'is-active' : ''}`}
                onClick={() => onSelectMode(m.id)}
                disabled={disabled}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'time' && (
          <>
            <div className="config-separator" />
            <div className="config-section">
              <span className="config-label">Time</span>
              <div className="config-items">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    className={`config-tab ${duration === dur ? 'is-active' : ''}`}
                    onClick={() => onSelectDuration(dur)}
                    disabled={disabled}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

