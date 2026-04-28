import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ErrorMessage from "./ErrorMessage";
import Button from "./Button";

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
  const [isFocused, setIsFocused] = useState(false);

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
    <div className="space-y-3">
      <ErrorMessage
        message={errorMessage || null}
        onDismiss={onDismissError}
        duration={4000}
      />

      <div className="flex items-center gap-2 sm:gap-3">
        <motion.div
          className="flex-1 relative"
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-white/10 backdrop-blur-sm
              border-2 transition-all duration-300
              text-white placeholder-white/50
              focus:outline-none
              ${
                errorMessage
                  ? "border-red-400 focus:border-red-300 focus:shadow-glow-md"
                  : "border-white/20 focus:border-primary-400 focus:shadow-glow-sm"
              }
              ${
                disabled
                  ? "bg-white/5 text-white/40 cursor-not-allowed"
                  : "hover:border-white/30"
              }
            `}
            placeholder={placeholder}
          />
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-primary-400/50 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            />
          )}
        </motion.div>

        <Button
          onClick={handleAddClick}
          disabled={disabled || !inputValue.trim()}
          variant="secondary"
          size="md"
          className="px-4 sm:px-6"
        >
          <span className="sm:hidden">{buttonLabel.split(" ")[0]}</span>
          <span className="hidden sm:inline">{buttonLabel}</span>
        </Button>
      </div>
    </div>
  );
};

export default InputField;
