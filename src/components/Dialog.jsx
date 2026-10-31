import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ title, onClose, children, className = '' }) {
  const dialogRef = useRef(null);
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    const focusable = Array.from(
      dialog.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (element) =>
        element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden',
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={`dialog ${className}`}
      aria-labelledby="dialog-title"
      onKeyDown={trapFocus}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()}`}
        >
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
