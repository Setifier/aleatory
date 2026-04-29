import { AnimatePresence, motion } from "framer-motion";
import type { LotteryResult } from "../../hooks/useLottery";
import SlotReel, { REEL_ITEM_H } from "../shared/SlotReel";
import { DRAW_SPIN_DURATION } from "../../constants/timing";

const SPIN_DURATION_S = DRAW_SPIN_DURATION / 1000;
const SPIN_EASING: [number, number, number, number] = [0.06, 0.9, 0.28, 1.0];
const BG = "rgba(6,6,28,0.85)";

interface SlotDrawStepProps {
  items: Array<{ id: string; name: string }>;
  isDrawing: boolean;
  hasDrawn: boolean;
  showResult: boolean;
  /** Available synchronously when hasDrawn becomes true — used to build the reel immediately. */
  currentResult: LotteryResult | null;
  /** Gated by DRAW_SPIN_DURATION — used for the result display. */
  animResult: LotteryResult | null;
  onDraw: () => void;
  onReplay: () => void;
  onClose: () => void;
}

export default function SlotDrawStep({
  items,
  isDrawing,
  hasDrawn,
  showResult,
  currentResult,
  animResult,
  onDraw,
  onReplay,
  onClose,
}: SlotDrawStepProps) {
  const isSpinning = hasDrawn && !showResult;

  // Border / glow on the outer container
  const borderColor = showResult
    ? "rgba(255,215,0,0.5)"
    : isSpinning
    ? "rgba(97,97,216,0.6)"
    : "rgba(97,97,216,0.25)";

  const glowShadow = showResult
    ? "0 0 32px rgba(255,215,0,0.2), inset 0 0 16px rgba(0,0,0,0.35)"
    : isSpinning
    ? "0 0 24px rgba(97,97,216,0.3), inset 0 0 16px rgba(0,0,0,0.35)"
    : "inset 0 0 16px rgba(0,0,0,0.3)";

  const stripGradient = showResult
    ? "linear-gradient(90deg,#b8860b,#ffd700,#b8860b)"
    : isSpinning
    ? "linear-gradient(90deg,#4040a0,#7965e0,#4040a0)"
    : "rgba(97,97,216,0.2)";

  return (
    <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-6">

      {/* ── Slot machine ── */}
      <div className="w-full max-w-xs mx-auto">
        <motion.div
          className="relative rounded-2xl overflow-hidden select-none"
          animate={{ borderColor, boxShadow: glowShadow }}
          transition={{ duration: 0.4 }}
          style={{ border: "2px solid", background: "rgba(6,6,28,0.6)" }}
        >
          {/* Top decorative strip */}
          <motion.div
            className="h-1.5 w-full"
            animate={{ background: stripGradient }}
            transition={{ duration: 0.4 }}
          />

          {/* Reel area */}
          {hasDrawn && currentResult ? (
            /*
             * Tape approach — smooth single motion.div scroll.
             * Keyed by draw timestamp so a new reel is built on each draw / replay.
             */
            <SlotReel
              key={`draw-${currentResult.timestamp.getTime()}`}
              pool={items.map((i) => i.name)}
              target={currentResult.winner.name}
              spinDurationS={SPIN_DURATION_S}
              easing={SPIN_EASING}
              highlighted={showResult}
              bgColor={BG}
            />
          ) : (
            /* Idle placeholder — same dimensions, just a "?" in the center */
            <div style={{ height: REEL_ITEM_H * 3, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: REEL_ITEM_H, height: REEL_ITEM_H,
                  left: 0, right: 0,
                  background: "rgba(255,255,255,0.03)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 2,
                }}
              >
                <span className="text-2xl font-extrabold text-white/15">?</span>
              </div>
              {/* Top fade */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: REEL_ITEM_H, background: `linear-gradient(to bottom, ${BG}, transparent)`, pointerEvents: "none", zIndex: 3 }} />
              {/* Bottom fade */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: REEL_ITEM_H, background: `linear-gradient(to top, ${BG}, transparent)`, pointerEvents: "none", zIndex: 3 }} />
              {/* Center frame lines */}
              <div style={{ position: "absolute", top: REEL_ITEM_H, left: 12, right: 12, height: 1, background: "rgba(97,97,216,0.25)", zIndex: 4 }} />
              <div style={{ position: "absolute", top: REEL_ITEM_H * 2 - 1, left: 12, right: 12, height: 1, background: "rgba(97,97,216,0.25)", zIndex: 4 }} />
            </div>
          )}

          {/* Bottom decorative strip */}
          <motion.div
            className="h-1.5 w-full"
            animate={{ background: stripGradient }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>

        {/* Sub-label */}
        <div className="h-7 flex items-center justify-center mt-2">
          <AnimatePresence mode="wait">
            {showResult && (
              <motion.p
                key="winner-label"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-white/40 text-xs"
              >
                🏆 Gagnant · {animResult?.elements.length} participant
                {(animResult?.elements.length ?? 0) > 1 ? "s" : ""}
              </motion.p>
            )}
            {isSpinning && (
              <motion.p
                key="spinning-label"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-white/20 text-xs"
              >
                Tirage en cours…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── CTA ── */}
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.button
            key="draw-btn"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            onClick={onDraw}
            disabled={items.length < 2 || isDrawing || isSpinning}
            className="w-full py-4 rounded-2xl text-lg font-extrabold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-glow-md transition-all active:scale-[0.98]"
            whileHover={!isDrawing && !isSpinning ? { scale: 1.02 } : {}}
            whileTap={!isDrawing && !isSpinning ? { scale: 0.98 } : {}}
          >
            Lancer le tirage !
          </motion.button>
        ) : (
          <motion.div
            key="winner-actions"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 w-full"
          >
            <button
              onClick={onReplay}
              className="flex-1 py-3 rounded-2xl border border-white/15 text-white/70 hover:text-white hover:bg-white/8 transition-all font-semibold"
            >
              Rejouer
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold transition-all"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
