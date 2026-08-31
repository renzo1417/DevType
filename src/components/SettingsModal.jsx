import React, { useState } from 'react';
import {
  X,
  Volume2,
  Sliders,
  Sparkles,
  Keyboard,
  Type,
  Sun,
  Moon,
  Command
} from 'lucide-react';
import { SWITCH_SOUNDS } from '../utils/audio';
import { KEYBOARD_THEMES } from '../utils/themes';

export default function SettingsModal({
  isOpen,
  onClose,
  soundType,
  onSoundTypeChange,
  soundVolume,
  onSoundVolumeChange,
  caretStyle,
  onCaretStyleChange,
  activeTheme,
  onSelectTheme,
  showKeyboard,
  onToggleKeyboard,
  showKeyHints,
  onToggleKeyHints,
  masterMode,
  onToggleMasterMode,
  colorMode = 'dark',
  onToggleColorMode
}) {
  const [activeTab, setActiveTab] = useState('audio');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card settings-horizontal-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders size={16} className="accent-text" />
            <h3 className="modal-title">Preferences</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close preferences"
          >
            <X size={16} />
          </button>
        </div>

        {/* Horizontal Modal Container: Left Nav Sidebar + Right Content Area */}
        <div className="horizontal-settings-layout">
          {/* Left Navigation Sidebar */}
          <nav className="settings-sidebar" aria-label="Settings Categories">
            <button
              type="button"
              className={`sidebar-nav-tab ${activeTab === 'audio' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              <Volume2 size={15} />
              <span>Audio</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-tab ${activeTab === 'themes' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('themes')}
            >
              <Keyboard size={15} />
              <span>Themes</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-tab ${activeTab === 'visuals' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('visuals')}
            >
              <Type size={15} />
              <span>Visuals</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-tab ${activeTab === 'shortcuts' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              <Command size={15} />
              <span>Shortcuts</span>
            </button>
          </nav>

          {/* Right Content Panel */}
          <div className="settings-panel-content">
            {/* TAB 1: AUDIO */}
            {activeTab === 'audio' && (
              <div className="settings-tab-pane animate-fade-in">
                <div className="pref-section">
                  <div className="pref-section-title">
                    <span>Mechanical Switch Audio Profiles</span>
                  </div>

                  <div className="sound-profile-grid">
                    {SWITCH_SOUNDS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`sound-profile-btn ${soundType === s.id ? 'is-active' : ''}`}
                        onClick={() => onSoundTypeChange(s.id)}
                      >
                        <span className="profile-name">{s.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pref-row" style={{ marginTop: '1.25rem' }}>
                    <div className="pref-label-with-val">
                      <label className="pref-label">Volume</label>
                      <span className="font-mono text-muted">{Math.round(soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => onSoundVolumeChange(parseFloat(e.target.value))}
                      className="range-slider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: THEMES & COLOR MODE */}
            {activeTab === 'themes' && (
              <div className="settings-tab-pane animate-fade-in">
                <div className="pref-section">
                  <div className="pref-section-title">
                    <span>Base Appearance</span>
                  </div>

                  <div className="pref-segmented-control" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '1.25rem' }}>
                    <button
                      type="button"
                      className={`seg-btn ${colorMode === 'dark' ? 'is-active' : ''}`}
                      onClick={() => colorMode !== 'dark' && onToggleColorMode()}
                    >
                      <Moon size={14} />
                      <span>Dark Theme</span>
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${colorMode === 'light' ? 'is-active' : ''}`}
                      onClick={() => colorMode !== 'light' && onToggleColorMode()}
                    >
                      <Sun size={14} />
                      <span>Light Theme</span>
                    </button>
                  </div>

                  <div className="pref-section-title">
                    <span>Accent Palettes</span>
                  </div>

                  <div className="theme-grid">
                    {KEYBOARD_THEMES.map((theme) => (
                      <div
                        key={theme.id}
                        className={`theme-card-option ${activeTheme.id === theme.id ? 'is-selected' : ''}`}
                        onClick={() => onSelectTheme(theme.id)}
                      >
                        <div className="theme-card-swatches">
                          <span className="swatch-main" style={{ backgroundColor: theme.accent }} />
                          <span className="swatch-sub" style={{ backgroundColor: theme.keycapShadow }} />
                        </div>
                        <div className="theme-card-info">
                          <div className="theme-card-name">{theme.name}</div>
                          <div className="theme-card-sub">{theme.subtitle}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VISUALS & CARET */}
            {activeTab === 'visuals' && (
              <div className="settings-tab-pane animate-fade-in">
                <div className="pref-section">
                  <div className="pref-section-title">
                    <span>Caret Style</span>
                  </div>

                  <div className="pref-segmented-control" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.25rem' }}>
                    {[
                      { id: 'line', label: 'Line' },
                      { id: 'block', label: 'Block' },
                      { id: 'underline', label: 'Underline' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`seg-btn ${caretStyle === c.id ? 'is-active' : ''}`}
                        onClick={() => onCaretStyleChange(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="pref-section-title">
                    <span>Keyboard & Behavior</span>
                  </div>

                  <div className="pref-toggle-list">
                    <div className="pref-toggle-item" onClick={onToggleKeyHints}>
                      <div>
                        <div className="toggle-label">Keycap Target Hints</div>
                        <div className="toggle-desc">Highlights expected key on virtual keyboard</div>
                      </div>
                      <div className={`switch-pill ${showKeyHints ? 'is-on' : ''}`} />
                    </div>

                    <div className="pref-toggle-item" onClick={onToggleKeyboard}>
                      <div>
                        <div className="toggle-label">Virtual Keyboard</div>
                        <div className="toggle-desc">Display mechanical keyboard layout below typing area</div>
                      </div>
                      <div className={`switch-pill ${showKeyboard ? 'is-on' : ''}`} />
                    </div>

                    <div className="pref-toggle-item" onClick={onToggleMasterMode}>
                      <div>
                        <div className="toggle-label">Master Mode</div>
                        <div className="toggle-desc">Instantly restarts test on a single syntax error</div>
                      </div>
                      <div className={`switch-pill ${masterMode ? 'is-on' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SHORTCUTS */}
            {activeTab === 'shortcuts' && (
              <div className="settings-tab-pane animate-fade-in">
                <div className="pref-section">
                  <div className="pref-section-title">
                    <span>Keyboard Shortcuts</span>
                  </div>

                  <div className="shortcuts-grid">
                    <div className="shortcut-row">
                      <span className="shortcut-keys"><kbd>Esc</kbd></span>
                      <span className="shortcut-desc">Instant Test Restart</span>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span>
                      <span className="shortcut-desc">Next Code Snippet</span>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-keys"><kbd>Tab</kbd></span>
                      <span className="shortcut-desc">Indents 2 spaces</span>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-keys"><kbd>Click outside</kbd></span>
                      <span className="shortcut-desc">Pause & preserve progress</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-primary modal-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
