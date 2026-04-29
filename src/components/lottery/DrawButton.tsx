import { motion } from "framer-motion";
import Button from "../ui/Button";

interface DrawButtonProps {
  itemsCount: number;
  isDrawing: boolean;
  onDraw: () => void;
}

const DrawButton = ({ itemsCount, isDrawing, onDraw }: DrawButtonProps) => {
  const getButtonText = () => {
    if (isDrawing) return "🎯 TIRAGE EN COURS...";
    if (itemsCount === 0) return "⚠️ Ajoutez des éléments";
    if (itemsCount === 1) return "⚠️ Ajoutez au moins 1 élément de plus";
    return `🎰 LANCER LE TIRAGE ! (${itemsCount} éléments)`;
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={onDraw}
          disabled={itemsCount < 2 || isDrawing}
          variant="gradient"
          size="lg"
          withGlow={itemsCount >= 2 && !isDrawing}
          className={`
            text-xl sm:text-2xl px-8 sm:px-12 py-4 sm:py-5 font-bold w-full sm:w-auto
            ${isDrawing ? "animate-glow-pulse" : ""}
          `}
        >
          <motion.span
            key={getButtonText()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getButtonText()}
          </motion.span>
        </Button>
      </motion.div>
    </div>
  );
};

export default DrawButton;