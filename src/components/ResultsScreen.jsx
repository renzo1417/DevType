import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  ArrowRight,
  Code2,
  Share2,
  CheckCircle2,
  Award,
  Zap,
  Target,
  Clock,
  AlertCircle
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
    missedChars: 0,
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
    // Trigger celebratory confetti if accuracy is good or high WPM
    if (stats.accuracy >= 90 && stats.wpm > 20) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#38bdf8', '#a855f7', '#f97316', '#ffffff']
        });
      } catch (e) {
        // ignore in non-browser or sandbox
      }
    }
  }, [stats]);

  // Keyboard shortcut listener for Tab + Enter or Esc or Space
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
    const text = `⚡ DevType Speedtyper Result\n` +
      `Language: ${stats.language.toUpperCase()}\n` +
      `Speed: ${Math.round(stats.wpm)} WPM (Raw: ${Math.round(stats.rawWpm)} WPM)\n` +
      `Accuracy: ${stats.accuracy.toFixed(1)}%\n` +
      `Characters: ${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}\n` +
      `Time: ${Math.round(stats.timeTaken)}s`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="results-container animate-fade-in">
      {/* Header Banner */}
      <div className="results-hero">
        <div className="results-badge">
          <Award size={16} className="accent-text" />
          <span>SYNTAX TEST COMPLETE</span>
        </div>
        <h2 className="results-title">Great Performance</h2>
        <p className="results-subtitle">
          {stats.snippetTitle || stats.language.toUpperCase()} • {stats.difficulty} Tier
        </p>
      </div>

      {/* Hero Metrics Row */}
      <div className="results-grid">
        {/* Net WPM Big Card */}
        <div className="stat-card hero-card">
          <div className="stat-card-label">
            <Zap size={16} className="accent-text" />
            <span>NET WPM</span>
          </div>
          <div className="stat-card-value font-mono accent-text">
            {Math.round(stats.wpm)}
          </div>
          <div className="stat-card-sub text-muted font-mono">
            Raw: {Math.round(stats.rawWpm)} WPM
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="stat-card">
          <div className="stat-card-label">
            <Target size={16} className="accent-text" />
            <span>ACCURACY</span>
          </div>
          <div className="stat-card-value font-mono">
            {stats.accuracy.toFixed(1)}<span className="unit">%</span>
          </div>
          <div className="stat-card-sub text-muted font-mono">
            {stats.correctChars} correct / {stats.incorrectChars + stats.extraChars} errors
          </div>
        </div>

        {/* Characters Breakdown Card */}
        <div className="stat-card">
          <div className="stat-card-label">
            <Code2 size={16} className="accent-text" />
            <span>CHARACTERS</span>
          </div>
          <div className="stat-card-value font-mono char-breakdown">
            <span className="char-ok" title="Correct">{stats.correctChars}</span>
            <span className="char-divider">/</span>
            <span className="char-err" title="Incorrect">{stats.incorrectChars}</span>
            <span className="char-divider">/</span>
            <span className="char-extra" title="Extra">{stats.extraChars}</span>
          </div>
          <div className="stat-card-sub text-muted font-mono">
            cor / inc / extra
          </div>
        </div>

        {/* Duration Card */}
        <div className="stat-card">
          <div className="stat-card-label">
            <Clock size={16} className="accent-text" />
            <span>TEST DURATION</span>
          </div>
          <div className="stat-card-value font-mono">
            {Math.round(stats.timeTaken)}<span className="unit">s</span>
          </div>
          <div className="stat-card-sub text-muted font-mono">
            Mode: {stats.duration ? `${stats.duration}s timer` : 'Code completion'}
          </div>
        </div>
      </div>

      {/* Interactive Performance Graph */}
      <div className="results-chart-section">
        <PerformanceChart timeline={stats.timeline} />
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button
          type="button"
          className="btn-action btn-primary"
          onClick={onRestart}
          title="Restart (Tab + Enter or Esc)"
        >
          <RotateCcw size={16} />
          <span>Restart Test <kbd className="btn-kbd">Esc</kbd></span>
        </button>

        <button
          type="button"
          className="btn-action btn-secondary"
          onClick={onNextSnippet}
        >
          <ArrowRight size={16} />
          <span>Next Snippet</span>
        </button>

        <button
          type="button"
          className="btn-action btn-outline"
          onClick={onOpenLanguagePicker}
        >
          <Code2 size={16} />
          <span>Change Language</span>
        </button>

        <button
          type="button"
          className="btn-action btn-ghost"
          onClick={handleCopyResult}
        >
          {copied ? <CheckCircle2 size={16} className="accent-text" /> : <Share2 size={16} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Share Score'}</span>
        </button>
      </div>
    </div>
  );
}
