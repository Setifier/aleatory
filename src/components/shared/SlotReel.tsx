import { useRef } from "react";
import { motion } from "framer-motion";

export const REEL_ITEM_H = 54;

/** Build a random reel that ends on `target` (target = second-to-last item). */
function buildReel(pool: string[], target: string): string[] {
  if (pool.length < 2) return [pool[0] ?? target, target, pool[0] ?? target];
  const rand = () => pool[Math.floor(Math.random() * pool.length)];
  const reel: string[] = [rand()]; // leading pad
  for (let i = 0; i < 34; i++) reel.push(rand());
  reel.push(target);  // target = reel[length - 2]
  reel.push(rand());  // trailing pad
  return reel;
}

export interface SlotReelProps {
  /** All participant names — used to populate the random portion of the reel. */
  pool: string[];
  /** The name that will be centered when the animation completes. */
  target: string;
  /** Animation duration in seconds. */
  spinDurationS: number;
  /** Cubic-bezier easing — fast start, visible deceleration at the end. */
  easing: [number, number, number, number];
  /** Switches to "result" styling (colors, glow) when true. */
  highlighted: boolean;
  /** Colour used for top / bottom gradient fades (should match the container bg). */
  bgColor?: string;
  /** Frame line colour while highlighted. Default: gold. */
  resultLineColor?: string;
  /** Frame line colour while spinning. Default: purple. */
  spinLineColor?: string;
  /** Center-slot background while highlighted. Default: gold tint. */
  resultCenterBg?: string;
  /** Center-slot background while spinning. Default: purple tint. */
  spinCenterBg?: string;
  /** Target item text colour while highlighted. Default: warm gold. */
  resultTextColor?: string;
  onSpinComplete?: () => void;
}

/**
 * SlotReel — smooth single-tape slot animation shared by lottery and tournament.
 *
 * Mount this component with a unique `key` for each draw so the reel is
 * rebuilt and the animation restarts cleanly.
 */
export default function SlotReel({
  pool,
  target,
  spinDurationS,
  easing,
  highlighted,
  bgColor = "rgba(6,6,28,0.85)",
  resultLineColor = "rgba(255,215,0,0.45)",
  spinLineColor = "rgba(97,97,216,0.5)",
  resultCenterBg = "rgba(255,215,0,0.07)",
  spinCenterBg = "rgba(97,97,216,0.08)",
  resultTextColor = "#fde68a",
  onSpinComplete,
}: SlotReelProps) {
  // Built once on mount — key the parent per draw to get a fresh reel each time.
  const reelRef = useRef<string[]>([]);
  if (reelRef.current.length === 0) {
    reelRef.current = buildReel(pool, target);
  }
  const reel = reelRef.current;
  const targetIdx = reel.length - 2;

  // y-offset that centers item at `idx` inside the 3-cell window
  const initialY = REEL_ITEM_H;                           // center reel[0]
  const finalY   = REEL_ITEM_H - targetIdx * REEL_ITEM_H; // center target

  const lineColor  = highlighted ? resultLineColor : spinLineColor;
  const centerBg   = highlighted ? resultCenterBg  : spinCenterBg;

  return (
    <div className="relative overflow-hidden" style={{ height: REEL_ITEM_H * 3 }}>

      {/* Center-slot highlight */}
      <div
        style={{
          position: "absolute",
          top: REEL_ITEM_H, height: REEL_ITEM_H,
          left: 0, right: 0,
          background: centerBg,
          transition: "background 0.4s",
          zIndex: 1,
        }}
      />

      {/* ── Scrolling tape ── */}
      <motion.div
        initial={{ y: initialY }}
        animate={{ y: finalY }}
        transition={{ duration: spinDurationS, ease: easing }}
        onAnimationComplete={onSpinComplete}
        style={{ position: "relative", zIndex: 2 }}
      >
        {reel.map((name, i) => {
          const isTarget = i === targetIdx;
          return (
            <div
              key={i}
              className="flex items-center justify-center px-5"
              style={{ height: REEL_ITEM_H }}
            >
              <span
                className="text-center font-extrabold leading-tight"
                style={{
                  fontSize: isTarget ? (highlighted ? "1.5rem" : "1.25rem") : "0.875rem",
                  color: isTarget && highlighted
                    ? resultTextColor
                    : isTarget
                    ? "rgba(255,255,255,1)"
                    : "rgba(255,255,255,0.25)",
                  transition: "color 0.3s, font-size 0.3s",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                }}
              >
                {name}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Top gradient fade */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: REEL_ITEM_H,
          background: `linear-gradient(to bottom, ${bgColor}, transparent)`,
          pointerEvents: "none", zIndex: 3,
        }}
      />
      {/* Bottom gradient fade */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: REEL_ITEM_H,
          background: `linear-gradient(to top, ${bgColor}, transparent)`,
          pointerEvents: "none", zIndex: 3,
        }}
      />

      {/* Center frame — top line */}
      <div
        style={{
          position: "absolute", top: REEL_ITEM_H,
          left: 12, right: 12, height: 1,
          background: lineColor, transition: "background 0.35s",
          pointerEvents: "none", zIndex: 4,
        }}
      />
      {/* Center frame — bottom line */}
      <div
        style={{
          position: "absolute", top: REEL_ITEM_H * 2 - 1,
          left: 12, right: 12, height: 1,
          background: lineColor, transition: "background 0.35s",
          pointerEvents: "none", zIndex: 4,
        }}
      />
    </div>
  );
}
