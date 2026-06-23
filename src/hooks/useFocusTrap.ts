// ─────────────────────────────────────────────────────────────────────────────
// useFocusTrap — WCAG 2.1 §2.1.2 "No Keyboard Trap" / ARIA dialog pattern
//
// Traps keyboard focus inside a modal or panel while it is open.
// When the panel closes, focus returns to the element that opened it.
//
// Usage:
//   const trapRef = useFocusTrap(isOpen);
//   <div ref={trapRef} role="dialog" aria-modal="true">...</div>
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';

/** All elements that can receive keyboard focus */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Remember what had focus before the panel opened
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the currently focused element so we can restore it on close
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus into the panel on the next tick (after it renders)
    const raf = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE);
      focusable[0]?.focus();
    });

    // Trap Tab / Shift+Tab inside the container
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab — going backwards
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab — going forwards
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the element that opened the panel
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  return containerRef;
}
