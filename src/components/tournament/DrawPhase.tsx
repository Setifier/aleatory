import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DrawStep, TournamentMode, BracketSlot } from "../../types/tournamentDraw";
import type { Group } from "../../types/groupsDraw";
import { computeBracket, getR1SlotRanges } from "../../lib/bracketEngine";
import { DRAW_SPIN_DURATION } from "../../constants/timing";
import SlotReel from "../shared/SlotReel";

// Keep animation duration in sync with the lottery constant
const SPIN_DURATION_S  = DRAW_SPIN_DURATION / 1000; // 4.0 s
const SPIN_DURATION_MS = DRAW_SPIN_DURATION;         // 4000 ms
const PAUSE_AFTER_MS   = 850;
const STEP_DURATION_MS = SPIN_DURATION_MS + PAUSE_AFTER_MS;
const SPIN_EASING: [number, number, number, number] = [0.06, 0.9, 0.28, 1.0];
// Background colour used in gradient fades (matches tournament modal bg)
const SLOT_BG = "rgba(10,10,36,0.97)";

interface DrawPhaseProps {
  steps: DrawStep[];
  revealedCount: number;
  mode: TournamentMode;
  drawnGroups: Group[];
  bracketSlots: BracketSlot[];
  bracketMatchSize?: number;
  onRevealNext: () => void;
  onRevealAll: () => void;
  onFinish: () => void;
}

export default function DrawPhase({
  steps,
  revealedCount,
  mode,
  drawnGroups,
  bracketSlots,
  bracketMatchSize = 2,
  onRevealNext,
  onRevealAll,
  onFinish,
}: DrawPhaseProps) {
  const isDone = revealedCount >= steps.length;
  const currentStep = isDone ? null : steps[revealedCount];
  const [spinDone, setSpinDone] = useState(false);

  const allNames = useMemo(() => steps.map((s) => s.participant.name), [steps]);

  // Reset spin state on each new step
  useEffect(() => {
    setSpinDone(false);
  }, [revealedCount]);

  // Auto-advance timer
  useEffect(() => {
    if (isDone) {
      const t = setTimeout(onFinish, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onRevealNext, STEP_DURATION_MS);
    return () => clearTimeout(t);
  }, [revealedCount, isDone, onRevealNext, onFinish]);

  const handleSkipOne = useCallback(() => onRevealNext(), [onRevealNext]);
  const handleSkipAll = useCallback(() => onRevealAll(), [onRevealAll]);

  // Participants revealed (past steps + current when spin is done)
  const effectiveRevealedIds = useMemo(() => {
    const ids = new Set(steps.slice(0, revealedCount).map((s) => s.participant.id));
    if (spinDone && currentStep) ids.add(currentStep.participant.id);
    return ids;
  }, [steps, revealedCount, spinDone, currentStep]);

  // Bracket slot indices revealed
  const effectiveRevealedSlots = useMemo(() => {
    const set = new Set(
      steps
        .slice(0, revealedCount)
        .map((s) => s.slotIndex)
        .filter((i): i is number => i !== undefined)
    );
    if (spinDone && currentStep?.slotIndex !== undefined) set.add(currentStep.slotIndex);
    return set;
  }, [steps, revealedCount, spinDone, currentStep]);

  const currentParticipantId = spinDone ? currentStep?.participant.id : undefined;
  const currentSlotIndex = spinDone ? currentStep?.slotIndex : undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Slot area */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/35 text-xs font-semibold uppercase tracking-widest">
            Tirage en cours
          </span>
          <span className="text-white/25 text-xs tabular-nums">
            {revealedCount} / {steps.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!isDone ? (
            <motion.div
              key="slot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {/* Slot machine */}
              <SlotMachine
                key={currentStep!.id}
                pool={allNames}
                target={currentStep!.participant.name}
                highlighted={spinDone}
                onSpinComplete={() => setSpinDone(true)}
              />

              {/* Assignment label — slides in after spin */}
              <div className="h-9 flex items-center justify-center mt-1">
                <AnimatePresence>
                  {spinDone && currentStep && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                      className="text-sm font-bold"
                    >
                      <span className="text-white/30">→</span>{" "}
                      <span className="text-secondary-300">
                        {currentStep.groupName ?? `Slot #${currentStep.slotIndex}`}
                      </span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-5 gap-2"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                style={{ background: "rgba(97,216,97,0.15)", color: "rgba(97,216,97,0.9)" }}
              >
                ✓
              </div>
              <p className="text-white font-black text-sm uppercase tracking-wide">
                Tirage terminé !
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live group/bracket table */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-2">
        {mode !== "bracket" ? (
          <DrawGroupTable
            groups={drawnGroups}
            effectiveRevealedIds={effectiveRevealedIds}
            currentParticipantId={currentParticipantId}
          />
        ) : (
          <DrawBracketPreview
            slots={bracketSlots}
            effectiveRevealedSlots={effectiveRevealedSlots}
            currentSlotIndex={currentSlotIndex}
            matchSize={bracketMatchSize}
          />
        )}
      </div>

      {/* Progress bar + controls */}
      <div
        className="px-5 py-3 flex-shrink-0 space-y-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="h-1 rounded-full overflow-hidden bg-white/8">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full"
            animate={{ width: `${steps.length > 0 ? (revealedCount / steps.length) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {!isDone && (
          <div className="flex gap-3">
            <button
              onClick={handleSkipOne}
              className="flex-1 py-2.5 rounded-2xl border border-white/12 text-white/55 hover:text-white hover:bg-white/6 transition-all font-semibold text-sm"
            >
              Suivant
            </button>
            <button
              onClick={handleSkipAll}
              className="flex-1 py-2.5 rounded-2xl border border-secondary-500/25 text-secondary-400/70 hover:bg-secondary-500/10 hover:text-secondary-400 transition-all font-semibold text-sm"
            >
              Tout révéler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Slot Machine ──────────────────────────────────────────────────────────────

function SlotMachine({
  pool,
  target,
  highlighted,
  onSpinComplete,
}: {
  pool: string[];
  target: string;
  highlighted: boolean;
  onSpinComplete: () => void;
}) {
  return (
    <div
      className="relative select-none rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${highlighted ? "rgba(97,97,216,0.4)" : "rgba(255,255,255,0.09)"}`,
        transition: "border-color 0.35s",
        background: "rgba(4,4,18,0.5)",
      }}
    >
      <SlotReel
        pool={pool}
        target={target}
        spinDurationS={SPIN_DURATION_S}
        easing={SPIN_EASING}
        highlighted={highlighted}
        bgColor={SLOT_BG}
        resultLineColor="rgba(97,97,216,0.65)"
        spinLineColor="rgba(255,255,255,0.12)"
        resultCenterBg="rgba(97,97,216,0.07)"
        spinCenterBg="rgba(255,255,255,0.025)"
        resultTextColor="rgba(255,255,255,1)"
        onSpinComplete={onSpinComplete}
      />
    </div>
  );
}

// ── Group table (pre-drawn, fills in) ─────────────────────────────────────────

function DrawGroupTable({
  groups,
  effectiveRevealedIds,
  currentParticipantId,
}: {
  groups: Group[];
  effectiveRevealedIds: Set<string>;
  currentParticipantId?: string;
}) {
  const numCols = Math.min(groups.length, 4);
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
    >
      {groups.map((group) => (
        <div
          key={group.id}
          className="rounded-xl overflow-hidden min-w-0"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Group header */}
          <div
            className="px-2 py-1.5 text-center"
            style={{
              background: "rgba(97,97,216,0.10)",
              borderBottom: "1px solid rgba(97,97,216,0.12)",
            }}
          >
            <p className="text-primary-300 text-xs font-black truncate">{group.name}</p>
          </div>

          {/* Numbered slots */}
          <div className="px-2 py-1.5 space-y-0.5">
            {group.participants.map((p, pi) => {
              const revealed = effectiveRevealedIds.has(p.id);
              const isCurrent = p.id === currentParticipantId;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5"
                  style={{ height: 22 }}
                >
                  <span
                    className="text-[10px] w-3.5 flex-shrink-0 text-right tabular-nums"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    {pi + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                      {revealed ? (
                        <motion.span
                          key="filled"
                          initial={{ opacity: 0, y: isCurrent ? -13 : 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            isCurrent
                              ? { type: "spring", stiffness: 400, damping: 28 }
                              : { duration: 0.14 }
                          }
                          className="block text-xs font-semibold truncate"
                          style={{
                            color: isCurrent
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.68)",
                          }}
                        >
                          {p.name}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="empty"
                          className="block text-[10px]"
                          style={{ color: "rgba(255,255,255,0.14)" }}
                        >
                          ···
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Bracket preview (pre-drawn, fills in) ─────────────────────────────────────

function DrawBracketPreview({
  slots,
  effectiveRevealedSlots,
  currentSlotIndex,
  matchSize = 2,
}: {
  slots: BracketSlot[];
  effectiveRevealedSlots: Set<number>;
  currentSlotIndex?: number;
  matchSize?: number;
}) {
  // Use the natural bracket layout to group slots correctly
  const layout   = computeBracket(slots.length, matchSize);
  const r1Ranges = getR1SlotRanges(layout);

  const groups: BracketSlot[][] = r1Ranges.map(([start, end]) =>
    slots.slice(start, end)
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {groups.map((group, mi) => {
        const isByeGroup = group.length === 1 && group[0]?.isBye;
        return (
          <div
            key={mi}
            className="rounded-xl overflow-hidden"
            style={{
              background: isByeGroup ? "rgba(255,215,0,0.04)" : "rgba(255,255,255,0.02)",
              border: isByeGroup
                ? "1px dashed rgba(255,215,0,0.2)"
                : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {group.map((slot, si) => {
              const revealed  = effectiveRevealedSlots.has(slot.slotIndex);
              const isCurrent = slot.slotIndex === currentSlotIndex;
              const isAutoAdv = slot.isBye; // auto-advance (bye entry)

              return (
                <div
                  key={slot.slotIndex}
                  className="flex items-center gap-2 px-3 transition-colors"
                  style={{
                    height: 34,
                    borderBottom:
                      si < group.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
                    background:
                      revealed && !isAutoAdv ? "rgba(97,97,216,0.06)" : "transparent",
                  }}
                >
                  <span
                    className="text-[10px] w-4 flex-shrink-0 text-right tabular-nums"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    {slot.slotIndex}
                  </span>
                  <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                      {revealed ? (
                        <motion.span
                          key="filled"
                          initial={{ opacity: 0, y: isCurrent ? -11 : 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            isCurrent
                              ? { type: "spring", stiffness: 400, damping: 28 }
                              : { duration: 0.14 }
                          }
                          className="block text-xs font-semibold truncate"
                          style={{
                            color: isCurrent
                              ? "rgba(255,255,255,0.95)"
                              : isAutoAdv
                              ? "rgba(255,215,0,0.8)"
                              : "rgba(255,255,255,0.70)",
                          }}
                        >
                          {slot.participant?.name}
                          {isAutoAdv && (
                            <span style={{ color: "rgba(255,215,0,0.55)", fontSize: 9, marginLeft: 4 }}>
                              AUTO
                            </span>
                          )}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="empty"
                          className="block text-[10px]"
                          style={{ color: "rgba(255,255,255,0.14)" }}
                        >
                          ···
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
