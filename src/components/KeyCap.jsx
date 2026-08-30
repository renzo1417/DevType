import React from 'react';

export default function KeyCap({
  primary,
  secondary,
  code,
  width = 1,
  isPressed = false,
  isTarget = false,
  isError = false,
  isModifier = false,
  isShifted = false,
  onMouseDown,
  onMouseUp
}) {
  return (
    <div
      className={`orange-keycap ${isPressed ? 'is-pressed' : ''} ${isTarget ? 'is-target' : ''} ${isError ? 'is-error' : ''} ${isModifier ? 'is-modifier' : ''}`}
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

