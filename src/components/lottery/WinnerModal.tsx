import { motion, AnimatePresence } from "framer-motion";
import { LotteryResult } from "../../hooks/useLottery";
import { generateDefaultTitle } from "../../lib/lotteryHistoryService";
import Button from "../ui/Button";

interface WinnerModalProps {
  isOpen: boolean;
  result: LotteryResult | null;
  onClose: () => void;
}

export default function WinnerModal({
  isOpen,
  result,
  onClose,
}: WinnerModalProps) {
  if (!result) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Confetti effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  background: [
                    "#6161d8",
                    "#a195f8",
                    "#bcb88f",
                    "#ffd700",
                  ][i % 4],
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
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative max-w-2xl w-full"
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 100 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-3xl blur-2xl opacity-40 animate-pulse" />

            {/* Card */}
            <div className="relative glass-strong border-2 border-secondary-400 rounded-3xl p-8 sm:p-12 shadow-2xl">
              {/* Trophée animé */}
              <motion.div
                className="text-8xl sm:text-9xl text-center mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, -5, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🏆
              </motion.div>

              {/* Titre */}
              <motion.h2
                className="text-4xl sm:text-6xl font-bold text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="gradient-text-gold">FÉLICITATIONS !</span>
              </motion.h2>

              {/* Gagnant */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="glass-dark rounded-2xl p-6 sm:p-8 border border-secondary-400/50">
                  <p className="text-white/70 text-sm sm:text-base text-center mb-2">
                    Le gagnant est
                  </p>
                  <p className="text-3xl sm:text-5xl font-bold text-white text-center break-words">
                    {result.winner.name}
                  </p>
                </div>
              </motion.div>

              {/* Titre du tirage */}
              {result.title && (
                <motion.div
                  className="mb-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-white/60 text-sm mb-1">Tirage</p>
                  <p className="text-white/90 font-semibold">
                    {result.title || generateDefaultTitle(result.timestamp)}
                  </p>
                </motion.div>
              )}

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 gap-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="glass-dark rounded-xl p-4 text-center border border-white/10">
                  <p className="text-white/60 text-sm mb-1">Participants</p>
                  <p className="text-2xl font-bold text-white">
                    {result.elements?.length || 0}
                  </p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center border border-white/10">
                  <p className="text-white/60 text-sm mb-1">Date</p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(result.timestamp).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </motion.div>

              {/* Boutons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={onClose}
                  variant="gradient"
                  size="lg"
                  withGlow
                  className="w-full sm:w-auto"
                >
                  Fermer
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
