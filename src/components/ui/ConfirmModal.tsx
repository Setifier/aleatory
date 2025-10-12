import { useEffect, useRef } from "react";
import SimpleModal from "./SimpleModal";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  advancedA11y?: boolean; // Focus trap + ESC handling
}

const ConfirmModal = ({
  isOpen,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  isDestructive = false,
  advancedA11y = false,
}: ConfirmModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Advanced accessibility (focus trap + ESC)
  useEffect(() => {
    if (!isOpen || !advancedA11y) return;

    // Focus on confirm button
    confirmButtonRef.current?.focus();

    // ESC key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    // Focus trap (Tab navigation)
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel, advancedA11y]);

  return (
    <SimpleModal isOpen={isOpen} onClose={onCancel}>
      <div className="p-6" ref={advancedA11y ? dialogRef : null}>
        {/* Title */}
        <h2 className="text-xl font-bold text-accent-900 mb-4 text-center">
          {title}
        </h2>

        <div className="text-center">
          {/* Message */}
          <p className="text-accent-700 mb-6 text-lg">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onCancel}
              label={cancelLabel}
              className="bg-gray-300 hover:bg-gray-400 text-accent-800"
            />
            <Button
              onClick={onConfirm}
              label={confirmLabel}
              className={
                isDestructive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }
            />
          </div>
        </div>
      </div>
    </SimpleModal>
  );
};

export default ConfirmModal;
