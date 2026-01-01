import { motion } from "framer-motion";
import { useState } from "react";
import { SavedItem } from "../../lib/savedItemsService";
import Button from "../ui/Button";

interface ItemCardGamingProps {
  item: SavedItem;
  isInLottery: boolean;
  onAddToLottery: () => void;
  onDelete: () => void;
}

export default function ItemCardGaming({
  item,
  isInLottery,
  onAddToLottery,
  onDelete,
}: ItemCardGamingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [_tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * -10;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, z: 50 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
    >
      {/* Glow effect */}
      {isHovered && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-xl opacity-50 blur-lg" />
      )}

      {/* Card */}
      <div className="relative glass-strong border border-white/20 rounded-xl p-4 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors">
        {/* Corner decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-secondary-500/20 to-transparent rounded-tr-full" />

        {/* Status indicator */}
        <div className="absolute top-2 left-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${
              isInLottery ? "bg-green-400" : "bg-white/30"
            }`}
            animate={
              isInLottery
                ? {
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl shadow-glow-md"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              🎯
            </motion.div>
          </div>

          {/* Item name */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-white break-words mb-1">
              {item.item_name}
            </h3>
            <p className="text-xs text-white/60">
              {isInLottery ? "Dans la loterie" : "Sauvegardé"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => onAddToLottery()}
              variant={isInLottery ? "outline" : "gradient"}
              size="sm"
              className="flex-1 text-xs"
            >
              {isInLottery ? "✓ Ajouté" : "➕ Ajouter"}
            </Button>
            <Button
              onClick={() => onDelete()}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              🗑️
            </Button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
