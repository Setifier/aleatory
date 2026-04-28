import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FortuneWheelProps {
  items: Array<{ id: string; name: string }>;
  winner: string | null;
}

const SPIN_DURATION = 4000; // ms
const MIN_SPINS = 6;
const POINTER_DEG = 270; // top of wheel (SVG: 0°=right, clockwise)

const ITEM_COLORS = [
  "#7965e0", // brand primary (violet-blue)
  "#e8952a", // amber
  "#ff4080", // hot pink
  "#15b8a8", // teal
  "#e83838", // red
  "#38a8e8", // sky blue
  "#aa38d8", // dark purple
  "#38c860", // green
  "#e85518", // burnt orange
  "#c89040", // brand secondary (warm gold)
  "#e828b0", // magenta
  "#e8d838", // golden yellow
];

// Particle data stable across renders
const PARTICLES = Array.from({ length: 44 }, (_, i) => ({
  angle: (i / 44) * Math.PI * 2,
  dist: 110 + (i % 5) * 22,
  dx: (Math.random() - 0.5) * 70,
  dy: (Math.random() - 0.5) * 70,
  rot: Math.random() * 720 - 360,
  dur: 1.1 + Math.random() * 0.7,
  delay: Math.random() * 0.25,
  w: i % 4 === 0 ? 11 : 7,
  h: i % 4 === 0 ? 5 : 7,
  isRect: i % 4 === 0,
  color: ["#ffd700","#ff6b35","#6161d8","#a195f8","#44ff88","#ff4488"][i % 6],
}));

// ── Segment builder ───────────────────────────────────────────────────────────
function buildSegments(items: Array<{ id: string; name: string }>) {
  const N = items.length;
  if (N < 2) return [];

  // Try to reach 12 total slices (visual density)
  let repeats = 1;
  if (N <= 12 && 12 % N === 0) repeats = 12 / N;

  const total = N * repeats;
  const sliceDeg = 360 / total;

  return Array.from({ length: total }, (_, i) => {
    const itemIndex = i % N; // index dans le tableau original → couleur stable
    return {
      item: items[itemIndex],
      startDeg: i * sliceDeg,
      midDeg:   i * sliceDeg + sliceDeg / 2,
      endDeg:   (i + 1) * sliceDeg,
      sliceDeg,
      color: ITEM_COLORS[itemIndex % ITEM_COLORS.length],
      idx: i,
    };
  });
}

// ── SVG pie-wedge path ────────────────────────────────────────────────────────
function wedgePath(cx: number, cy: number, r: number, a1: number, a2: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const sx = cx + r * Math.cos(rad(a1));
  const sy = cy + r * Math.sin(rad(a1));
  const ex = cx + r * Math.cos(rad(a2));
  const ey = cy + r * Math.sin(rad(a2));
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FortuneWheel({ items, winner }: FortuneWheelProps) {
  const [wheelDeg, setWheelDeg]   = useState(0);
  const [spinning, setSpinning]   = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  const degRef        = useRef(0);          // accumulated rotation (persistent)
  const prevWinnerRef = useRef<string | null>(null);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const segments = useMemo(() => buildSegments(items), [items]);

  // ── Trigger spin when winner changes ───────────────────────────────────────
  useEffect(() => {
    if (!winner) {
      if (prevWinnerRef.current !== null) {
        prevWinnerRef.current = null;
        setShowWinner(false);
      }
      return;
    }
    // Same winner as last spin → don't re-spin (replay scenario)
    if (winner === prevWinnerRef.current) return;

    prevWinnerRef.current = winner;
    setShowWinner(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Pick a random segment for this winner
    const segs = segments.filter(s => s.item.name === winner);
    if (!segs.length) return;
    const seg = segs[Math.floor(Math.random() * segs.length)];

    // Compute target rotation:
    // After rotating by R degrees clockwise, a wheel-space angle θ
    // maps to screen angle θ + R. We want midDeg + R ≡ POINTER_DEG (mod 360).
    // → R = POINTER_DEG − midDeg + k×360, choosing k so R > current + MIN_SPINS×360
    let target = POINTER_DEG - seg.midDeg;
    while (target <= degRef.current + MIN_SPINS * 360) target += 360;
    degRef.current = target;

    setSpinning(true);
    setWheelDeg(target);

    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setShowWinner(true);
    }, SPIN_DURATION);
  }, [winner, segments]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // ── SVG geometry constants ─────────────────────────────────────────────────
  const S = 320;
  const cx = S / 2, cy = S / 2;
  const R  = S / 2 - 8;
  const HUB = 28;
  const TR  = R * 0.64; // text radius

  if (items.length < 2) return null;

  return (
    <div className="relative flex flex-col items-center select-none touch-none">

      {/* ── Fixed pointer (triangle at 12 o'clock) ── */}
      <div
        className="absolute z-20"
        style={{ top: 2, left: "50%", transform: "translateX(-50%)" }}
      >
        <svg width="30" height="32" viewBox="0 0 30 32">
          <polygon
            points="15,29 1,3 29,3"
            fill="#ffd700"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,215,0,0.9))" }}
          />
        </svg>
      </div>

      {/* ── Rotating wheel ── */}
      <div
        style={{
          width:      S,
          height:     S,
          maxWidth:   "min(320px, 88vw)",
          maxHeight:  "min(320px, 88vw)",
          transform:  `rotate(${wheelDeg}deg)`,
          transition: spinning
            ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17,0.67,0.12,0.99)`
            : "none",
          willChange: "transform",
        }}
      >
        <svg
          viewBox={`0 0 ${S} ${S}`}
          width="100%"
          height="100%"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <filter id="fw-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Gloss overlay */}
            <radialGradient id="fw-gloss" cx="38%" cy="32%" r="60%">
              <stop offset="0%"   stopColor="white" stopOpacity="0.18" />
              <stop offset="100%" stopColor="black" stopOpacity="0.12" />
            </radialGradient>
          </defs>

          {/* ── Segments ── */}
          {segments.map((seg) => {
            const rad = (d: number) => (d * Math.PI) / 180;
            const tx = cx + TR * Math.cos(rad(seg.midDeg));
            const ty = cy + TR * Math.sin(rad(seg.midDeg));

            // Keep text readable (flip left-half segments)
            let tAngle = seg.midDeg;
            if (tAngle > 90 && tAngle <= 270) tAngle += 180;

            const maxCh =
              seg.sliceDeg >= 60 ? 11 :
              seg.sliceDeg >= 40 ? 8  :
              seg.sliceDeg >= 25 ? 6  : 4;
            const label = seg.item.name.length > maxCh
              ? seg.item.name.slice(0, maxCh - 1) + "…"
              : seg.item.name;
            const fSize =
              seg.sliceDeg >= 60 ? 14 :
              seg.sliceDeg >= 30 ? 12 : 10;

            const isWin = showWinner && seg.item.name === winner;

            return (
              <g key={seg.idx}>
                <path
                  d={wedgePath(cx, cy, R, seg.startDeg, seg.endDeg)}
                  fill={isWin ? "#ffd700" : seg.color}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="1.5"
                  filter={isWin ? "url(#fw-glow)" : undefined}
                />
                <g transform={`translate(${tx},${ty}) rotate(${tAngle})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={fSize}
                    fontWeight="bold"
                    fill={isWin ? "#1a1100" : "white"}
                    stroke={isWin ? "rgba(255,200,0,0.4)" : "rgba(0,0,0,0.75)"}
                    strokeWidth="3"
                    paintOrder="stroke"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Gloss overlay (non-rotating feel) */}
          <circle cx={cx} cy={cy} r={R} fill="url(#fw-gloss)" style={{ pointerEvents: "none" }} />

          {/* Outer border */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={HUB}     fill="#0a0a2e" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r={HUB - 7}  fill="#6161d8" />
          <circle cx={cx} cy={cy} r={9}        fill="rgba(255,255,255,0.25)" />
        </svg>
      </div>

      {/* ── Confetti on win ── */}
      <AnimatePresence>
        {showWinner && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
            {PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  width: p.w, height: p.h,
                  borderRadius: p.isRect ? "2px" : "50%",
                  background: p.color,
                  left: "50%", top: "50%",
                }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [1, 1, 0],
                  x: Math.cos(p.angle) * p.dist + p.dx,
                  y: Math.sin(p.angle) * p.dist + p.dy,
                  scale: [0, 1.6, 0],
                  rotate: p.rot,
                }}
                transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
