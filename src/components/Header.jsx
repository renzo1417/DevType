import React from 'react';
import {
  Volume2,
  VolumeX,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({
  soundType,
  soundVolume,
  onToggleSound,
  onOpenSettings,
  colorMode = 'dark',
  onToggleColorMode
}) {
  const isMuted = soundType === 'silent' || soundVolume === 0;

  return (
    <header className="app-header">
      <div className="header-left">
        <a href="/" className="brand-logo" onClick={(e) => e.preventDefault()}>
          <div className="brand-symbol">&lt;dev/type&gt;</div>
          <span className="brand-version-badge">v2.0</span>
        </a>
      </div>

      <div className="header-right">
        {/* Color Mode Toggle */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={onToggleColorMode}
          title={colorMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label={colorMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {colorMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          className={`header-icon-btn ${isMuted ? 'is-muted' : ''}`}
          onClick={onToggleSound}
          title={isMuted ? 'Unmute typing sound' : `Sound: ${soundType} (Click to mute)`}
          aria-label="Toggle mechanical switch sound"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Settings */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={onOpenSettings}
          title="Settings & Preferences"
          aria-label="Open settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
