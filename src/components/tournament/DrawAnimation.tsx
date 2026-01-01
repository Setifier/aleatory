import { motion, AnimatePresence } from "framer-motion";
import type { Group, DrawAnimationState } from "../../types/groupsDraw";
import GroupCard from "./GroupCard";

interface DrawAnimationProps {
  groups: Group[];
  animationState: DrawAnimationState;
}

export default function DrawAnimation({
  groups,
  animationState,
}: DrawAnimationProps) {
  if (!animationState.isDrawing || groups.length === 0) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              background: ["#6161d8", "#a195f8", "#bcb88f", "#ffd700"][i % 4],
            }}
            initial={{ y: -20, opacity: 1, scale: 0 }}
            animate={{
              y: window.innerHeight + 20,
              opacity: [1, 1, 0],
              scale: [0, 1, 1],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 0.5,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl w-full">
        {/* Title */}
        <motion.h2
          className="text-3xl sm:text-5xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="gradient-text">🎰 TIRAGE EN COURS...</span>
        </motion.h2>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto p-2">
          <AnimatePresence mode="popLayout">
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                index={index}
                isAnimating={true}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="mt-8 glass-dark rounded-full h-2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
