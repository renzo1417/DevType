import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Languages, Copy, Check } from 'lucide-react';
import PerformanceChart from './PerformanceChart';

export default function ResultsScreen({ session, stats, onRestart, onNext, onLanguage }) {
  const [copyStatus, setCopyStatus] = useState('');
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const { config } = session;
  const share = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(
        `DevType\n${config.category} · ${config.selectedLanguage} · ${config.mode === 'time' ? `${config.duration}s` : 'snippet'}\n${Math.round(stats.wpm)} WPM · ${Math.round(stats.rawWpm)} raw · ${stats.accuracy.toFixed(1)}% accuracy\n${stats.timeTaken.toFixed(1)}s active time`,
      );
      setCopyStatus('Result copied.');
    } catch {
      setCopyStatus('Could not copy. Please allow clipboard access and try again.');
    }
  };
  return (
    <section className="results-screen" aria-label="Test results">
      <div className="results-intro">
        <div>
          <p className="eyebrow">
            {config.category} / {config.mode === 'time' ? `${config.duration} seconds` : 'snippet'}
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            Test complete.
          </h1>
        </div>
        <span className="result-exercise">{session.chunks[0].exercise.title}</span>
      </div>
      <div className="results-stats">
        <div>
          <span className="stat-label">wpm</span>
          <strong className="result-wpm" data-testid="result-wpm">
            {Math.round(stats.wpm)}
          </strong>
          <span className="stat-sub">{Math.round(stats.rawWpm)} raw</span>
        </div>
        <div>
          <span className="stat-label">accuracy</span>
          <strong data-testid="result-accuracy">
            {stats.accuracy.toFixed(1)}
            <small>%</small>
          </strong>
          <span className="stat-sub">all attempts included</span>
        </div>
        <div>
          <span className="stat-label">active time</span>
          <strong>
            {stats.timeTaken.toFixed(1)}
            <small>s</small>
          </strong>
          <span className="stat-sub">paused time excluded</span>
        </div>
      </div>
      <div className="character-summary">
        <span>characters</span>
        <strong data-testid="character-breakdown">
          {stats.correctChars} / {stats.incorrectChars} / {stats.extraChars} / {stats.missedChars}
        </strong>
        <span>correct / incorrect / extra / missed</span>
      </div>
      <p className="result-progress" data-testid="result-progress">
        {stats.progress} {config.category === 'words' ? 'words' : 'characters'} completed
        {stats.automaticChars
          ? ` · ${stats.automaticChars} spacing characters supplied automatically`
          : ''}
      </p>
      <PerformanceChart timeline={stats.timeline} />
      <div className="results-actions">
        <button className="button-primary" type="button" onClick={onNext}>
          <ArrowRight size={16} />
          Next exercise
        </button>
        <button className="text-button" type="button" onClick={onRestart}>
          <RotateCcw size={15} />
          Retry
        </button>
        <button className="text-button" type="button" onClick={onLanguage}>
          <Languages size={15} />
          Change language
        </button>
        <button className="text-button share-button" type="button" onClick={share}>
          {copyStatus === 'Result copied.' ? <Check size={15} /> : <Copy size={15} />}Copy result
        </button>
      </div>
      <p className="copy-status" role="status">
        {copyStatus}
      </p>
    </section>
  );
}
