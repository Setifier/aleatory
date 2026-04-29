import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EliminationDrawStepProps {
  items: Array<{ id: string; name: string }>;
  onClose: () => void;
  onBack: () => void;
  onComplete?: (winnerName: string) => void;
}

export default function EliminationDrawStep({
  items,
  onClose,
  onBack,
  onComplete,
}: EliminationDrawStepProps) {
  const initialNamesRef = useRef<string[]>(items.map((i) => i.name));
  const initialNames = initialNamesRef.current;
  const totalCount = initialNames.length;

  const [remaining, setRemaining] = useState<string[]>(initialNames);
  // ranking[i] → rank = totalCount - i  (ranking[0] = last place, ranking[N-1] = champion)
  const [ranking, setRanking] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(false);

  const hasStarted = ranking.length > 0;

  const completedRef = useRef(false);

  const handleDraw = useCallback(() => {
    if (remaining.length === 0) return;
    const idx = Math.floor(Math.random() * remaining.length);
    const drawn = remaining[idx];
    const newRemaining = remaining.filter((_, i) => i !== idx);
    setRemaining(newRemaining);
    setRanking((r) => [...r, drawn]);
    setLastPicked(drawn);
    if (newRemaining.length === 0) {
      setIsComplete(true);
      setAutoMode(false);
    }
  }, [remaining]);

  // Fire onComplete once when the draw finishes
  // ranking[ranking.length - 1] = last standing = champion (rank 1)
  useEffect(() => {
    if (isComplete && ranking.length > 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(ranking[ranking.length - 1]);
    }
  }, [isComplete, ranking, onComplete]);

  // Auto mode
  useEffect(() => {
    if (!autoMode || isComplete || remaining.length === 0) return;
    const timer = setTimeout(handleDraw, 650);
    return () => clearTimeout(timer);
  }, [autoMode, isComplete, remaining.length, handleDraw]);

  const handleRestart = () => {
    setRemaining(initialNames);
    setRanking([]);
    setIsComplete(false);
    setLastPicked(null);
    setAutoMode(false);
  };

  // displayItems: best rank first (champion at top)
  // ranking[i] → rank = totalCount - i → sort ascending
  const displayItems = ranking
    .map((name, i) => ({ name, rank: totalCount - i }))
    .sort((a, b) => a.rank - b.rank);

  const medalColor = (rank: number) => {
    if (rank === 1) return "#ffd700";
    if (rank === 2) return "#c0c8d8";
    if (rank === 3) return "#cd7f32";
    return "rgba(255,255,255,0.25)";
  };

  return (
    <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        {!isComplete ? (
          <p className="text-white/50 text-sm">
            <span className="text-white font-bold">{remaining.length}</span> survivant
            {remaining.length > 1 ? "s" : ""} restant
            {remaining.length > 1 ? "s" : ""}
          </p>
        ) : (
          <p className="text-yellow-300 font-bold text-base">🏆 Classement final</p>
        )}
        {lastPicked && !isComplete && (
          <p className="text-white/30 text-xs truncate max-w-[140px]">
            Éliminé :{" "}
            <span className="text-white/55">{lastPicked}</span>
          </p>
        )}
      </div>

      {/* Remaining participants */}
      {!isComplete && remaining.length > 0 && (
        <div>
          <p className="text-white/25 text-xs uppercase tracking-wide mb-2">Survivants</p>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {remaining.map((name) => (
                <motion.span
                  key={name}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75, x: 16 }}
                  transition={{ duration: 0.18 }}
                  className="text-sm text-white/70 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {name}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Ranking list */}
      {displayItems.length > 0 && (
        <div>
          <p className="text-white/25 text-xs uppercase tracking-wide mb-2">
            {isComplete ? "Classement" : "Classement en cours"}
          </p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
            <AnimatePresence initial={false}>
              {displayItems.map((item) => {
                const isChampion = isComplete && item.rank === 1;
                const isLast = item.rank === totalCount;
                return (
                  <motion.div
                    key={item.name}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{
                      background: isChampion
                        ? "rgba(255,215,0,0.08)"
                        : "rgba(255,255,255,0.04)",
                      border: isChampion
                        ? "1px solid rgba(255,215,0,0.25)"
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span
                      className="font-bold text-sm w-6 text-center flex-shrink-0"
                      style={{ color: medalColor(item.rank) }}
                    >
                      {item.rank}
                    </span>
                    <span
                      className={`flex-1 text-sm font-medium truncate ${
                        isChampion
                          ? "text-yellow-300"
                          : isLast
                          ? "text-white/40"
                          : "text-white/75"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isChampion && <span className="text-base flex-shrink-0">🏆</span>}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isComplete ? (
        <div className="flex gap-3">
          {!hasStarted && (
            <button
              onClick={onBack}
              className="px-3 py-2 rounded-2xl text-white/50 hover:text-white hover:bg-white/6 transition-all font-medium text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Retour
            </button>
          )}
          <button
            onClick={handleDraw}
            disabled={autoMode}
            className="flex-1 py-3.5 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-40 shadow-glow-md transition-all active:scale-[0.98]"
          >
            {remaining.length === 1
              ? "Révéler le champion !"
              : remaining.length === totalCount
              ? "Commencer l'élimination"
              : "Éliminer le suivant"}
          </button>
          {hasStarted && !isComplete && (
            <motion.button
              onClick={() => setAutoMode((v) => !v)}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-2xl font-bold text-sm transition-all flex-shrink-0"
              style={
                autoMode
                  ? {
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.35)",
                      color: "rgba(252,165,165,0.9)",
                    }
                  : {
                      background: "rgba(97,97,216,0.12)",
                      border: "1px solid rgba(97,97,216,0.25)",
                      color: "rgba(161,149,248,0.9)",
                    }
              }
            >
              {autoMode ? (
                <span className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"
                  />
                  Stop
                </span>
              ) : (
                "Auto"
              )}
            </motion.button>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 py-3 rounded-2xl text-white/65 hover:text-white hover:bg-white/6 transition-all font-semibold text-sm"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Recommencer
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold transition-all text-sm"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
