import React from 'react';
import { Code2, Braces, WholeWord, Parentheses } from 'lucide-react';
import { LANGUAGES, DIFFICULTIES } from '../data/snippets';

const categories = [
  { id: 'code', label: 'code', Icon: Code2 },
  { id: 'keywords', label: 'keywords', Icon: Braces },
  { id: 'words', label: 'words', Icon: WholeWord },
  { id: 'symbols', label: 'symbols', Icon: Parentheses },
];

export default function ConfigBar({ preferences, onChange, languageRef }) {
  return (
    <div className="configuration">
      <div className="config-bar">
        <div className="config-categories" role="group" aria-label="Practice category">
          {categories.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`config-option ${preferences.category === id ? 'is-active' : ''}`}
              aria-pressed={preferences.category === id}
              onClick={() => onChange({ category: id })}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <span className="config-divider" aria-hidden="true" />
        <div className="config-modes" role="group" aria-label="Test mode">
          {['time', 'snippet'].map((mode) => (
            <button
              type="button"
              key={mode}
              className={`config-option ${preferences.mode === mode ? 'is-active' : ''}`}
              aria-pressed={preferences.mode === mode}
              onClick={() => onChange({ mode })}
            >
              {mode}
            </button>
          ))}
        </div>
        <div
          className="config-durations"
          role="group"
          aria-label="Test duration"
          data-hidden={preferences.mode !== 'time' || undefined}
        >
          {[15, 30, 60, 120].map((duration) => (
            <button
              type="button"
              key={duration}
              tabIndex={preferences.mode === 'time' ? 0 : -1}
              disabled={preferences.mode !== 'time'}
              className={`config-option ${preferences.duration === duration ? 'is-active' : ''}`}
              aria-pressed={preferences.duration === duration}
              onClick={() => onChange({ duration })}
            >
              {duration}s
            </button>
          ))}
        </div>
      </div>
      <div className="context-controls">
        {(preferences.category === 'code' || preferences.category === 'keywords') && (
          <label className="inline-select">
            language
            <select
              ref={languageRef}
              aria-label="Language"
              value={preferences.selectedLanguage}
              onChange={(event) => onChange({ selectedLanguage: event.target.value })}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="inline-select">
          difficulty
          <select
            aria-label="Difficulty"
            value={preferences.difficulty}
            onChange={(event) => onChange({ difficulty: event.target.value })}
          >
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
