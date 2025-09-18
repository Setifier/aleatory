interface ButtonProps {
  label?: string; // Texte du bouton
  onClick?: () => void; // Fonction à appeler lors du clic
  className?: string; // Classes CSS supplémentaires
  type?: "button" | "submit" | "reset"; // Type du bouton
  disabled?: boolean; // Désactiver le bouton
}

const Button = ({
  label,
  onClick,
  className,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500 ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;
