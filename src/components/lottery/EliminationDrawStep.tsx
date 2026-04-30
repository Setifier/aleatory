import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EliminationDrawStepProps {
  items: Array<{ id: string; name: string }>;
  onClose: () => void;
  onBack: () => void;
  onComplete?: (winnerName: string, rankedNames: string[]) => void;
}

type Phase = "idle" | "spinning" | "done";

// ── SlotReel ──────────────────────────────────────────────────────────────────
// Remounts on each draw (key={spinKey} from parent) → fresh animation every time
const ITEM_H = 52;

function SlotReel({
  chosen,
  pool,
  onDone,
}: {
  chosen: string;
  pool: string[];
  onDone: () => void;
}) {
  // Generate reel sequence once on mount (component remounts each spin)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reel = useMemo(() => {
    const arr: string[] = [];
    const passes = Math.min(4, Math.max(2, Math.ceil(10 / Math.max(pool.length, 1))));
    for (let p = 0; p < passes; p++) {
      arr.push(...[...pool].sort(() => Math.random() - 0.5));
    }
    arr.push(chosen);
    return arr;
  }, []); // empty deps — intentional, component remounts each spin

  const totalY = -(reel.length - 1) * ITEM_H;

  return (
    <div
      className="relative overflow-hidden rounded-2xl w-full"
      style={{
        height: ITEM_H,
        background: "rgba(97,97,216,0.08)",
        border: "1px solid rgba(97,97,216,0.25)",
        boxShadow: "0 0 20px rgba(97,97,216,0.12)",
      }}
    >
      {/* Gradient vignette top / bottom — reel window effect */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-5 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(12,12,42,0.95), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-5 z-10"
        style={{ background: "linear-gradient(to top, rgba(12,12,42,0.95), transparent)" }}
      />
      {/* Center highlight line */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          height: ITEM_H,
          background: "rgba(97,97,216,0.06)",
          borderTop: "1px solid rgba(97,97,216,0.2)",
          borderBottom: "1px solid rgba(97,97,216,0.2)",
        }}
      />

      <motion.div
        initial={{ y: 0 }}
        animate={{ y: totalY }}
        transition={{
          duration: 1.8,
          ease: [0.05, 0.55, 0.2, 1.0], // fast start → very slow end
        }}
        onAnimationComplete={onDone}
      >
        {reel.map((name, i) => (
          <div
            key={i}
            className="flex items-center justify-center font-bold text-white text-base px-4"
            style={{ height: ITEM_H }}
          >
            {name}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Medal colour helper ───────────────────────────────────────────────────────
function medalColor(rank: number): string {
  if (rank === 1) return "#ffd700";
  if (rank === 2) return "#a8b4c2";
  if (rank === 3) return "#cd7f32";
  return "rgba(255,255,255,0.3)";
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EliminationDrawStep({
  items,
  onClose,
  onBack,
  onComplete,
}: EliminationDrawStepProps) {
  const totalCount = items.length;
  const allNames = useMemo(() => items.map((i) => i.name), [items]);

  const [remaining, setRemaining] = useState<string[]>(allNames);
  // ranking[i] = ième éliminé → rank = totalCount - i
  // ranking[0] = first eliminated = rank N
  // ranking[N-1] = champion = rank 1
  const [ranking, setRanking] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [spinKey, setSpinKey] = useState(0);
  const [currentChosen, setCurrentChosen] = useState<string>("");
  const [autoMode, setAutoMode] = useState(false);

  const currentChosenRef = useRef<string>("");
  const rankingCountRef = useRef(0);
  const completedRef = useRef(false);
  const revealedAllRef = useRef(false);

  const isComplete = phase === "done";

  // ── Ranked slots for display ──────────────────────────────────────────────
  // rank r → ranking index = totalCount - r
  const rankedSlots = useMemo(
    () =>
      Array.from({ length: totalCount }, (_, i) => {
        const rank = i + 1;
        const idx = totalCount - rank;
        return { rank, name: ranking[idx] ?? null };
      }),
    [ranking, totalCount]
  );

  // Column layout (column-major)
  const cols = totalCount <= 5 ? 1 : totalCount <= 10 ? 2 : 3;
  const perCol = Math.ceil(totalCount / cols);
  const columns = useMemo(
    () => Array.from({ length: cols }, (_, c) => rankedSlots.slice(c * perCol, (c + 1) * perCol)),
    [rankedSlots, cols, perCol]
  );

  // ── Draw handler ──────────────────────────────────────────────────────────
  const handleDraw = useCallback(() => {
    if (remaining.length === 0 || phase !== "idle") return;
    const idx = Math.floor(Math.random() * remaining.length);
    const chosen = remaining[idx];
    currentChosenRef.current = chosen;
    setCurrentChosen(chosen);
    setSpinKey((prev) => prev + 1);
    setPhase("spinning");
  }, [remaining, phase]);

  // Called by SlotReel when its animation completes
  const handleSpinDone = useCallback(() => {
    if (revealedAllRef.current) return; // "Tout révéler" already took over
    const chosen = currentChosenRef.current;
    rankingCountRef.current += 1;
    const isLast = rankingCountRef.current >= totalCount;
    setRemaining((prev) => prev.filter((n) => n !== chosen));
    setRanking((prev) => [...prev, chosen]);
    setPhase(isLast ? "done" : "idle");
  }, [totalCount]);

  // ── Reveal all ────────────────────────────────────────────────────────────
  const handleRevealAll = useCallback(() => {
    if (phase === "done") return;
    revealedAllRef.current = true;
    setAutoMode(false);
    // Snapshot remaining synchronously before any state update
    const snap = remaining.length > 0 ? remaining : [];
    const shuffled = [...snap].sort(() => Math.random() - 0.5);
    setRanking((prev) => {
      const newRanking = [...prev, ...shuffled];
      rankingCountRef.current = newRanking.length;
      return newRanking;
    });
    setRemaining([]);
    setPhase("done");
  }, [phase, remaining]);

  // ── Fire onComplete ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isComplete && ranking.length === totalCount && !completedRef.current) {
      completedRef.current = true;
      // ranking[N-1] = champion, reverse → [champion, ..., first_eliminated]
      onComplete?.(ranking[totalCount - 1], [...ranking].reverse());
    }
  }, [isComplete, ranking, totalCount, onComplete]);

  // ── Auto mode ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoMode || phase !== "idle" || remaining.length === 0) return;
    const t = setTimeout(handleDraw, 450);
    return () => clearTimeout(t);
  }, [autoMode, phase, remaining.length, handleDraw]);

  // ── Restart ───────────────────────────────────────────────────────────────
  const handleRestart = () => {
    completedRef.current = false;
    rankingCountRef.current = 0;
    revealedAllRef.current = false;
    setRemaining(allNames);
    setRanking([]);
    setPhase("idle");
    setSpinKey(0);
    setAutoMode(false);
  };

  const hasStarted = ranking.length > 0 || phase === "spinning";
  const nextRank = totalCount - ranking.length;

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-4 overflow-y-auto">

      {/* ── Slot machine + remaining (side-by-side on sm) ── */}
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Left: slot + status */}
        <div className="flex flex-col gap-3 sm:w-64 flex-shrink-0">

          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">
              {isComplete
                ? "Classement final"
                : remaining.length === 1
                ? "Champion à révéler"
                : `${remaining.length} survivant${remaining.length !== 1 ? "s" : ""}`}
            </p>
            {!isComplete && ranking.length > 0 && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  background: nextRank === 1 ? "rgba(255,215,0,0.12)" : "rgba(239,68,68,0.1)",
                  color: nextRank === 1 ? "#ffd700" : "rgba(252,165,165,0.8)",
                  border: nextRank === 1 ? "1px solid rgba(255,215,0,0.2)" : "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {nextRank === 1 ? "Champion" : `Éliminé #${nextRank}`}
              </span>
            )}
          </div>

          {/* Slot reel */}
          {!isComplete && (
            phase === "spinning" ? (
              <SlotReel
                key={spinKey}
                chosen={currentChosen}
                pool={remaining}
                onDone={handleSpinDone}
              />
            ) : (
              <div
                className="flex items-center justify-center rounded-2xl text-white/20 text-sm italic w-full"
                style={{
                  height: ITEM_H,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                }}
              >
                {remaining.length === totalCount ? "Prêt à éliminer" : "Prochain tirage…"}
              </div>
            )
          )}

          {/* Remaining pills */}
          {!isComplete && (
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence initial={false}>
                {remaining.map((name) => (
                  <motion.span
                    key={name}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7, x: 8 }}
                    transition={{ duration: 0.16 }}
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {name}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-3"
            >
              <p className="text-yellow-300 font-black text-base">Tirage terminé !</p>
              <p className="text-white/35 text-xs mt-1">Champion : {ranking[totalCount - 1]}</p>
            </motion.div>
          )}
        </div>

        {/* Right: ranking grid */}
        <div className="flex-1 min-w-0">
          <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2 font-semibold">
            Classement
          </p>
          <div
            className="grid gap-x-2 gap-y-0.5"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-0.5">
                {col.map(({ rank, name }) => (
                  <div
                    key={rank}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: name && rank === 1
                        ? "rgba(255,215,0,0.06)"
                        : name
                        ? "rgba(255,255,255,0.03)"
                        : "transparent",
                      border: name && rank === 1
                        ? "1px solid rgba(255,215,0,0.18)"
                        : name
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid rgba(255,255,255,0.03)",
                      minHeight: 32,
                    }}
                  >
                    <span
                      className="text-[11px] font-black w-5 text-right flex-shrink-0 tabular-nums"
                      style={{ color: name ? medalColor(rank) : "rgba(255,255,255,0.1)" }}
                    >
                      {rank}
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      {name ? (
                        <motion.span
                          key={name}
                          initial={{ opacity: 0, x: -14, scale: 0.82 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          className="text-xs font-semibold truncate flex-1"
                          style={{
                            color: rank === 1
                              ? "rgba(255,215,0,0.95)"
                              : rank <= 3
                              ? "rgba(255,255,255,0.88)"
                              : "rgba(255,255,255,0.55)",
                          }}
                        >
                          {name}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="empty"
                          className="text-[10px] flex-1"
                          style={{ color: "rgba(255,255,255,0.1)" }}
                        >
                          —
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2.5 pt-1">
        {!isComplete ? (
          <>
            {!hasStarted && (
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl text-white/50 hover:text-white hover:bg-white/6 transition-all font-medium text-sm flex-shrink-0"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              >
                Retour
              </button>
            )}
            <button
              onClick={handleDraw}
              disabled={phase === "spinning" || autoMode}
              className="flex-1 py-3 rounded-2xl font-extrabold text-white text-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              {remaining.length === 1
                ? "Révéler le champion"
                : remaining.length === totalCount
                ? "Commencer l'élimination"
                : "Éliminer le suivant"}
            </button>
            {hasStarted && (
              <motion.button
                onClick={() => setAutoMode((v) => !v)}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex-shrink-0 disabled:opacity-50"
                style={
                  autoMode
                    ? {
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.35)",
                        color: "rgba(252,165,165,0.9)",
                      }
                    : {
                        background: "rgba(20,184,166,0.1)",
                        border: "1px solid rgba(20,184,166,0.28)",
                        color: "rgba(45,212,191,0.9)",
                      }
                }
              >
                {autoMode ? "Stop" : "Auto"}
              </motion.button>
            )}
            <button
              onClick={handleRevealAll}
              className="px-3 py-2.5 rounded-2xl font-bold text-xs flex-shrink-0 transition-all"
              style={{
                background: "rgba(251,146,60,0.1)",
                border: "1px solid rgba(251,146,60,0.28)",
                color: "rgba(251,146,60,0.9)",
              }}
            >
              Tout révéler
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
