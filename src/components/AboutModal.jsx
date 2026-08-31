import React from 'react';
import { X, Code2, Keyboard, Volume2, Zap } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card about-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="brand-symbol">&lt;dev/type&gt;</div>
            <span className="brand-version-badge">v2.0</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close about dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body about-modal-body">
          <div className="about-hero">
            <h4>Developer-First Syntax Typing</h4>
            <p>
              DevType trains real muscle memory on authentic programming syntax, symbols, brackets,
              indentation, and language idioms across JavaScript, Python, C++, Java, and HTML.
            </p>
          </div>

          <div className="about-features-grid">
            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Code2 size={16} />
              </div>
              <div className="about-feature-text">
                <h5>Real Code Snippets</h5>
                <p>Curated realistic code patterns categorized by Easy, Intermediate, and Advanced tiers.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Keyboard size={16} />
              </div>
              <div className="about-feature-text">
                <h5>Interactive Orange Keyboard</h5>
                <p>Tactile mechanical keycaps with live keypress depression, target hints, and error feedback.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Volume2 size={16} />
              </div>
              <div className="about-feature-text">
                <h5>Mechanical Switch Audio</h5>
                <p>Web Audio API acoustic synthesis: Cream Thock, Clicky, Holy Panda Tactile, Topre, and more.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <div className="about-feature-icon">
                <Zap size={16} />
              </div>
              <div className="about-feature-text">
                <h5>Live Telemetry & Pause</h5>
                <p>Accurate real-time WPM, precision accuracy, seamless pause/resume, and instant Esc restart.</p>
              </div>
            </div>
          </div>

          <div className="about-shortcuts-box">
            <div className="shortcuts-box-title">Shortcuts</div>
            <div className="about-shortcuts-list">
              <div className="about-shortcut-row">
                <span className="shortcut-keys"><kbd>Esc</kbd></span>
                <span className="shortcut-desc">Instant Test Restart</span>
              </div>
              <div className="about-shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span>
                <span className="shortcut-desc">Next Code Snippet</span>
              </div>
              <div className="about-shortcut-row">
                <span className="shortcut-keys"><kbd>Tab</kbd></span>
                <span className="shortcut-desc">Type 2 spaces</span>
              </div>
            </div>
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
