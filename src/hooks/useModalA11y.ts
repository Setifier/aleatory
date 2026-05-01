import { useEffect, RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessibility hook for modal dialogs. Provides:
 * - Escape key to close
 * - Tab / Shift+Tab focus trap (focus stays inside the modal)
 * - Auto-focus first focusable element on open
 * - Restores focus to the previously focused element on close
 */
export const useModalA11y = (
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>
) => {
  // Escape + Tab trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const container = containerRef.current;
        if (!container) return;
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE)
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, containerRef]);

  // Auto-focus on open, restore on close
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;

    // Small delay so the modal has time to animate in before we focus
    const timer = setTimeout(() => {
      const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, 80);

    return () => {
      clearTimeout(timer);
      previousFocus?.focus();
    };
  }, [isOpen, containerRef]);
};
