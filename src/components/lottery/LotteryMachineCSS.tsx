import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import "./LotteryMachineCSS.css";

interface LotteryMachineCSSProps {
  items: Array<{ id: string; name: string }>;
  isDrawing: boolean;
  winner: string | null;
}

export default function LotteryMachineCSS({
  items,
  isDrawing,
  winner,
}: LotteryMachineCSSProps) {
  const [showWinner, setShowWinner] = useState(false);

  // Couleur grise unique pour tous les items
  const grayColor = {
    base: "#6b7280",
    dark: "#4b5563",
    glow: "rgba(107, 114, 128, 0.5)",
  };

  // Créer des copies des items pour l'effet de boucle infinie
  const itemsToRender = useMemo(() => {
    const copies = [];
    for (let i = 0; i < 5; i++) {
      copies.push(...items);
    }
    return copies;
  }, [items]);

  useEffect(() => {
    if (winner && isDrawing) {
      // Afficher le gagnant après l'animation
      setTimeout(() => {
        setShowWinner(true);
      }, 3500);
    } else {
      setShowWinner(false);
    }
  }, [winner, isDrawing]);

  if (items.length === 0) {
    return (
      <div className="w-full h-[400px] sm:h-[500px] flex items-center justify-center glass-strong rounded-2xl border border-white/10">
        <div className="text-center">
          <div className="text-6xl mb-4">🎰</div>
          <p className="text-white/60 text-lg">
            Ajoutez des éléments pour voir la machine
          </p>
        </div>
      </div>
    );
  }

  // Trouver l'index du gagnant dans le tableau original
  const winnerIndexOriginal = winner ? items.findIndex(item => item.name === winner) : 0;

  // Le gagnant sera dans la copie du milieu (copie #2)
  const winnerIndexInLoop = items.length > 0 ? winnerIndexOriginal + (items.length * 2) : 0;

  return (
    <div className="relative w-full">
      {/* Container Slot Machine */}
      <div className="slot-machine-container">
        {/* Cadre de la machine */}
        <div className="slot-machine-frame">
          {/* Ligne de victoire */}
          <div className="win-line" />

          {/* Colonne unique centrale */}
          <div className="slot-column-single">
            <div className="slot-reel" style={{ position: 'relative' }}>
              {itemsToRender.map((item, index) => {
                const isWinner = showWinner && index === winnerIndexInLoop;

                // Position de repos : items distribués pour être visibles des deux côtés
                // Commence 2 items au-dessus du viewport pour l'effet infini
                const restPosition = -224 + (index * 112);

                // Position finale : gagnant centré à 130px
                const basePosition = 130;
                const winnerPosition = basePosition - (winnerIndexInLoop * 112) + (index * 112);

                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    className={`slot-ball ${isWinner ? "winner" : ""}`}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      "--ball-color": isWinner ? "#ffd700" : grayColor.base,
                      "--ball-color-dark": isWinner ? "#b8860b" : grayColor.dark,
                      "--ball-glow": isWinner ? "rgba(255, 215, 0, 0.6)" : grayColor.glow,
                    } as React.CSSProperties}
                    animate={{
                      top: isDrawing ? winnerPosition : restPosition,
                    }}
                    transition={{
                      duration: isDrawing ? 3.5 : 0.3,
                      ease: isDrawing ? [0.22, 1, 0.36, 1] : "easeOut",
                    }}
                  >
                    <div className="ball-text">{item.name.substring(0, 30)}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Particules d'explosion */}
      <AnimatePresence>
        {showWinner && (
          <div className="particles-container">
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                style={{
                  background: i % 3 === 0 ? "#ffd700" : i % 3 === 1 ? "#ffed4e" : "#ff6b35",
                  left: "50%",
                  top: "50%",
                }}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 2, 1.5, 0],
                  opacity: [1, 1, 0.6, 0],
                  x: (Math.cos((i / 60) * Math.PI * 2) * 300) + (Math.random() - 0.5) * 150,
                  y: (Math.sin((i / 60) * Math.PI * 2) * 300) + (Math.random() - 0.5) * 150,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 1.8,
                  delay: Math.random() * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Message nombre d'items */}
      {items.length > 1 && (
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-dark px-4 py-2 rounded-lg border border-secondary-400/50 text-sm text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {items.length} participant{items.length > 1 ? "s" : ""}
        </motion.div>
      )}
    </div>
  );
}
