import React from 'react';

export default function KeyCap({
  primary,
  secondary,
  code,
  width = 1,
  isPressed = false,
  isTarget = false,
  isError = false,
  isCorrect = false,
  isModifier = false,
  onClick,
  toggled = false,
  disabled = false,
}) {
  const classes = [
    'orange-keycap',
    isPressed ? 'is-pressed' : '',
    isTarget ? 'is-target' : '',
    isError ? 'is-error' : '',
    isCorrect ? 'is-correct' : '',
    isModifier ? 'is-modifier' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={{ flex: `${width} ${width} 0` }}
      data-code={code}
      aria-label={primary || 'Space'}
      aria-pressed={
        code.startsWith('Shift') ||
        code === 'CapsLock' ||
        code.startsWith('Control') ||
        code.startsWith('Alt')
          ? toggled
          : undefined
      }
      disabled={disabled}
      onPointerDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <div className="orange-keycap-top">
        {secondary && <span className="key-legend-sub">{secondary}</span>}
        <span className={`key-legend-main ${secondary ? 'has-sub' : ''}`}>{primary}</span>
      </div>
    </button>
  );
}
