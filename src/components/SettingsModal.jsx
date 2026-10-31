import React, { useId, useState, useSyncExternalStore } from 'react';
import { Play, Volume2 } from 'lucide-react';
import Dialog from './Dialog';
import { keyboardAudio } from '../utils/audio';

function Toggle({ label, description, checked, onChange }) {
  const descriptionId = useId();
  return (
    <label className="setting-toggle">
      <span>
        <span className="setting-label">{label}</span>
        <span id={descriptionId} className="setting-description">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        aria-label={label}
        aria-describedby={descriptionId}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

const accentNames = {
  amber: 'Amber',
  mint: 'Mint',
  blue: 'Blue',
  violet: 'Violet',
  mono: 'Monochrome',
};

export default function SettingsModal({ preferences, onChange, onClose, initialTab = 'practice' }) {
  const [tab, setTab] = useState(initialTab);
  const audioStatus = useSyncExternalStore(keyboardAudio.subscribe, keyboardAudio.getStatus);
  const toggle = (key, label, description) => (
    <Toggle
      key={key}
      label={label}
      description={description}
      checked={preferences[key]}
      onChange={(value) => onChange({ [key]: value })}
    />
  );
  return (
    <Dialog title="Settings" onClose={onClose} className="settings-dialog">
      <nav className="settings-tabs" aria-label="Settings sections">
        {['practice', 'appearance', 'sound', 'shortcuts'].map((section) => (
          <button
            key={section}
            type="button"
            className={tab === section ? 'is-active' : ''}
            aria-current={tab === section ? 'page' : undefined}
            onClick={() => setTab(section)}
          >
            {section}
          </button>
        ))}
      </nav>
      <div className="settings-content">
        {tab === 'practice' && (
          <div>
            <p className="section-intro">Set up the way you practice.</p>
            {toggle(
              'autoIndent',
              'Automatic indentation',
              'Enter skips the leading spaces on the next code line. Supplied spaces do not count toward WPM.',
            )}
            {toggle(
              'showWhitespace',
              'Show whitespace',
              'Subtle dots and return marks make code spacing easier to follow.',
            )}
            {toggle(
              'masterMode',
              'Master mode',
              'Restart the exercise immediately after a mistake.',
            )}
            {toggle(
              'showKeyboard',
              'On-screen keyboard',
              'Show a keyboard below the exercise. You can also click or tap its keys.',
            )}
            {toggle(
              'showKeyHints',
              'Target key hints',
              'Highlight the next key on the on-screen keyboard.',
            )}
          </div>
        )}
        {tab === 'appearance' && (
          <div>
            <p className="section-intro">A comfortable canvas, in your own colors.</p>
            <fieldset className="setting-fieldset">
              <legend>Appearance</legend>
              <div className="segmented">
                {['dark', 'light'].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    className={preferences.colorMode === mode ? 'is-active' : ''}
                    aria-pressed={preferences.colorMode === mode}
                    onClick={() => onChange({ colorMode: mode })}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="setting-fieldset">
              <legend>Accent</legend>
              <div className="accent-options">
                {Object.entries(accentNames).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    className={preferences.themeId === id ? 'is-active' : ''}
                    aria-pressed={preferences.themeId === id}
                    onClick={() => onChange({ themeId: id })}
                  >
                    <span className={`accent-dot accent-${id}`} />
                    {name}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="setting-fieldset">
              <legend>Caret</legend>
              <div className="segmented">
                {['line', 'block', 'underline'].map((style) => (
                  <button
                    type="button"
                    key={style}
                    className={preferences.caretStyle === style ? 'is-active' : ''}
                    aria-pressed={preferences.caretStyle === style}
                    onClick={() => onChange({ caretStyle: style })}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="setting-note">
              Movement follows your device’s reduced-motion preference.
            </p>
          </div>
        )}
        {tab === 'sound' && (
          <div>
            <p className="section-intro">Real key recordings. A little feedback for your rhythm.</p>
            {toggle(
              'soundEnabled',
              'Keyboard sounds',
              'Mute applies to typing, previews, and completion cues.',
            )}
            <fieldset className="setting-fieldset">
              <legend>Sound profile</legend>
              <div className="sound-options">
                {[
                  { id: 'soft', name: 'Soft', description: 'Warm, rounded, and gently filtered.' },
                  {
                    id: 'mechanical',
                    name: 'Mechanical',
                    description: 'The clear, natural sound of the recordings.',
                  },
                ].map((profile) => (
                  <button
                    type="button"
                    key={profile.id}
                    className={preferences.soundProfile === profile.id ? 'is-active' : ''}
                    aria-pressed={preferences.soundProfile === profile.id}
                    onClick={() => onChange({ soundProfile: profile.id })}
                  >
                    <Volume2 size={16} />
                    <span>
                      <strong>{profile.name}</strong>
                      <span>{profile.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="volume-control">
              <span>
                Volume <output>{Math.round(preferences.soundVolume * 100)}%</output>
              </span>
              <input
                aria-label="Sound volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={preferences.soundVolume}
                onChange={(event) => onChange({ soundVolume: Number(event.target.value) })}
              />
            </label>
            <button
              className="text-button preview-button"
              type="button"
              disabled={
                !preferences.soundEnabled ||
                preferences.soundVolume === 0 ||
                audioStatus === 'unavailable'
              }
              onClick={() => keyboardAudio.preview()}
            >
              <Play size={14} />
              Preview sound
            </button>
            {audioStatus === 'unavailable' && (
              <p className="setting-note" role="status">
                Sound is unavailable in this browser. Typing still works.
              </p>
            )}
            {toggle(
              'completionSound',
              'Completion cue',
              'Play a short, quiet cue when a test finishes.',
            )}
            <p className="setting-note">
              Both profiles use the same CC0 recordings by unicae_games. Soft applies a gentle
              filter.
            </p>
          </div>
        )}
        {tab === 'shortcuts' && (
          <div>
            <p className="section-intro">Keep your hands on the keyboard.</p>
            <dl className="shortcuts-list">
              <div>
                <dt>
                  <kbd>esc</kbd>
                </dt>
                <dd>Restart the current exercise</dd>
              </div>
              <div>
                <dt>
                  <kbd>ctrl / ⌘</kbd> <kbd>enter</kbd>
                </dt>
                <dd>Load the next exercise</dd>
              </div>
              <div>
                <dt>
                  <kbd>backspace</kbd>
                </dt>
                <dd>Correct a character or return to a previous word</dd>
              </div>
              <div>
                <dt>
                  <kbd>ctrl / alt</kbd> <kbd>backspace</kbd>
                </dt>
                <dd>Delete the current word</dd>
              </div>
              <div>
                <dt>
                  <kbd>enter</kbd>
                </dt>
                <dd>New line in code, or next exercise on results</dd>
              </div>
              <div>
                <dt>
                  <kbd>tab</kbd>
                </dt>
                <dd>Indent at the start of a code line; otherwise move between controls</dd>
              </div>
            </dl>
            <p className="setting-note">
              Moving focus outside the exercise pauses the timer. Resume by clicking the canvas or
              typing into its input.
            </p>
          </div>
        )}
      </div>
      <div className="dialog-footer">
        <button className="button-primary" type="button" onClick={onClose}>
          Done
        </button>
      </div>
    </Dialog>
  );
}
