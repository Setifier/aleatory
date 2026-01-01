import { motion } from "framer-motion";
import type { Group } from "../../types/groupsDraw";

interface GroupCardProps {
  group: Group;
  index: number;
  isAnimating?: boolean;
}

export default function GroupCard({
  group,
  index,
  isAnimating = false,
}: GroupCardProps) {
  return (
    <motion.div
      className="glass-strong rounded-xl p-4 border border-white/10 hover:border-primary-400/50 transition-colors"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Group Name */}
      <div className="mb-4">
        <h3 className="text-xl font-bold gradient-text text-center">
          {group.name}
        </h3>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent mt-2" />
      </div>

      {/* Participants */}
      <div className="space-y-2">
        {group.participants.length === 0 ? (
          <p className="text-center text-white/40 text-sm py-4">
            En attente...
          </p>
        ) : (
          group.participants.map((participant, idx) => (
            <motion.div
              key={participant.id}
              className="glass-dark px-3 py-2 rounded-lg border border-white/5"
              initial={isAnimating ? { opacity: 0, x: -20 } : {}}
              animate={isAnimating ? { opacity: 1, x: 0 } : {}}
              transition={isAnimating ? { delay: idx * 0.1 } : {}}
            >
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs font-mono">
                  {idx + 1}.
                </span>
                <span className="text-white text-sm">{participant.name}</span>
                {participant.potIndex !== undefined && (
                  <span className="ml-auto text-xs bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full border border-primary-400/30">
                    P{participant.potIndex + 1}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Participant Count Badge */}
      {group.participants.length > 0 && (
        <div className="mt-4 text-center">
          <span className="text-xs text-white/60">
            {group.participants.length} participant{group.participants.length > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </motion.div>
  );
}
