import React from 'react';
import {
  Code2,
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
          <div className="brand-icon-box">
            <span className="brand-symbol">&lt;/&gt;</span>
          </div>
          <div className="brand-text-group">
            <h1 className="brand-title">DevType</h1>
            <span className="brand-tagline">Syntax Speedtyper</span>
          </div>
        </a>
      </div>

      <div className="header-right">
        {/* Light / Dark Mode Toggle Button */}
        <button
          type="button"
          className="header-btn"
          onClick={onToggleColorMode}
          title={colorMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={colorMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {colorMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>


        {/* Sound Toggle Button */}
        <button
          type="button"
          className={`header-btn ${isMuted ? 'is-muted' : ''}`}
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Mechanical Audio' : `Audio: ${soundType} (Click to mute)`}
          aria-label="Toggle mechanical switch audio"
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          className="header-btn"
          onClick={onOpenSettings}
          title="Open Settings & Preferences"
          aria-label="Open settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}

