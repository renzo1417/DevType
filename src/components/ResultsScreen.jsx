import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  ArrowRight,
  Code2,
  Share2,
  CheckCircle2
} from 'lucide-react';
import PerformanceChart from './PerformanceChart';

export default function ResultsScreen({
  stats = {
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    totalChars: 0,
    duration: 30,
    timeTaken: 30,
    language: 'javascript',
    snippetTitle: '',
    difficulty: 'Beginner',
    timeline: []
  },
  onRestart,
  onNextSnippet,
  onOpenLanguagePicker
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (stats.accuracy >= 90 && stats.wpm > 25) {
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#ea580c', '#38bdf8', '#22c55e', '#ffffff']
        });
      } catch (e) {}
    }
  }, [stats]);

  // Keyboard shortcut listener for Enter / Esc to restart
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey)) {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const handleCopyResult = () => {
    const text = `⚡ DevType v2.0 Result\n` +
      `Language: ${stats.language.toUpperCase()} (${stats.difficulty})\n` +
      `WPM: ${Math.round(stats.wpm)} (Raw: ${Math.round(stats.rawWpm)})\n` +
      `Accuracy: ${stats.accuracy.toFixed(1)}%\n` +
      `Time: ${Math.round(stats.timeTaken)}s`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="results-container animate-fade-in">
      {/* Header Info */}
      <div className="results-header">
        <div className="results-meta">
          <span className="results-lang font-mono">{stats.language.toUpperCase()}</span>
          <span className="results-divider">•</span>
          <span className="results-title-text">{stats.snippetTitle || 'Custom Code'}</span>
          <span className="results-divider">•</span>
          <span className="results-difficulty-badge">{stats.difficulty}</span>
        </div>
      </div>

      {/* Main Stats Summary Grid */}
      <div className="results-stats-row">
        {/* Net WPM */}
        <div className="result-stat-block">
          <div className="result-stat-label">wpm</div>
          <div className="result-stat-number accent-text font-mono">
            {Math.round(stats.wpm)}
          </div>
          <div className="result-stat-sub font-mono">
            raw {Math.round(stats.rawWpm)}
          </div>
        </div>

        {/* Accuracy */}
        <div className="result-stat-block">
          <div className="result-stat-label">acc</div>
          <div className="result-stat-number font-mono">
            {stats.accuracy.toFixed(1)}%
          </div>
          <div className="result-stat-sub font-mono">
            {stats.correctChars} / {stats.incorrectChars}
          </div>
        </div>

        {/* Characters Breakdown */}
        <div className="result-stat-block">
          <div className="result-stat-label">characters</div>
          <div className="result-stat-number font-mono chars-number">
            <span className="char-ok">{stats.correctChars}</span>
            <span className="char-slash">/</span>
            <span className="char-err">{stats.incorrectChars}</span>
          </div>
          <div className="result-stat-sub font-mono">
            correct / errors
          </div>
        </div>

        {/* Time Taken */}
        <div className="result-stat-block">
          <div className="result-stat-label">time</div>
          <div className="result-stat-number font-mono">
            {Math.round(stats.timeTaken)}s
          </div>
          <div className="result-stat-sub font-mono">
            {stats.duration ? `${stats.duration}s test` : 'completed'}
          </div>
        </div>
      </div>

      {/* Performance Graph */}
      {stats.timeline && stats.timeline.length > 1 && (
        <div className="results-chart-section">
          <PerformanceChart timeline={stats.timeline} />
        </div>
      )}

      {/* Minimal Action Buttons */}
      <div className="results-actions">
        <button
          type="button"
          className="result-action-btn primary"
          onClick={onRestart}
          title="Restart Test (Esc)"
        >
          <RotateCcw size={15} />
          <span>Restart <kbd className="btn-kbd">Esc</kbd></span>
        </button>

        <button
          type="button"
          className="result-action-btn"
          onClick={onNextSnippet}
          title="Next Snippet"
        >
          <ArrowRight size={15} />
          <span>Next Snippet</span>
        </button>

        <button
          type="button"
          className="result-action-btn"
          onClick={onOpenLanguagePicker}
        >
          <Code2 size={15} />
          <span>Change Language</span>
        </button>

        <button
          type="button"
          className="result-action-btn ghost"
          onClick={handleCopyResult}
        >
          {copied ? <CheckCircle2 size={15} className="accent-text" /> : <Share2 size={15} />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
}
