import React from 'react';
import Dialog from './Dialog';

export default function AboutModal({ onClose }) {
  return (
    <Dialog title="About DevType" onClose={onClose} className="about-dialog">
      <div className="about-content">
        <p>Practice the words, symbols, and syntax you use when writing code.</p>
        <p>
          Choose full code, keyword expressions, developer vocabulary, or a symbols drill. Code and
          keyword exercises include JavaScript, Python, C++, Java, and HTML.
        </p>
        <p>
          WPM counts correct characters still in your text, divided by five, per active minute. Raw
          WPM counts all entered characters. Accuracy keeps track of mistakes and skipped letters,
          even after corrections. Automatic indentation contributes to progress, but not WPM.
        </p>
        <p>
          Inspired by{' '}
          <a href="https://monkeytype.com/" target="_blank" rel="noreferrer">
            Monkeytype
          </a>
          . Keyboard recordings by{' '}
          <a
            href="https://opengameart.org/content/keyboard-soundpack-1-typing-and-single-keystrokes"
            target="_blank"
            rel="noreferrer"
          >
            unicae_games
          </a>
          , released under CC0.
        </p>
      </div>
    </Dialog>
  );
}
