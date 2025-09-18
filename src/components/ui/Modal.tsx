import { useEffect, useState, useCallback, memo } from "react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  result: string | null;
  items: string[];
  onClose: () => void;
}

const Modal = memo(({ isOpen, result, items, onClose }: ModalProps) => {
  const [displayedItem, setDisplayedItem] = useState<string | null>(null); // État pour afficher l'élément actuel
  const [isRolling, setIsRolling] = useState<boolean>(false); // Contrôle l'état de défilement
  const [isFinalResult, setIsFinalResult] = useState<boolean>(false); // Pour savoir quand afficher l'animation du résultat final
  const [showButton, setShowButton] = useState<boolean>(false); // Contrôle l'affichage du bouton

  useEffect(() => {
    if (isOpen && !isRolling) {
      setIsRolling(true);
      setDisplayedItem(null); // Réinitialise l'élément affiché
      setIsFinalResult(false); // Réinitialise l'état final
      setShowButton(false); // Cache le bouton de relance au début

      const interval = setInterval(() => {
        setDisplayedItem(items[Math.floor(Math.random() * items.length)]); // Change les éléments toutes les 100ms
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayedItem(result); // Affiche le résultat final après 5 secondes
        setIsRolling(false);
        setIsFinalResult(true); // Active l'animation finale
        setTimeout(() => setShowButton(true), 1000); // Affiche le bouton 1 seconde après l'animation
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else if (!isOpen) {
      setDisplayedItem(null);
      setIsRolling(false);
      setIsFinalResult(false); // Réinitialise pour la prochaine ouverture
      setShowButton(false); // Réinitialise l'affichage du bouton
    }
  }, [isOpen, result, items, isRolling]);

  const handleRelancerClick = useCallback(() => {
    setIsRolling(false);
    setDisplayedItem(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-accent-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl border border-secondary-200">
        <h2 className="text-xl font-bold mb-4 text-accent-900">
          Résultat du tirage au sort
        </h2>

        <div
          className={`text-3xl font-bold text-center mb-4 p-4 ${
            isFinalResult
              ? "border-4 border-primary-500 rounded animate-modal-pulse text-primary-600"
              : ""
          }`} // Ajoute un cadre autour du résultat final + animation CSS
        >
          {displayedItem}{" "}
          {/* Affiche l'élément en cours de défilement ou le résultat final */}
        </div>
        {/* Bouton "Relancer le tirage" visible uniquement après l'animation */}
        {showButton && (
          <div className="flex justify-center">
            <Button label="Relancer le tirage" onClick={handleRelancerClick} />
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

export default Modal;
