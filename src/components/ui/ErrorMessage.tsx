import { useEffect, useState, useRef, useCallback } from "react";

interface ErrorMessageProps {
  message: string | null;
  duration?: number; // Durée en millisecondes avant disparition automatique
  onDismiss?: () => void; // Callback quand l'erreur est supprimée
}

const ErrorMessage = ({
  message,
  duration = 4000,
  onDismiss,
}: ErrorMessageProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const hideTimerRef = useRef<NodeJS.Timeout>();
  const dismissTimerRef = useRef<NodeJS.Timeout>();

  // Fonction pour fermer le message avec nettoyage des timers
  const handleClose = useCallback(() => {
    // Nettoyer les timers existants
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    setIsVisible(false);
    
    // Timer pour appeler onDismiss après l'animation de sortie
    dismissTimerRef.current = setTimeout(() => {
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    // Nettoyer les timers existants
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    if (message) {
      setIsVisible(true);

      // Timer pour auto-fermeture
      hideTimerRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    } else {
      setIsVisible(false);
    }

    // Cleanup function
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [message, duration, handleClose]);

  // Ne rien afficher si pas de message
  if (!message) return null;

  return (
    <div
      className={`transition-all duration-300 ease-in-out transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95"
      }`}
    >
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          {/* Icône d'erreur */}
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">{message}</span>
        </div>

        {/* Bouton pour fermer manuellement */}
        <button
          onClick={handleClose}
          className="ml-4 text-red-400 hover:text-red-600 transition-colors duration-200"
          aria-label="Fermer le message d'erreur"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
