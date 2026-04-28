import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  label?: string;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  withGlow?: boolean;
}

const Button = ({
  label,
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  variant = "primary",
  size = "md",
  withGlow = false,
}: ButtonProps) => {
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 border border-primary-500 hover:border-primary-400",
    secondary:
      "bg-secondary-500 text-accent-900 hover:bg-secondary-600 border border-secondary-500 hover:border-secondary-400",
    outline:
      "bg-transparent text-primary-400 border-2 border-primary-500 hover:bg-primary-500/10 hover:border-primary-400",
    ghost:
      "bg-transparent text-white hover:bg-white/10 border border-transparent hover:border-white/20",
    gradient:
      "bg-gradient-primary text-white border border-primary-400 hover:shadow-glow-md relative overflow-hidden",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${withGlow ? "shadow-glow-sm hover:shadow-glow-md" : ""}
        rounded-lg font-medium
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        relative
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {/* Shine effect for gradient variant */}
      {variant === "gradient" && !disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
      <span className="relative z-10">{children || label}</span>
    </motion.button>
  );
};

export default Button;
