import { useState, useCallback } from "react";
import ErrorMessage from "./ErrorMessage";

interface InputFieldProps {
  onAddItem: (item: string) => void; // Fonction pour ajouter l'élément
  errorMessage?: string | null; // Message d'erreur à afficher
  onDismissError?: () => void; // Fonction pour effacer l'erreur
  placeholder?: string; // Texte de placeholder personnalisé
  buttonLabel?: string; // Texte du bouton personnalisé
  disabled?: boolean; // Désactiver le composant
}

const InputField = ({
  onAddItem,
  errorMessage,
  onDismissError,
  placeholder = "Ajouter un élément ici",
  buttonLabel = "+",
  disabled = false,
}: InputFieldProps) => {
  const [inputValue, setInputValue] = useState<string>(""); // État local pour la valeur de l'input

  // Gérer le changement de la valeur de l'input
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  // Ajouter l'élément à la liste et réinitialiser le champ de saisie
  const handleAddClick = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue !== "") {
      onAddItem(trimmedValue);
      setInputValue(""); // Réinitialiser l'input après ajout
    }
  }, [inputValue, onAddItem]);

  // Gérer la touche Entrée
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleAddClick();
      }
    },
    [handleAddClick]
  );

  return (
    <div>
      {/* Message d'erreur */}
      <ErrorMessage
        message={errorMessage || null}
        onDismiss={onDismissError}
        duration={4000}
      />

      {/* Champ de saisie */}
      <div className="flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className={`border p-2 flex-1 rounded-sm focus:outline-none focus:ring-2 ${
            errorMessage
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-secondary-300 focus:ring-primary-500 focus:border-primary-500"
          } ${
            disabled
              ? "bg-secondary-100 text-secondary-500 cursor-not-allowed"
              : ""
          }`}
          placeholder={placeholder}
        />
        <button
          onClick={handleAddClick}
          disabled={disabled}
          className={`px-4 py-2 rounded-sm ml-2 transition-colors duration-200 ${
            disabled
              ? "bg-secondary-300 text-secondary-500 cursor-not-allowed"
              : "bg-secondary-500 text-white hover:bg-secondary-600"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default InputField;
