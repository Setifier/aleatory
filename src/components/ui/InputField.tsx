import { useState, useCallback } from "react";
import ErrorMessage from "./ErrorMessage";

interface InputFieldProps {
  onAddItem: (item: string) => void;
  errorMessage?: string | null;
  onDismissError?: () => void;
  placeholder?: string;
  buttonLabel?: string;
  disabled?: boolean;
}

const InputField = ({
  onAddItem,
  errorMessage,
  onDismissError,
  placeholder = "Ajouter un élément ici",
  buttonLabel = "+",
  disabled = false,
}: InputFieldProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleAddClick = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue !== "") {
      onAddItem(trimmedValue);
      setInputValue("");
    }
  }, [inputValue, onAddItem]);

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
      <ErrorMessage
        message={errorMessage || null}
        onDismiss={onDismissError}
        duration={4000}
      />

      <div className="flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className={`border p-2 flex-1 rounded-lg sm:rounded-sm focus:outline-none focus:ring-2 text-sm sm:text-base ${
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
          className={`px-3 py-2 sm:px-4 rounded-xl sm:rounded-sm ml-2 transition-colors duration-200 text-lg sm:text-base ${
            disabled
              ? "bg-secondary-300 text-secondary-500 cursor-not-allowed"
              : "bg-secondary-500 text-white hover:bg-secondary-600"
          }`}
          title={buttonLabel}
        >
          <span className="sm:hidden">{buttonLabel.split(' ')[0]}</span>
          <span className="hidden sm:inline">{buttonLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default InputField;
