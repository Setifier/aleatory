import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserAuth } from "../../context/AuthContext";
import { useLottery, LotteryResult } from "../../hooks/useLottery";
import { useSavedItems } from "../../hooks/useSavedItems";
import { useFolders } from "../../hooks/useFolders";
import { normalizeText } from "../../lib/textUtils";
import { DRAW_SPIN_DURATION } from "../../constants/timing";
import FortuneWheel from "./FortuneWheel";
import InlineLibrary from "../library/InlineLibrary";
import Button from "../ui/Button";
import MechanismSelectStep, { type DrawMechanism } from "./MechanismSelectStep";
import SlotDrawStep from "./SlotDrawStep";
import EliminationDrawStep from "./EliminationDrawStep";
import ClassementDrawStep from "./ClassementDrawStep";

interface LotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItems?: Array<{ id: string; name: string }>;
  initialTitle?: string;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: "Participants",
  2: "Titre",
  3: "Mode",
  4: "Tirage",
};

export default function LotteryModal({ isOpen, onClose, initialItems, initialTitle }: LotteryModalProps) {
  const auth = UserAuth();
  const isAuthenticated = !!auth?.session;

  const [step, setStep]                   = useState<Step>(1);
  const [lotteryTitle, setLotteryTitle]   = useState("");
  const [mechanism, setMechanism]         = useState<DrawMechanism>("wheel");
  const [inputValue, setInputValue]       = useState("");
  const [showResult, setShowResult]       = useState(false);
  const [hasDrawn, setHasDrawn]           = useState(false);
  const [animResult, setAnimResult]       = useState<LotteryResult | null>(null);
  const spinTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentResultRef = useRef<LotteryResult | null>(null);
  const titleRef         = useRef<HTMLInputElement>(null);

  const {
    items, currentResult, isDrawing, error,
    addItem, removeItem, toggleItem, drawLottery, saveManualResult, clearItems, resetItems, clearError,
  } = useLottery(isAuthenticated);

  // Pre-load items when the modal opens from a history re-launch
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && initialItems?.length) {
      resetItems(initialItems);
      setLotteryTitle(initialTitle ?? "");
      setStep(3);
    }
    prevIsOpenRef.current = isOpen;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const {
    savedItems, loadingSavedItems,
    handleDeleteSavedItem, handleToggleItemFolder, autoSaveItemsToRecent,
  } = useSavedItems();

  const {
    recentFolder, otherFolders,
    handleCreateFolder, handleDeleteFolder,
  } = useFolders();

  // Auto-focus title field on step 2
  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => titleRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => { currentResultRef.current = currentResult; }, [currentResult]);

  const handleAddItem = useCallback((name: string) => {
    addItem(normalizeText(name));
  }, [addItem]);

  const clearSpinTimer = () => {
    if (spinTimerRef.current) { clearTimeout(spinTimerRef.current); spinTimerRef.current = null; }
  };

  const goToStep = (s: Step) => {
    if (s !== 4) {
      clearSpinTimer();
      setHasDrawn(false); setShowResult(false); setAnimResult(null);
    }
    setStep(s);
  };

  const handleSelectMechanism = (m: DrawMechanism) => {
    setMechanism(m);
    if (isAuthenticated && recentFolder && items.length > 0) {
      autoSaveItemsToRecent(items.map((i) => i.name), recentFolder.id);
    }
    goToStep(4);
  };

  const handleDraw = async () => {
    clearSpinTimer();
    setHasDrawn(true);
    setShowResult(false);
    setAnimResult(null);

    spinTimerRef.current = setTimeout(() => {
      const res = currentResultRef.current;
      if (res) { setAnimResult(res); setShowResult(true); }
    }, DRAW_SPIN_DURATION);

    await drawLottery(lotteryTitle, mechanism);
    setLotteryTitle("");
  };

  const handleReplay = () => {
    clearSpinTimer();
    setShowResult(false);
    setAnimResult(null);
    setHasDrawn(false);
  };

  const handleClose = () => {
    clearSpinTimer();
    setStep(1); setLotteryTitle(""); setInputValue("");
    setShowResult(false); setAnimResult(null);
    setHasDrawn(false);
    clearItems(); clearError();
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleAddItem(inputValue.trim());
      setInputValue("");
    }
  };

  const wheelWinner = hasDrawn && currentResult ? currentResult.winner.name : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", paddingTop: "80px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full sm:max-w-md flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 96px)",
              background: "rgba(12,12,42,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {([1, 2, 3, 4] as const).map(s => (
                    <div
                      key={s}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: s === step ? 24 : 10,
                        height: 10,
                        background:
                          s === step
                            ? "#7965e0"
                            : s < step
                            ? "#4a3fa0"
                            : "rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-white/40 text-sm">{STEP_LABELS[step]}</span>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 text-white/50 hover:text-white transition-all text-base"
              >
                ✕
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              <AnimatePresence mode="wait">

                {/* STEP 1 — Participants */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pt-6 pb-4 space-y-5"
                  >
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={onKeyDown}
                          placeholder="Ajouter un participant…"
                          autoFocus
                          className="flex-1 px-4 py-4 rounded-2xl text-lg bg-black/50 border-2 border-white/20 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 text-white placeholder-white/30 transition-all"
                        />
                        <button
                          onClick={() => { if (inputValue.trim()) { handleAddItem(inputValue.trim()); setInputValue(""); } }}
                          disabled={!inputValue.trim()}
                          className="w-14 h-14 rounded-2xl bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-2xl font-bold flex items-center justify-center flex-shrink-0 transition-all shadow-lg shadow-primary-500/30"
                        >
                          +
                        </button>
                      </div>
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="text-red-400 text-sm mt-2 px-1"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {isAuthenticated ? (
                      <div className="max-h-[220px] overflow-y-auto rounded-xl">
                        <InlineLibrary
                          savedItems={savedItems}
                          recentFolder={recentFolder}
                          otherFolders={otherFolders}
                          lotteryItems={items.map((i) => i.name)}
                          loadingItems={loadingSavedItems}
                          onAddItemToLottery={(name) => toggleItem(name, true)}
                          onDeleteItem={handleDeleteSavedItem}
                          onCreateFolder={handleCreateFolder}
                          onDeleteFolder={handleDeleteFolder}
                          onToggleItemFolder={handleToggleItemFolder}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-secondary-500/8 border border-secondary-500/18">
                        <span className="text-white/60 text-sm">
                          <Link to="/signin" onClick={handleClose} className="text-secondary-400 font-semibold underline transition-colors">
                            Connectez-vous
                          </Link>{" "}pour votre bibliothèque
                        </span>
                      </div>
                    )}

                    <AnimatePresence>
                      {items.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 text-xs font-medium uppercase tracking-wide">
                              Liste · {items.length}
                            </span>
                            <button onClick={clearItems} className="text-white/25 hover:text-red-400 transition-colors text-xs">
                              Tout vider
                            </button>
                          </div>
                          {items.map((item, idx) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/25 border border-white/8"
                            >
                              <span className="text-primary-400 font-bold text-sm w-5 text-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="flex-1 text-white font-medium text-base truncate">
                                {item.name}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-white/25 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
                              >
                                ×
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* STEP 2 — Title */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pt-8 pb-6 flex flex-col gap-6"
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-white uppercase tracking-wide">Titre du tirage</h3>
                      <p className="text-white/45 mt-1">Optionnel — apparaîtra dans l'historique</p>
                    </div>

                    <input
                      ref={titleRef}
                      type="text"
                      value={lotteryTitle}
                      onChange={e => setLotteryTitle(e.target.value.slice(0, 80))}
                      onKeyDown={e => { if (e.key === "Enter" && lotteryTitle.trim()) goToStep(3); }}
                      placeholder="Ex : Tirage équipes, Qui paye…"
                      className="w-full px-4 py-4 rounded-2xl text-center text-lg bg-black/40 border-2 border-white/15 focus:border-primary-400 focus:outline-none text-white placeholder-white/30 transition-colors"
                    />

                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {items.slice(0, 8).map(i => (
                        <span key={i.id} className="text-xs text-white/50 bg-white/6 px-2.5 py-1 rounded-full">
                          {i.name}
                        </span>
                      ))}
                      {items.length > 8 && (
                        <span className="text-xs text-white/30 px-2 py-1">+{items.length - 8}</span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 — Mechanism selection */}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MechanismSelectStep onSelect={handleSelectMechanism} />
                  </motion.div>
                )}

                {/* STEP 4 — Draw */}
                {step === 4 && (
                  <motion.div
                    key={`s4-${mechanism}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mechanism === "wheel" && (
                      <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-5">
                        <FortuneWheel items={items} winner={wheelWinner} />

                        <AnimatePresence mode="wait">
                          {!showResult ? (
                            <motion.button
                              key="draw-btn"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              onClick={handleDraw}
                              disabled={items.length < 2 || isDrawing || (hasDrawn && !showResult)}
                              className="w-full py-4 rounded-2xl text-lg font-extrabold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-glow-md transition-all active:scale-[0.98]"
                              whileHover={!isDrawing && !hasDrawn ? { scale: 1.02 } : {}}
                              whileTap={!isDrawing && !hasDrawn ? { scale: 0.98 } : {}}
                            >
                              {isDrawing ? "Tirage en cours…" : "Tourner la roue !"}
                            </motion.button>
                          ) : (
                            <motion.div
                              key="winner-card"
                              initial={{ opacity: 0, scale: 0.9, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ type: "spring", stiffness: 280, damping: 26 }}
                              className="w-full rounded-3xl p-6 text-center"
                              style={{
                                background: "linear-gradient(135deg, rgba(97,97,216,0.18), rgba(188,184,143,0.1))",
                                border: "1px solid rgba(255,215,0,0.35)",
                              }}
                            >
                              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Gagnant</p>
                              <p className="text-3xl font-extrabold text-yellow-300 break-words leading-tight mb-1">
                                {animResult?.winner.name}
                              </p>
                              {animResult?.title && (
                                <p className="text-white/40 text-sm mb-1">{animResult.title}</p>
                              )}
                              <p className="text-white/30 text-xs mb-5">
                                {animResult?.elements.length} participant{(animResult?.elements.length ?? 0) > 1 ? "s" : ""}
                              </p>
                              <div className="flex gap-3">
                                <button
                                  onClick={handleReplay}
                                  className="flex-1 py-3 rounded-2xl border border-white/15 text-white/70 hover:text-white hover:bg-white/8 transition-all font-semibold"
                                >
                                  Rejouer
                                </button>
                                <button
                                  onClick={handleClose}
                                  className="flex-1 py-3 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold transition-all"
                                >
                                  Fermer
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {mechanism === "slot" && (
                      <SlotDrawStep
                        items={items}
                        isDrawing={isDrawing}
                        hasDrawn={hasDrawn}
                        showResult={showResult}
                        currentResult={currentResult}
                        animResult={animResult}
                        onDraw={handleDraw}
                        onReplay={handleReplay}
                        onClose={handleClose}
                      />
                    )}

                    {mechanism === "elimination" && (
                      <EliminationDrawStep
                        items={items}
                        onClose={handleClose}
                        onBack={() => goToStep(3)}
                        onComplete={(winnerName) =>
                          saveManualResult(winnerName, lotteryTitle, "elimination")
                        }
                      />
                    )}

                    {mechanism === "classement" && (
                      <ClassementDrawStep
                        items={items}
                        onClose={handleClose}
                        onBack={() => goToStep(3)}
                        onComplete={(winnerName) =>
                          saveManualResult(winnerName, lotteryTitle, "classement")
                        }
                      />
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Footer / Navigation ── */}
            <div className="px-6 py-4 border-t border-white/8 flex-shrink-0">
              {step === 1 && (
                <div className="flex items-center justify-between gap-4">
                  <span className={`text-sm font-medium ${items.length >= 2 ? "text-primary-400" : "text-white/35"}`}>
                    {items.length < 2 ? `${items.length}/2 minimum` : `${items.length} prêts ✓`}
                  </span>
                  <Button
                    onClick={() => goToStep(2)}
                    disabled={items.length < 2}
                    variant="gradient" size="lg" withGlow={items.length >= 2}
                    className="px-6"
                  >
                    Suivant
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStep(1)}
                    className="px-3 py-2 rounded-2xl border border-white/12 text-white/60 hover:text-white hover:bg-white/6 transition-all font-medium text-sm"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => goToStep(3)}
                    className="flex-1 py-2 rounded-2xl border border-white/12 text-white/60 hover:text-white hover:bg-white/6 transition-all font-medium text-sm"
                  >
                    Passer
                  </button>
                  <button
                    onClick={() => goToStep(3)}
                    disabled={!lotteryTitle.trim()}
                    className="flex-1 py-2 rounded-2xl bg-primary-500 hover:bg-primary-400 disabled:opacity-35 disabled:cursor-not-allowed text-white font-bold transition-all text-sm"
                  >
                    Valider
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => goToStep(2)}
                    className="px-3 py-2 rounded-2xl border border-white/12 text-white/60 hover:text-white hover:bg-white/6 transition-all font-medium text-sm"
                  >
                    Retour
                  </button>
                  <p className="text-white/25 text-xs">Choisissez un mode ci-dessus</p>
                </div>
              )}

              {step === 4 && mechanism !== "elimination" && mechanism !== "classement" && !showResult && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goToStep(3)}
                    className="px-3 py-2 rounded-2xl border border-white/12 text-white/50 hover:text-white hover:bg-white/6 transition-all font-medium text-sm"
                  >
                    Retour
                  </button>
                  <span className="text-white/25 text-xs">
                    {items.length} participant{items.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {step === 4 && mechanism !== "elimination" && mechanism !== "classement" && showResult && (
                <p className="text-center text-white/25 text-xs">
                  Rejouer avec les mêmes participants
                </p>
              )}

              {!isAuthenticated && step < 4 && (
                <p className="text-center text-white/25 text-xs mt-2">
                  <Link to="/signin" onClick={handleClose} className="text-secondary-400 underline">
                    Connectez-vous
                  </Link>{" "}
                  pour sauvegarder vos tirages
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
