import { motion } from "framer-motion";
import type { DrawPot } from "../../types/groupsDraw";

interface PotsTabsProps {
  pots: DrawPot[];
  activePotIndex: number;
  onSelectPot: (index: number) => void;
  onAddPot: () => void;
  onRemovePot: (index: number) => void;
}

export default function PotsTabs({
  pots,
  activePotIndex,
  onSelectPot,
  onAddPot,
  onRemovePot,
}: PotsTabsProps) {
  const canAddPot = pots.length < 10;
  const canRemovePot = pots.length > 2;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Pot Tabs */}
      {pots.map((pot) => (
        <motion.button
          key={pot.index}
          onClick={() => onSelectPot(pot.index)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all relative group ${
            activePotIndex === pot.index
              ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow-sm"
              : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{pot.name}</span>
          {pot.participants.length > 0 && (
            <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {pot.participants.length}
            </span>
          )}

          {/* Remove button (only show if > 2 pots) */}
          {canRemovePot && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePot(pot.index);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label={`Supprimer ${pot.name}`}
            >
              ✕
            </button>
          )}
        </motion.button>
      ))}

      {/* Add Pot Button */}
      {canAddPot && (
        <motion.button
          onClick={onAddPot}
          className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 transition-all text-sm font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Ajouter un pot
        </motion.button>
      )}
    </div>
  );
}
