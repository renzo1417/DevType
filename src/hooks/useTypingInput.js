import { useEffect, useRef, useState } from 'react';
import { canIndent } from '../engine/session';
import { keyboardAudio } from '../utils/audio';

export function useTypingInput(inputRef, session, send) {
  const currentSession = useRef(session);
  currentSession.current = session;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const input = inputRef.current;
    let composing = false;
    const insert = (text) => {
      if (text) send({ type: 'insert', text });
    };
    const keydown = (event) => {
      if (keyboardAudio.context?.state === 'suspended') keyboardAudio.unlock();
      if (composing || event.isComposing || event.keyCode === 229) return;
      if (event.key === 'Backspace') {
        event.preventDefault();
        send({ type: 'backspace', wholeWord: event.ctrlKey || event.altKey || event.metaKey });
      } else if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        insert('\n');
      } else if (event.key === 'Tab' && !event.shiftKey && canIndent(currentSession.current)) {
        event.preventDefault();
        insert('\t');
      } else if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault();
      }
    };
    const beforeinput = (event) => {
      if (keyboardAudio.context?.state === 'suspended') keyboardAudio.unlock();
      if (/Paste|Drop|history|FromComposition/.test(event.inputType)) {
        event.preventDefault();
        return;
      }
      if (
        composing ||
        event.isComposing ||
        event.inputType === 'insertCompositionText' ||
        !event.cancelable
      )
        return;
      if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteWordBackward') {
        event.preventDefault();
        send({ type: 'backspace', wholeWord: event.inputType === 'deleteWordBackward' });
      } else if (event.inputType?.startsWith('insert')) {
        event.preventDefault();
        insert(
          event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph'
            ? '\n'
            : event.data,
        );
      }
    };
    const fallbackInput = (event) => {
      if (composing || event.isComposing) return;
      if (/Paste|Drop|history|FromComposition/.test(event.inputType)) {
        input.value = '';
        return;
      }
      if (event.inputType === 'deleteContentBackward') send({ type: 'backspace' });
      else insert(input.value);
      input.value = '';
    };
    const compositionstart = () => {
      composing = true;
    };
    const compositionend = (event) => {
      composing = false;
      input.value = '';
      insert(event.data);
    };
    const prevent = (event) => event.preventDefault();
    const focus = () => {
      setFocused(true);
      keyboardAudio.unlock();
    };
    const blur = () => {
      setFocused(false);
      send({ type: 'pause' });
    };
    const handlers = {
      keydown,
      beforeinput,
      input: fallbackInput,
      compositionstart,
      compositionend,
      paste: prevent,
      drop: prevent,
      focus,
      blur,
    };
    for (const [type, handler] of Object.entries(handlers)) input.addEventListener(type, handler);
    const frame = matchMedia('(pointer: fine)').matches
      ? requestAnimationFrame(() => {
          if (document.activeElement === document.body) input.focus({ preventScroll: true });
        })
      : null;
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      for (const [type, handler] of Object.entries(handlers))
        input.removeEventListener(type, handler);
    };
  }, [inputRef, send]);

  return focused;
}
