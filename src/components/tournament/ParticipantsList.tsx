import { motion, AnimatePresence } from "framer-motion";
import type { Participant } from "../../types/groupsDraw";
import Button from "../ui/Button";

interface ParticipantsListProps {
  participants: Participant[];
  onRemove: (id: string) => void;
  onClear?: () => void;
  showPotBadge?: boolean;
}

export default function ParticipantsList({
  participants,
  onRemove,
  onClear,
  showPotBadge = false,
}: ParticipantsListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-white/40">
        <p className="text-2xl mb-2">📋</p>
        <p>Aucun participant</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Count Badge */}
      <div className="flex items-center justify-between">
        <div className="glass-dark px-4 py-2 rounded-lg border border-secondary-400/30">
          <span className="text-white/80 font-semibold">
            {participants.length} participant{participants.length > 1 ? "s" : ""}
          </span>
        </div>

        {onClear && participants.length > 0 && (
          <Button onClick={onClear} variant="ghost" size="sm">
            Tout effacer
          </Button>
        )}
      </div>

      {/* Participants List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              className="flex items-center justify-between glass-dark px-4 py-3 rounded-lg border border-white/10 group hover:border-primary-400/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-white/40 text-sm font-mono w-8">
                  #{index + 1}
                </span>
                <span className="text-white font-medium">{participant.name}</span>
                {showPotBadge && participant.potIndex !== undefined && (
                  <span className="text-xs bg-primary-500/30 text-primary-200 px-2 py-1 rounded-full border border-primary-400/30">
                    Pot {participant.potIndex + 1}
                  </span>
                )}
              </div>

              <button
                onClick={() => onRemove(participant.id)}
                className="text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Retirer"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
