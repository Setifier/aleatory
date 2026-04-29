import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "solid" | "gradient" | "outline";
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = ({
  children,
  className = "",
  variant = "glass",
  hoverable = false,
  clickable = false,
  onClick,
  padding = "md",
}: CardProps) => {
  // Padding classes
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  // Variant classes
  const variantClasses = {
    glass:
      "glass shadow-glass backdrop-blur-xl bg-white/5 border-white/10",
    solid:
      "bg-accent-900/80 border border-accent-800/50 shadow-lg",
    gradient:
      "bg-gradient-to-br from-primary-900/40 via-accent-900/40 to-primary-950/40 border border-primary-700/30 shadow-glow-sm",
    outline:
      "bg-transparent border-2 border-primary-500/30 hover:border-primary-500/50",
  };

  // Interactive classes
  const interactiveClasses = hoverable || clickable
    ? "transition-all duration-300 hover:shadow-glow-md hover:border-primary-500/30 hover:-translate-y-1"
    : "";

  const cursorClass = clickable ? "cursor-pointer" : "";

  return (
    <motion.div
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${interactiveClasses}
        ${cursorClass}
        rounded-2xl
        ${className}
      `}
      onClick={clickable ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hoverable || clickable ? { scale: 1.02 } : {}}
    >
      {children}
    </motion.div>
  );
};

export default Card;
