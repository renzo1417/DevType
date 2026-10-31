import React from 'react';
import { Settings2, Sun, Moon, Volume2, VolumeX } from 'lucide-react';

export default function Header({ preferences, onChange, onSettings, onHome }) {
  const muted = !preferences.soundEnabled || preferences.soundVolume === 0;
  return (
    <header className="app-header">
      <button className="brand" type="button" onClick={onHome} aria-label="DevType home">
        <span className="brand-mark" aria-hidden="true">
          &gt;_
        </span>
        <span>
          devtype<span className="brand-dot">.</span>
        </span>
        <span className="brand-description">syntax practice</span>
      </button>
      <nav className="header-actions" aria-label="Appearance and preferences">
        <button
          className="icon-button"
          type="button"
          onClick={() =>
            onChange({ colorMode: preferences.colorMode === 'dark' ? 'light' : 'dark' })
          }
          aria-label={`Switch to ${preferences.colorMode === 'dark' ? 'light' : 'dark'} theme`}
          title="Change appearance"
        >
          {preferences.colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() =>
            onChange(
              muted
                ? { soundEnabled: true, soundVolume: preferences.soundVolume || 0.35 }
                : { soundEnabled: false },
            )
          }
          aria-label={muted ? 'Unmute keyboard sounds' : 'Mute keyboard sounds'}
          aria-pressed={!muted}
          title={muted ? 'Sound off' : 'Sound on'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={onSettings}
          aria-label="Open settings"
          title="Settings"
        >
          <Settings2 size={18} />
        </button>
      </nav>
    </header>
  );
}
