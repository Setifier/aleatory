import { motion } from "framer-motion";
import type { Participant } from "../../types/groupsDraw";

interface DraggableParticipantProps {
  participant: Participant;
  index: number;
  onRemove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

export default function DraggableParticipant({
  participant,
  index,
  onRemove,
  onDragStart,
  onDragEnd,
}: DraggableParticipantProps) {
  return (
    <motion.div
      draggable
      onDragStart={() => onDragStart(participant.id)}
      onDragEnd={onDragEnd}
      className="flex items-center justify-between glass-dark px-4 py-3 rounded-lg border border-white/10 group hover:border-primary-400/50 transition-colors cursor-move"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      layout
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, opacity: 0.8 }}
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="text-white/40 cursor-move">⋮⋮</span>
        <span className="text-white/40 text-sm font-mono w-8">
          #{index + 1}
        </span>
        <span className="text-white font-medium">{participant.name}</span>
      </div>

      <button
        onClick={() => onRemove(participant.id)}
        className="text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Retirer"
      >
        ✕
      </button>
    </motion.div>
  );
}
