import React, { memo, useLayoutEffect, useMemo, useRef } from 'react';
import { MousePointer2, Play } from 'lucide-react';
import { useTypingInput } from '../hooks/useTypingInput';
import { getCurrentExercise } from '../engine/session';

function codeLines(target) {
  const lines = [[]];
  target.forEach((token, index) => {
    lines.at(-1).push({ ...token, index });
    if (token.char === '\n') lines.push([]);
  });
  return lines.map((line) => {
    const groups = [];
    for (const cell of line) {
      const whitespace = /\s/.test(cell.char);
      if (!groups.length || groups.at(-1).whitespace !== whitespace)
        groups.push({ whitespace, cells: [] });
      groups.at(-1).cells.push(cell);
    }
    return groups;
  });
}

function Character({
  expected,
  typed,
  automatic,
  missed,
  active,
  extra,
  showWhitespace,
  blocked,
  activeRef,
}) {
  const correct = typed !== undefined && typed === expected;
  const wrong = typed !== undefined && !correct;
  const newline = expected === '\n';
  let visible = typed ?? expected;
  if (newline) visible = showWhitespace || active || blocked ? '↵' : '\u00a0';
  else if (visible === ' ') visible = showWhitespace && typed === undefined ? '·' : '\u00a0';
  return (
    <span
      ref={active ? activeRef : null}
      className={`code-char${correct ? ' char-correct' : ''}${wrong || blocked ? ' char-incorrect' : ''}${extra ? ' char-extra' : ''}${missed ? ' char-missed' : ''}${automatic ? ' char-automatic' : ''}${newline ? ' char-newline' : ''}`}
      data-expected={expected}
      data-active={active || undefined}
      title={
        wrong
          ? `Expected ${expected === ' ' ? 'a space' : expected}`
          : missed
            ? 'Missing character'
            : undefined
      }
    >
      {visible}
    </span>
  );
}

function TypingArea({ session, preferences, send, inputRef }) {
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const caretRef = useRef(null);
  const activeRef = useRef(null);
  const previousRow = useRef(null);
  const focused = useTypingInput(inputRef, session, send);
  const isWords = preferences.category === 'words';
  const lines = useMemo(() => codeLines(session.target), [session.target]);
  const rows = isWords ? 3 : 6;
  const paused = session.status === 'paused';

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const caret = caretRef.current;
    const measure = () => {
      if (!activeRef.current) return;
      const active = activeRef.current.getBoundingClientRect();
      const origin = content.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(content).lineHeight);
      const x = active.left - origin.left;
      const y = active.top - origin.top;
      const row = Math.round(y / lineHeight);
      const scroll = Math.max(
        0,
        Math.min(
          (row - (isWords ? 1 : 2)) * lineHeight,
          content.offsetHeight - viewport.clientHeight,
        ),
      );
      caret.style.transitionProperty = previousRow.current === row ? 'transform' : 'none';
      caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      caret.style.setProperty('--character-width', `${active.width || lineHeight * 0.36}px`);
      content.style.transform = `translate3d(0, ${-scroll}px, 0)`;
      previousRow.current = row;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) measure();
    });
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [session.entries, session.words, session.wordIndex, session.target, isWords]);

  const focus = () => {
    inputRef.current?.focus({ preventScroll: true });
    if (paused) send({ type: 'resume' });
  };

  return (
    <section
      className={`typing-section ${isWords ? 'words-mode' : 'code-mode'} ${focused ? 'has-focus' : ''}`}
      aria-label="Typing exercise"
    >
      <p id="typing-instructions" className="sr-only">
        Type the displayed text. Backspace corrects mistakes. Escape restarts. Control or Command
        and Enter loads the next exercise. Tab moves to controls, or indents at the start of a code
        line.
      </p>
      <p id="typing-target" className="sr-only">
        Current exercise: {getCurrentExercise(session).code}
      </p>
      <div
        className="code-card"
        ref={viewportRef}
        onClick={focus}
        style={{ '--visible-rows': rows }}
      >
        <textarea
          ref={inputRef}
          className="typing-input"
          aria-label="Typing input"
          aria-describedby="typing-instructions typing-target"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          rows={1}
        />
        <div ref={contentRef} className="code-display" aria-hidden="true">
          {isWords ? (
            <div className="word-stream">
              {session.words.map((word, wordIndex) => {
                const typed = Array.from(word.input);
                const target = Array.from(word.target);
                const activeWord = wordIndex === session.wordIndex;
                const error = word.committed && word.input !== word.target;
                return (
                  <span
                    className={`prompt-word${error ? ' word-incorrect' : ''}`}
                    key={wordIndex}
                    data-word={wordIndex}
                  >
                    {target.map((char, index) => (
                      <Character
                        key={index}
                        expected={char}
                        typed={typed[index]}
                        missed={word.committed && index >= typed.length}
                        active={activeWord && index === typed.length}
                        activeRef={activeRef}
                      />
                    ))}
                    {typed.slice(target.length).map((char, index) => (
                      <Character key={`extra-${index}`} expected="" typed={char} extra />
                    ))}
                    <span
                      className="word-end"
                      ref={activeWord && typed.length >= target.length ? activeRef : null}
                    />
                  </span>
                );
              })}
            </div>
          ) : (
            lines.map((groups, lineIndex) => (
              <div className="code-line" key={lineIndex}>
                {groups.map((group, groupIndex) => (
                  <span
                    className={`code-group${group.whitespace ? ' whitespace-group' : ''}`}
                    key={groupIndex}
                  >
                    {group.cells.map((cell) => (
                      <Character
                        key={cell.index}
                        expected={cell.char}
                        typed={session.entries[cell.index]?.char}
                        automatic={session.entries[cell.index]?.automatic}
                        active={cell.index === session.entries.length}
                        blocked={session.blockedAt === cell.index}
                        showWhitespace={preferences.showWhitespace}
                        activeRef={activeRef}
                      />
                    ))}
                  </span>
                ))}
              </div>
            ))
          )}
          <div
            ref={caretRef}
            className={`typing-caret caret-${preferences.caretStyle}${session.status === 'idle' ? ' is-idle' : ''}`}
            data-testid="typing-caret"
          />
        </div>
        {(!focused || paused) && (
          <button className="focus-prompt" type="button" onClick={focus}>
            {paused ? <Play size={16} /> : <MousePointer2 size={16} />}
            <span>{paused ? 'Paused. Click or tap to resume' : 'Click or tap here to type'}</span>
          </button>
        )}
      </div>
      <div className="exercise-hint" aria-live="polite">
        {session.notice ||
          (isWords
            ? 'Space moves to the next word. Backspace lets you correct it.'
            : 'Follow the code. Enter starts a new line.' +
              (preferences.autoIndent ? ' Indentation is automatic.' : ''))}
      </div>
    </section>
  );
}

export default memo(TypingArea);
