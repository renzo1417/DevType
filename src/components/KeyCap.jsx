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
  onMouseDown,
  onMouseUp
}) {
  const classes = [
    'orange-keycap',
    isPressed ? 'is-pressed' : '',
    isTarget ? 'is-target' : '',
    isError ? 'is-error' : '',
    isCorrect ? 'is-correct' : '',
    isModifier ? 'is-modifier' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{ flex: `${width} ${width} 0` }}
      data-code={code}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="orange-keycap-top">
        {secondary && (
          <span className="key-legend-sub">
            {secondary}
          </span>
        )}
        <span className={`key-legend-main ${secondary ? 'has-sub' : ''}`}>
          {primary}
        </span>
      </div>
    </div>
  );
}
