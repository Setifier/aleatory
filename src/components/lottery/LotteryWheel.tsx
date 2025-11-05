import { useEffect, useState } from "react";
import { LotteryItem, LotteryResult } from "../../hooks/useLottery";
import ElementsListModal from "./ElementsListModal";
import { generateDefaultTitle } from "../../lib/lotteryHistoryService";

interface LotteryWheelProps {
  items: LotteryItem[];
  isDrawing: boolean;
  result: LotteryResult | null;
  isVisible: boolean;
  onClose: () => void;
}

const LotteryWheel = ({
  items,
  isDrawing,
  result,
  isVisible,
  onClose,
}: LotteryWheelProps) => {
  const [spinningItem, setSpinningItem] = useState<string>("");
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    "spinning" | "slowing" | "stopped"
  >("stopped");
  const [showElementsList, setShowElementsList] = useState(false);


  useEffect(() => {
    if (!isVisible) {
      setShowFinalResult(false);
      setAnimationPhase("stopped");
      setSpinningItem("");
      setShowElementsList(false);
    }
  }, [isVisible]);


  useEffect(() => {
    if (isVisible) {

      document.body.style.overflow = "hidden";
    } else {

      document.body.style.overflow = "unset";
    }


    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  useEffect(() => {
    if (isDrawing && items.length > 0) {
      setShowFinalResult(false);
      setAnimationPhase("spinning");

      // Phase 1: Spinning rapide (2 secondes)
      let currentIndex = 0;
      const fastSpinInterval = setInterval(() => {
        setSpinningItem(items[currentIndex % items.length].name);
        currentIndex++;
      }, 100);

      setTimeout(() => {
        clearInterval(fastSpinInterval);
        setAnimationPhase("slowing");

        // Phase 2: Ralentissement (1.5 secondes)
        let slowIndex = currentIndex;
        const slowSpinInterval = setInterval(() => {
          setSpinningItem(items[slowIndex % items.length].name);
          slowIndex++;
        }, 200);

        setTimeout(() => {
          clearInterval(slowSpinInterval);
          setAnimationPhase("stopped");


          setTimeout(() => {
            if (result) {
              setSpinningItem(result.winner.name);
              setTimeout(() => {
                setShowFinalResult(true);
              }, 200);
            }
          }, 300);
        }, 1500);
      }, 2000);
    }
  }, [isDrawing, items, result]);

  // Fallback pour s'assurer que le bouton s'affiche toujours
  useEffect(() => {
    if (result && animationPhase === "stopped" && !showFinalResult) {
      const fallbackTimer = setTimeout(() => {
        setSpinningItem(result.winner.name);
        setShowFinalResult(true);
      }, 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [result, animationPhase, showFinalResult]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 rounded-2xl p-8 max-w-lg w-full border-2 border-primary-500 shadow-2xl">
        {/* Effet de glow autour */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 rounded-2xl blur opacity-30 animate-pulse"></div>

        <div className="relative">
          {/* List Icon */}
          {result && showFinalResult && result.elements && (
            <button
              onClick={() => setShowElementsList(true)}
              className="absolute top-0 right-0 text-white hover:text-primary-300 transition-colors p-2"
              title="Voir tous les éléments"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              {animationPhase === "spinning"
                ? "TIRAGE EN COURS..."
                : animationPhase === "slowing"
                ? "RÉSULTAT IMMINENT..."
                : "GAGNANT !"}
            </h3>
            <div className="w-20 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full"></div>
          </div>

          {/* Result Display */}
          <div className="relative mb-8">
            {/* Background circle avec animation */}
            <div
              className={`
              w-48 h-48 mx-auto rounded-full border-4 flex items-center justify-center relative
              ${
                animationPhase === "spinning"
                  ? "border-primary-400 bg-gradient-to-br from-primary-900/50 to-accent-900/50 animate-spin"
                  : animationPhase === "slowing"
                  ? "border-accent-400 bg-gradient-to-br from-accent-900/50 to-primary-900/50 animate-pulse"
                  : showFinalResult
                  ? "border-green-400 bg-gradient-to-br from-green-900/30 to-primary-900/30 animate-winner-pulse"
                  : "border-accent-400 bg-gradient-to-br from-accent-900/50 to-primary-900/50"
              }
            `}
            >
              {/* Decorative elements */}
              {animationPhase === "spinning" && (
                <>
                  <div className="absolute top-2 left-8 w-2 h-2 bg-primary-400 rounded-full animate-ping"></div>
                  <div
                    className="absolute bottom-4 right-6 w-3 h-3 bg-accent-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute top-8 right-4 w-2 h-2 bg-primary-300 rounded-full animate-ping"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </>
              )}

              {/* Result Text */}
              <div className="text-center px-4">
                <div
                  className={`
                  font-bold text-white break-words
                  ${
                    spinningItem.length > 15
                      ? "text-lg"
                      : spinningItem.length > 10
                      ? "text-xl"
                      : "text-2xl"
                  }
                  ${showFinalResult ? "animate-pulse" : ""}
                `}
                >
                  {spinningItem || "..."}
                </div>
              </div>
            </div>

            {/* Pointer/Arrow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary-400"></div>
            </div>
          </div>

          {/* Titre du tirage */}
          {result && showFinalResult && (
            <div className="bg-accent-800/50 rounded-lg p-4 mb-6 border border-accent-600">
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  {result.title || generateDefaultTitle(result.timestamp)}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showFinalResult && (
            <div className="flex justify-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Loading spinner pour les phases d'animation */}
          {(animationPhase === "spinning" || animationPhase === "slowing") && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-accent-300 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent-300 border-t-transparent"></div>
                {animationPhase === "spinning"
                  ? "Mélange des éléments..."
                  : "Sélection du gagnant..."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Elements List Modal */}
      {showElementsList && result && result.elements && (
        <ElementsListModal
          isOpen={true}
          elements={result.elements}
          winner={result.winner}
          title={result.title}
          onClose={() => setShowElementsList(false)}
        />
      )}
    </div>
  );
};

export default LotteryWheel;
