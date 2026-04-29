import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import "./LotteryMachineCSS.css";

interface LotteryMachineCSSProps {
  items: Array<{ id: string; name: string }>;
  isDrawing: boolean;
  winner: string | null;
}

const ITEM_HEIGHT = 78;
const GAP = 10;
const ITEM_SLOT = ITEM_HEIGHT + GAP;
const NUM_VISIBLE = 5;
const VIEWPORT_HEIGHT = NUM_VISIBLE * ITEM_SLOT - GAP;
const NUM_COPIES = 7;
const WINNER_COPY = 3;
const CENTER_OFFSET = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2;

const PARTICLE_COLORS = ["#ffd700", "#ffed4e", "#ff6b35", "#6161d8", "#a195f8", "#ff4488", "#44ffaa", "#bcb88f"];

export default function LotteryMachineCSS({
  items,
  isDrawing,
  winner,
}: LotteryMachineCSSProps) {
  const [showWinner, setShowWinner] = useState(false);
  const [reelKey, setReelKey] = useState(0);
  const prevDrawingRef = useRef(false);

  const fullReel = useMemo(() => {
    const reel: Array<{
      id: string;
      name: string;
      uniqueKey: string;
      reelIndex: number;
    }> = [];
    for (let copy = 0; copy < NUM_COPIES; copy++) {
      items.forEach((item, j) => {
        reel.push({
          ...item,
          uniqueKey: `${copy}-${item.id}`,
          reelIndex: copy * items.length + j,
        });
      });
    }
    return reel;
  }, [items]);

  const particleData = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        angle: (i / 60) * Math.PI * 2,
        distance: 180 + Math.random() * 220,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        isRect: i % 4 === 0,
        w: i % 5 === 0 ? 12 : 8,
        h: i % 5 === 0 ? 5 : 8,
        dx: (Math.random() - 0.5) * 120,
        dy: (Math.random() - 0.5) * 120,
        rotate: Math.random() * 720 - 360,
        duration: 1.4 + Math.random() * 0.9,
        delay: Math.random() * 0.3,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const winnerIndexInItems =
    winner !== null ? items.findIndex((i) => i.name === winner) : -1;
  const safeWinnerIndex = winnerIndexInItems >= 0 ? winnerIndexInItems : 0;
  const winnerReelIndex = items.length * WINNER_COPY + safeWinnerIndex;

  // y position where copy 1's first item is centered (rest state)
  const restY =
    items.length > 0
      ? -(items.length * ITEM_SLOT) + CENTER_OFFSET
      : CENTER_OFFSET;
  // y position where winner is centered (draw target)
  const targetY = -(winnerReelIndex * ITEM_SLOT) + CENTER_OFFSET;

  // Trigger new animation when draw starts
  useEffect(() => {
    const drawJustStarted = isDrawing && !prevDrawingRef.current;
    if (drawJustStarted && winner) {
      setShowWinner(false);
      setReelKey((k) => k + 1);
    }
    prevDrawingRef.current = isDrawing;
  }, [isDrawing, winner]);

  // Show winner effects after animation
  useEffect(() => {
    if (winner && isDrawing) {
      const timer = setTimeout(() => setShowWinner(true), 3400);
      return () => clearTimeout(timer);
    }
    if (!winner) {
      setShowWinner(false);
    }
  }, [winner, isDrawing]);

  if (items.length === 0) {
    return (
      <div className="lottery-empty">
        <div className="text-6xl mb-4">🎰</div>
        <p className="text-white/60 text-lg">
          Ajoutez des éléments pour voir la machine
        </p>
      </div>
    );
  }

  return (
    <div className="lottery-wrapper">
      <div className={`lottery-frame${showWinner ? " winner-active" : ""}`}>
        {/* Left decorations */}
        <div className="lottery-side">
          {["★", "✦", "★"].map((s, i) => (
            <motion.span
              key={i}
              className="lottery-star-icon"
              animate={
                showWinner
                  ? {
                      rotate: i % 2 === 0 ? [0, 360] : [0, -360],
                      scale: [1, 1.4, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.9 + i * 0.15,
                repeat: showWinner ? Infinity : 0,
                delay: i * 0.25,
              }}
            >
              {s}
            </motion.span>
          ))}
        </div>

        {/* Viewport */}
        <div className="lottery-viewport" style={{ height: VIEWPORT_HEIGHT }}>
          {/* Fade overlays */}
          <div className="lottery-fade-top" />
          <div className="lottery-fade-bottom" />

          {/* Winner zone highlight */}
          <div
            className={`lottery-winner-zone${showWinner ? " active" : ""}`}
            style={{ top: CENTER_OFFSET - 3, height: ITEM_HEIGHT + 6 }}
          />

          {/* Reel */}
          <div className="lottery-reel-clip">
            <motion.div
              key={reelKey}
              className="lottery-reel"
              initial={{ y: restY }}
              animate={{ y: isDrawing && winner ? targetY : restY }}
              transition={{
                duration: isDrawing && winner ? 3.5 : 0.35,
                ease:
                  isDrawing && winner ? [0.05, 0.9, 0.08, 1.0] : "easeOut",
              }}
            >
              {fullReel.map((item) => {
                const isWinner =
                  showWinner && item.reelIndex === winnerReelIndex;
                return (
                  <motion.div
                    key={item.uniqueKey}
                    className={`lottery-item${isWinner ? " lottery-item-winner" : ""}`}
                    style={{ height: ITEM_HEIGHT, marginBottom: GAP }}
                    animate={isWinner ? { scale: [1, 1.03, 1] } : {}}
                    transition={
                      isWinner
                        ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                        : {}
                    }
                  >
                    <span className="lottery-item-text">
                      {item.name.substring(0, 35)}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Right decorations */}
        <div className="lottery-side lottery-side-right">
          {["★", "✦", "★"].map((s, i) => (
            <motion.span
              key={i}
              className="lottery-star-icon"
              animate={
                showWinner
                  ? {
                      rotate: i % 2 === 0 ? [0, -360] : [0, 360],
                      scale: [1, 1.4, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.9 + i * 0.15,
                repeat: showWinner ? Infinity : 0,
                delay: i * 0.25,
              }}
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Explosion particles */}
      <AnimatePresence>
        {showWinner && (
          <div className="lottery-particles">
            {particleData.map((p, i) => (
              <motion.div
                key={i}
                className="lottery-particle"
                style={{
                  background: p.color,
                  borderRadius: p.isRect ? "2px" : "50%",
                  width: p.w,
                  height: p.h,
                  left: "50%",
                  top: "45%",
                  position: "absolute",
                }}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.8, 0.8, 0],
                  opacity: [1, 1, 0.6, 0],
                  x: Math.cos(p.angle) * p.distance + p.dx,
                  y: Math.sin(p.angle) * p.distance + p.dy,
                  rotate: p.rotate,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Participant count badge */}
      {items.length >= 2 && (
        <motion.div
          className="lottery-count"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {items.length} participant{items.length > 1 ? "s" : ""}
        </motion.div>
      )}
    </div>
  );
}
