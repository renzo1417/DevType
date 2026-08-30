import React from 'react';
import { X, Code2, Sparkles, Volume2, Keyboard, Zap, Shield, Heart } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card about-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="about-brand-badge">
              <span className="brand-symbol">&lt;/&gt;</span>
            </div>
            <div>
              <h3 className="modal-title">About DevType</h3>
              <span className="about-subtitle">Syntax Speedtyper v1.0</span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close about dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body about-modal-body">
          {/* Mission Hero */}
          <div className="about-hero">
            <h4>Developer-First Typing Ergonomics</h4>
            <p>
              DevType is designed specifically for programmers and syntax enthusiasts.
              Unlike generic typing tests that focus solely on standard English words, DevType trains
              your muscle memory on authentic programming structures, brackets, punctuation, async patterns,
              and indentation.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="about-features-grid">
            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Code2 size={18} />
              </div>
              <div className="about-feature-text">
                <h5>Authentic Code Syntax</h5>
                <p>Curated real-world snippets across JavaScript, Python, C++, Java, and HTML.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Keyboard size={18} />
              </div>
              <div className="about-feature-text">
                <h5>Tactile 60% Keyboard</h5>
                <p>Interactive mechanical layout with live key tracking, target hints, and theme sync.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Volume2 size={18} />
              </div>
              <div className="about-feature-text">
                <h5>Synthesized Mechanical Audio</h5>
                <p>Web Audio API physical switch acoustic profiles: Thock, Clicky, Tactile, Topre, and more.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Zap size={18} />
              </div>
              <div className="about-feature-text">
                <h5>Live Telemetry & Analytics</h5>
                <p>Real-time WPM, raw speed, precision accuracy, and timeline performance graphs.</p>
              </div>
            </div>
          </div>

          {/* Shortcuts Reference */}
          <div className="about-shortcuts-box">
            <div className="shortcuts-box-title">Key Navigation Shortcuts</div>
            <div className="about-shortcuts-list">
              <div className="about-shortcut-row">
                <span className="shortcut-keys"><kbd>Tab</kbd> + <kbd>Enter</kbd> or <kbd>Esc</kbd></span>
                <span className="shortcut-desc">Instant Test Restart</span>
              </div>
              <div className="about-shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span>
                <span className="shortcut-desc">Next Code Snippet</span>
              </div>
            </div>
          </div>

          {/* Tech & Credits */}
          <div className="about-footer-info">
            <span>Built with React, Vite & Web Audio API • JetBrains Mono & IBM Plex Sans</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-primary modal-done-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
