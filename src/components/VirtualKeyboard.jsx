import React, { useEffect, useMemo, useState } from 'react';
import KeyCap from './KeyCap';

export const ORANGE_KEYBOARD_LAYOUT = [
  // Row 1: Number & Symbol Row
  [
    { code: 'Backquote', primary: '`', secondary: '~', width: 1 },
    { code: 'Digit1', primary: '1', secondary: '!', width: 1 },
    { code: 'Digit2', primary: '2', secondary: '@', width: 1 },
    { code: 'Digit3', primary: '3', secondary: '#', width: 1 },
    { code: 'Digit4', primary: '4', secondary: '$', width: 1 },
    { code: 'Digit5', primary: '5', secondary: '%', width: 1 },
    { code: 'Digit6', primary: '6', secondary: '^', width: 1 },
    { code: 'Digit7', primary: '7', secondary: '&', width: 1 },
    { code: 'Digit8', primary: '8', secondary: '*', width: 1 },
    { code: 'Digit9', primary: '9', secondary: '(', width: 1 },
    { code: 'Digit0', primary: '0', secondary: ')', width: 1 },
    { code: 'Minus', primary: '-', secondary: '_', width: 1 },
    { code: 'Equal', primary: '=', secondary: '+', width: 1 },
    { code: 'Backspace', primary: 'Backspace', width: 1.85, isModifier: true },
  ],
  // Row 2: QWERTY Top Alpha
  [
    { code: 'Tab', primary: 'Tab', width: 1.45, isModifier: true },
    { code: 'KeyQ', primary: 'Q', width: 1 },
    { code: 'KeyW', primary: 'W', width: 1 },
    { code: 'KeyE', primary: 'E', width: 1 },
    { code: 'KeyR', primary: 'R', width: 1 },
    { code: 'KeyT', primary: 'T', width: 1 },
    { code: 'KeyY', primary: 'Y', width: 1 },
    { code: 'KeyU', primary: 'U', width: 1 },
    { code: 'KeyI', primary: 'I', width: 1 },
    { code: 'KeyO', primary: 'O', width: 1 },
    { code: 'KeyP', primary: 'P', width: 1 },
    { code: 'BracketLeft', primary: '[', secondary: '{', width: 1 },
    { code: 'BracketRight', primary: ']', secondary: '}', width: 1 },
    { code: 'Backslash', primary: '\\', secondary: '|', width: 1.4 },
  ],
  // Row 3: ASDF Home Row
  [
    { code: 'CapsLock', primary: 'Caps', width: 1.75, isModifier: true },
    { code: 'KeyA', primary: 'A', width: 1 },
    { code: 'KeyS', primary: 'S', width: 1 },
    { code: 'KeyD', primary: 'D', width: 1 },
    { code: 'KeyF', primary: 'F', width: 1 },
    { code: 'KeyG', primary: 'G', width: 1 },
    { code: 'KeyH', primary: 'H', width: 1 },
    { code: 'KeyJ', primary: 'J', width: 1 },
    { code: 'KeyK', primary: 'K', width: 1 },
    { code: 'KeyL', primary: 'L', width: 1 },
    { code: 'Semicolon', primary: ';', secondary: ':', width: 1 },
    { code: 'Quote', primary: "'", secondary: '"', width: 1 },
    { code: 'Enter', primary: 'Enter', width: 2.1, isModifier: true },
  ],
  // Row 4: ZXCV Bottom Alpha
  [
    { code: 'ShiftLeft', primary: 'Shift', width: 2.25, isModifier: true },
    { code: 'KeyZ', primary: 'Z', width: 1 },
    { code: 'KeyX', primary: 'X', width: 1 },
    { code: 'KeyC', primary: 'C', width: 1 },
    { code: 'KeyV', primary: 'V', width: 1 },
    { code: 'KeyB', primary: 'B', width: 1 },
    { code: 'KeyN', primary: 'N', width: 1 },
    { code: 'KeyM', primary: 'M', width: 1 },
    { code: 'Comma', primary: ',', secondary: '<', width: 1 },
    { code: 'Period', primary: '.', secondary: '>', width: 1 },
    { code: 'Slash', primary: '/', secondary: '?', width: 1 },
    { code: 'ShiftRight', primary: 'Shift', width: 2.6, isModifier: true },
  ],
  // Row 5: Bottom Modifiers & Spacebar
  [
    { code: 'ControlLeft', primary: 'Ctrl', width: 1.25, isModifier: true },
    { code: 'MetaLeft', primary: 'Win', width: 1.15, isModifier: true },
    { code: 'AltLeft', primary: 'Alt', width: 1.15, isModifier: true },
    { code: 'Space', primary: '', width: 6.9, isModifier: false },
    { code: 'AltRight', primary: 'Alt', width: 1.15, isModifier: true },
    { code: 'ContextMenu', primary: 'Fn', width: 1.15, isModifier: true },
    { code: 'ControlRight', primary: 'Ctrl', width: 1.25, isModifier: true },
  ],
];

export function getTargetKeyCodes(char) {
  if (!char) return [];
  if (char === ' ') return ['Space'];
  if (char === '\n') return ['Enter'];
  if (char === '\t') return ['Tab'];

  const shiftSymbols = {
    '~': 'Backquote',
    '!': 'Digit1',
    '@': 'Digit2',
    '#': 'Digit3',
    $: 'Digit4',
    '%': 'Digit5',
    '^': 'Digit6',
    '&': 'Digit7',
    '*': 'Digit8',
    '(': 'Digit9',
    ')': 'Digit0',
    _: 'Minus',
    '+': 'Equal',
    '{': 'BracketLeft',
    '}': 'BracketRight',
    '|': 'Backslash',
    ':': 'Semicolon',
    '"': 'Quote',
    '<': 'Comma',
    '>': 'Period',
    '?': 'Slash',
  };

  if (shiftSymbols[char]) {
    return [shiftSymbols[char], 'ShiftLeft'];
  }

  const directSymbols = {
    '`': 'Backquote',
    1: 'Digit1',
    2: 'Digit2',
    3: 'Digit3',
    4: 'Digit4',
    5: 'Digit5',
    6: 'Digit6',
    7: 'Digit7',
    8: 'Digit8',
    9: 'Digit9',
    0: 'Digit0',
    '-': 'Minus',
    '=': 'Equal',
    '[': 'BracketLeft',
    ']': 'BracketRight',
    '\\': 'Backslash',
    ';': 'Semicolon',
    "'": 'Quote',
    ',': 'Comma',
    '.': 'Period',
    '/': 'Slash',
  };

  if (directSymbols[char]) {
    return [directSymbols[char]];
  }

  if (/[a-zA-Z]/.test(char)) {
    const code = `Key${char.toUpperCase()}`;
    if (char === char.toUpperCase()) {
      return [code, 'ShiftLeft'];
    }
    return [code];
  }

  return [];
}

export default function VirtualKeyboard({
  targetChar = '',
  showHints = true,
  onVirtualKeyPress,
  inputRef,
}) {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [modifiers, setModifiers] = useState({
    shift: false,
    caps: false,
    ctrl: false,
    alt: false,
  });
  useEffect(() => {
    const down = (event) => {
      if (event.target !== inputRef.current) return;
      setPressedKeys((previous) => new Set([...previous, event.code]));
    };
    const up = (event) =>
      setPressedKeys((previous) => {
        if (!previous.has(event.code)) return previous;
        const keys = new Set(previous);
        keys.delete(event.code);
        return keys;
      });
    const clear = () => setPressedKeys(new Set());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, [inputRef]);
  const isShiftActive =
    modifiers.shift || pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight');
  const targetKeyCodes = useMemo(() => {
    return showHints ? new Set(getTargetKeyCodes(targetChar)) : new Set();
  }, [targetChar, showHints]);

  return (
    <div className="orange-keyboard-container" role="group" aria-label="On-screen keyboard">
      <div className="orange-keyboard-board">
        {ORANGE_KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div className="orange-keyboard-row" key={`kb-row-${rowIndex}`}>
            {row.map((key) => {
              const isPressed = pressedKeys.has(key.code);
              const isTarget = targetKeyCodes.has(key.code);
              const modifier = key.code.startsWith('Shift')
                ? 'shift'
                : key.code === 'CapsLock'
                  ? 'caps'
                  : key.code.startsWith('Control') || key.code.startsWith('Meta')
                    ? 'ctrl'
                    : key.code.startsWith('Alt')
                      ? 'alt'
                      : null;
              const toggled = modifier ? modifiers[modifier] : false;
              const press = () => {
                if (modifier) {
                  setModifiers((previous) => ({ ...previous, [modifier]: !previous[modifier] }));
                  return;
                }
                let value = key.primary;
                if (key.code === 'Space') value = ' ';
                else if (key.code.startsWith('Key'))
                  value =
                    modifiers.shift !== modifiers.caps
                      ? key.primary.toUpperCase()
                      : key.primary.toLowerCase();
                else if (modifiers.shift && key.secondary) value = key.secondary;
                onVirtualKeyPress(value, modifiers);
                setModifiers((previous) => ({
                  ...previous,
                  shift: false,
                  ctrl: false,
                  alt: false,
                }));
              };

              return (
                <KeyCap
                  key={key.code}
                  code={key.code}
                  primary={key.primary}
                  secondary={key.secondary}
                  width={key.width}
                  isPressed={isPressed || toggled}
                  isTarget={isTarget}
                  isModifier={key.isModifier || (isShiftActive && modifier === 'shift')}
                  toggled={toggled}
                  disabled={key.code === 'ContextMenu'}
                  onClick={press}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
