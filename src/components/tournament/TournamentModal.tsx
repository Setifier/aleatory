import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserAuth } from "../../context/AuthContext";
import { useTournamentDraw } from "../../hooks/useTournamentDraw";
import { useSavedItems } from "../../hooks/useSavedItems";
import { useFolders } from "../../hooks/useFolders";
import { saveTournamentDraw } from "../../lib/tournamentService";
import ModeSelectPhase from "./ModeSelectPhase";
import ParticipantsPhase from "./ParticipantsPhase";
import ConfigPhase from "./ConfigPhase";
import DrawPhase from "./DrawPhase";
import ResultsPhase from "./ResultsPhase";
import type { TournamentMode } from "../../types/tournamentDraw";

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const PHASE_LABELS: Record<number, string> = {
  1: "Format",
  2: "Participants",
  3: "Configuration",
  4: "Tirage",
  5: "Résultats",
};

export default function TournamentModal({ isOpen, onClose, onSaved }: TournamentModalProps) {
  const auth = UserAuth();
  const isAuthenticated = !!auth?.session;

  const draw = useTournamentDraw(isAuthenticated);
  const hasSavedRef = useRef(false);

  const {
    savedItems,
    loadingSavedItems,
    handleDeleteSavedItem,
    handleToggleItemFolder,
    autoSaveItemsToRecent,
  } = useSavedItems();

  const {
    tournamentRecentFolder,
    otherFolders,
    handleCreateFolder,
    handleDeleteFolder,
  } = useFolders();

  // Save draw result when phase 5 is reached
  useEffect(() => {
    if (draw.phase === 5 && !hasSavedRef.current && isAuthenticated) {
      hasSavedRef.current = true;
      saveTournamentDraw({
        mode: draw.mode!,
        title: draw.title,
        totalParticipants: draw.participants.length,
        bracketMatchSize: draw.bracketMatchSize,
        groups: draw.drawnGroups,
        bracketSlots: draw.bracketSlots,
      }).then(({ success }) => {
        if (success) onSaved?.();
      });
    }
  }, [draw.phase, isAuthenticated]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        hasSavedRef.current = false;
        draw.reset();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, draw.reset]);

  const handleClose = () => {
    onClose();
  };

  const handleStartDraw = () => {
    if (isAuthenticated && tournamentRecentFolder) {
      autoSaveItemsToRecent(
        draw.participants.map((p) => p.name),
        tournamentRecentFolder.id
      );
    }
    draw.startDraw();
  };

  const modeLabel = (m: TournamentMode | null) => {
    if (!m) return "";
    return m === "groups" ? "Groupes" : m === "bracket" ? "Bracket" : "Groupes + Bracket";
  };

  const canGoNext = () => {
    if (draw.phase === 2) return draw.canProceedFromParticipants;
    if (draw.phase === 3) return true;
    return false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)", paddingTop: "80px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={`relative w-full flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl ${
              draw.phase >= 3 ? "sm:max-w-3xl" : "sm:max-w-md"
            }`}
            style={{
              maxHeight: "calc(100vh - 96px)",
              background: "rgba(12,12,42,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — hidden in results phase (it has its own) */}
            {draw.phase < 5 && (
              <div
                className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: s === draw.phase ? 24 : 10,
                          height: 10,
                          background:
                            s === draw.phase
                              ? "#7965e0"
                              : s < draw.phase
                              ? "#4a3fa0"
                              : "rgba(255,255,255,0.15)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-white/40 text-sm">
                    {draw.mode && draw.phase > 1
                      ? `${modeLabel(draw.mode)} · ${PHASE_LABELS[draw.phase]}`
                      : PHASE_LABELS[draw.phase]}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 text-white/50 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto overflow-x-auto overscroll-contain">
              <AnimatePresence mode="wait">
                {draw.phase === 1 && (
                  <PhaseWrapper key="p1">
                    <ModeSelectPhase onSelect={draw.selectMode} />
                  </PhaseWrapper>
                )}

                {draw.phase === 2 && (
                  <PhaseWrapper key="p2">
                    <ParticipantsPhase
                      mode={draw.mode!}
                      participants={draw.participants}
                      minParticipants={draw.minParticipants}
                      error={draw.error}
                      isAuthenticated={isAuthenticated}
                      savedItems={savedItems}
                      tournamentRecentFolder={tournamentRecentFolder}
                      otherFolders={otherFolders}
                      loadingItems={loadingSavedItems}
                      onAdd={draw.addParticipant}
                      onToggle={draw.toggleParticipant}
                      onRemove={draw.removeParticipant}
                      onClear={draw.clearParticipants}
                      onDeleteSavedItem={handleDeleteSavedItem}
                      onCreateFolder={handleCreateFolder}
                      onDeleteFolder={handleDeleteFolder}
                      onToggleItemFolder={handleToggleItemFolder}
                    />
                  </PhaseWrapper>
                )}

                {draw.phase === 3 && (
                  <PhaseWrapper key="p3">
                    <ConfigPhase
                      mode={draw.mode!}
                      participants={draw.participants}
                      pots={draw.pots}
                      groupsConfig={draw.groupsConfig}
                      bracketMatchSize={draw.bracketMatchSize}
                      error={draw.error}
                      onUpdateGroupsConfig={draw.updateGroupsConfig}
                      onSetBracketMatchSize={draw.setBracketMatchSize}
                      onMoveParticipantToPot={draw.moveParticipantToPot}
                      onAddPot={draw.addPot}
                      onRemovePot={draw.removePot}
                    />
                  </PhaseWrapper>
                )}

                {draw.phase === 4 && (
                  <PhaseWrapper key="p4" className="h-full">
                    <DrawPhase
                      steps={draw.drawSteps}
                      revealedCount={draw.revealedCount}
                      mode={draw.mode!}
                      drawnGroups={draw.drawnGroups}
                      bracketSlots={draw.bracketSlots}
                      bracketMatchSize={draw.bracketMatchSize}
                      onRevealNext={draw.revealNext}
                      onRevealAll={draw.revealAll}
                      onFinish={draw.finishDraw}
                    />
                  </PhaseWrapper>
                )}

                {draw.phase === 5 && (
                  <PhaseWrapper key="p5" className="h-full">
                    <ResultsPhase
                      mode={draw.mode!}
                      title={draw.title}
                      groups={draw.drawnGroups}
                      bracketSlots={draw.bracketSlots}
                      bracketSize={draw.bracketSize}
                      bracketMatchSize={draw.bracketMatchSize}
                      totalParticipants={draw.participants.length}
                      onClose={handleClose}
                    />
                  </PhaseWrapper>
                )}
              </AnimatePresence>
            </div>

            {/* Footer navigation — phases 1–3 only */}
            {draw.phase < 4 && (
              <div
                className="px-6 py-4 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                {draw.phase === 1 && (
                  <p className="text-center text-white/25 text-xs">
                    Sélectionnez un format ci-dessus
                  </p>
                )}

                {draw.phase === 2 && (
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => draw.goToPhase(1)}
                      className="px-3 py-2 rounded-2xl border border-white/12 text-white/55 hover:text-white hover:bg-white/6 transition-all font-medium text-sm"
                    >
                      Retour
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        draw.canProceedFromParticipants ? "text-primary-400" : "text-white/30"
                      }`}
                    >
                      {draw.participants.length < draw.minParticipants
                        ? `${draw.participants.length}/${draw.minParticipants} minimum`
                        : `${draw.participants.length} prêts ✓`}
                    </span>
                    <button
                      onClick={() => draw.goToPhase(3)}
                      disabled={!canGoNext()}
                      className="px-4 py-2 rounded-2xl bg-primary-500 hover:bg-primary-400 disabled:opacity-35 disabled:cursor-not-allowed text-white font-bold transition-all text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                )}

                {draw.phase === 3 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => draw.goToPhase(2)}
                      className="px-3 py-2 rounded-2xl border border-white/12 text-white/55 hover:text-white hover:bg-white/6 transition-all font-medium text-sm"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleStartDraw}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-extrabold transition-all text-sm shadow-glow-md"
                    >
                      Lancer le tirage
                    </button>
                  </div>
                )}

                {!isAuthenticated && (
                  <p className="text-center text-white/25 text-xs mt-2">
                    <Link to="/signin" onClick={handleClose} className="text-secondary-400 underline">
                      Connectez-vous
                    </Link>{" "}
                    pour sauvegarder vos tirages
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhaseWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.18 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
