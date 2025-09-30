import { useEffect, useRef, useState } from 'react';

interface UseAnimatedLotteryProps {
  isDrawing: boolean;
  items: Array<{ name: string }>;
  result: { winner: { name: string } } | null;
}

export const useAnimatedLottery = ({
  isDrawing,
  items,
  result
}: UseAnimatedLotteryProps) => {
  const [spinningItem, setSpinningItem] = useState<string>("");
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<"spinning" | "slowing" | "stopped">("stopped");

  // Refs pour stocker tous les timers
  const timersRef = useRef<{
    fastInterval?: NodeJS.Timeout;
    slowInterval?: NodeJS.Timeout;
    timeouts: NodeJS.Timeout[];
  }>({ timeouts: [] });

  // Fonction de cleanup
  const clearAllTimers = () => {
    if (timersRef.current.fastInterval) {
      clearInterval(timersRef.current.fastInterval);
    }
    if (timersRef.current.slowInterval) {
      clearInterval(timersRef.current.slowInterval);
    }
    timersRef.current.timeouts.forEach(clearTimeout);
    timersRef.current.timeouts = [];
  };

  useEffect(() => {
    if (!isDrawing || items.length === 0) return;

    clearAllTimers();
    setShowFinalResult(false);
    setAnimationPhase("spinning");

    let currentIndex = 0;

    // Phase 1: Spinning rapide (2 secondes)
    timersRef.current.fastInterval = setInterval(() => {
      setSpinningItem(items[currentIndex % items.length].name);
      currentIndex++;
    }, 100);

    // Phase 2: Ralentissement (après 2s)
    const timeout1 = setTimeout(() => {
      if (timersRef.current.fastInterval) {
        clearInterval(timersRef.current.fastInterval);
      }
      setAnimationPhase("slowing");

      let slowIndex = currentIndex;
      timersRef.current.slowInterval = setInterval(() => {
        setSpinningItem(items[slowIndex % items.length].name);
        slowIndex++;
      }, 200);

      // Phase 3: Arrêt (après 1.5s de plus)
      const timeout2 = setTimeout(() => {
        if (timersRef.current.slowInterval) {
          clearInterval(timersRef.current.slowInterval);
        }
        setAnimationPhase("stopped");

        // Phase 4: Affichage résultat (après 300ms)
        const timeout3 = setTimeout(() => {
          if (result) {
            setSpinningItem(result.winner.name);

            // Phase 5: Bouton final (après 200ms)
            const timeout4 = setTimeout(() => {
              setShowFinalResult(true);
            }, 200);

            timersRef.current.timeouts.push(timeout4);
          }
        }, 300);

        timersRef.current.timeouts.push(timeout3);
      }, 1500);

      timersRef.current.timeouts.push(timeout2);
    }, 2000);

    timersRef.current.timeouts.push(timeout1);

    // Cleanup au démontage
    return clearAllTimers;
  }, [isDrawing, items, result]);

  return {
    spinningItem,
    showFinalResult,
    animationPhase,
  };
};
