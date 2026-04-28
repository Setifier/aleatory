import { Fragment } from "react";
import type { BracketSlot } from "../../types/tournamentDraw";
import type { BracketLayout } from "../../lib/bracketEngine";
import {
  computeBracket,
  computeHeights,
  computeCumY,
  getConnectorGroups,
  getR1SlotRanges,
} from "../../lib/bracketEngine";

// ── Dimension presets ─────────────────────────────────────────────────────────

interface BracketDims {
  hUnit:    number;  // pixels allocated per participant slot
  slotH:    number;  // actual rendered slot height
  slotGap:  number;  // gap between slots in a match box
  matchPad: number;  // padding inside match box (top + bottom)
  colW:     number;  // round column width
  connW:    number;  // connector SVG width
  champW:   number;  // champion box width
  labelH:   number;  // round label height above bracket
}

const FULL_DIMS: BracketDims = {
  hUnit: 36, slotH: 26, slotGap: 2, matchPad: 5,
  colW: 96, connW: 18, champW: 68, labelH: 20,
};

const COMPACT_DIMS: BracketDims = {
  hUnit: 30, slotH: 22, slotGap: 2, matchPad: 4,
  colW: 80, connW: 14, champW: 56, labelH: 18,
};

/** Very small preset — used for in-app previews (ConfigPhase) */
const MINI_DIMS: BracketDims = {
  hUnit: 20, slotH: 14, slotGap: 1, matchPad: 3,
  colW: 58, connW: 9,  champW: 38, labelH: 13,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface BracketDisplayProps {
  slots: BracketSlot[];         // R1 participant assignments (length = participantCount)
  participantCount: number;     // actual number of participants
  matchSize?: number;           // ms = 2 | 3 | 4 (default 2)
  compact?: boolean;            // use smaller dimensions
  mini?: boolean;               // use very small dimensions (config preview)
  /** If true: show revealed state for DrawPhase live table */
  revealMode?: boolean;
  revealedSlots?: Set<number>;  // set of revealed slotIndex values
  currentSlotIndex?: number;    // currently animating slot
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build the set of 0-indexed slot array positions that are "bye" (auto-advance) */
function buildByeSet(layout: BracketLayout, r1Ranges: [number, number][]): Set<number> {
  const s = new Set<number>();
  layout.rounds[0].entries.forEach((entry, e) => {
    if (entry.kind === "bye") {
      for (let j = r1Ranges[e][0]; j < r1Ranges[e][1]; j++) s.add(j);
    }
  });
  return s;
}

// ── Main component ────────────────────────────────────────────────────────────

/** n > this threshold → split left/right with champion in the center */
const TWO_SIDED_THRESHOLD = 8;

export default function BracketDisplay({
  slots,
  participantCount,
  matchSize = 2,
  compact = false,
  mini = false,
  revealMode = false,
  revealedSlots,
  currentSlotIndex,
}: BracketDisplayProps) {
  const D  = mini ? MINI_DIMS : compact ? COMPACT_DIMS : FULL_DIMS;
  const n  = Math.max(2, participantCount);
  const ms = Math.max(2, matchSize);

  if (n > TWO_SIDED_THRESHOLD) {
    return (
      <TwoSidedBracket
        slots={slots} n={n} ms={ms} D={D}
        revealMode={revealMode} revealedSlots={revealedSlots}
        currentSlotIndex={currentSlotIndex}
      />
    );
  }

  return (
    <LinearBracket
      slots={slots} n={n} ms={ms} D={D}
      revealMode={revealMode} revealedSlots={revealedSlots}
      currentSlotIndex={currentSlotIndex}
    />
  );
}

// ── Shared inner props ────────────────────────────────────────────────────────

interface InnerBracketProps {
  slots: BracketSlot[];
  n: number;
  ms: number;
  D: BracketDims;
  revealMode?: boolean;
  revealedSlots?: Set<number>;
  currentSlotIndex?: number;
}

// ── Linear bracket (n ≤ TWO_SIDED_THRESHOLD) ─────────────────────────────────

function LinearBracket({
  slots, n, ms, D, revealMode, revealedSlots, currentSlotIndex,
}: InnerBracketProps) {
  const layout   = computeBracket(n, ms);
  const heights  = computeHeights(layout, D.hUnit);
  const cumY     = computeCumY(heights);
  const r1Ranges = getR1SlotRanges(layout);
  const totalH   = n * D.hUnit;

  return (
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      <div style={{ display: "flex", alignItems: "flex-start", width: "fit-content", margin: "0 auto", paddingBottom: 8 }}>

        <HalfBracket
          layout={layout} slots={slots} heights={heights} cumY={cumY}
          r1Ranges={r1Ranges} totalH={totalH} D={D}
          revealMode={revealMode} revealedSlots={revealedSlots}
          currentSlotIndex={currentSlotIndex}
        />

        {/* Connector: straight horizontal line from last round's output center */}
        <svg width={D.connW} height={D.labelH + totalH} style={{ flexShrink: 0, overflow: "visible" }}>
          <line
            x1={0}       y1={D.labelH + totalH / 2}
            x2={D.connW} y2={D.labelH + totalH / 2}
            stroke="rgba(255,215,0,0.55)" strokeWidth="1.5"
          />
        </svg>

        <ChampionBox totalH={totalH} D={D} />
      </div>
    </div>
  );
}

// ── Two-sided bracket (n > TWO_SIDED_THRESHOLD) ───────────────────────────────

function TwoSidedBracket({
  slots, n, ms, D, revealMode, revealedSlots, currentSlotIndex,
}: InnerBracketProps) {
  const n_L = Math.ceil(n / 2);
  const n_R = n - n_L;

  const layoutL   = computeBracket(n_L, ms);
  const layoutR   = computeBracket(n_R, ms);
  const heightsL  = computeHeights(layoutL, D.hUnit);
  const cumYL     = computeCumY(heightsL);
  const heightsR  = computeHeights(layoutR, D.hUnit);
  const cumYR     = computeCumY(heightsR);
  const r1RangesL = getR1SlotRanges(layoutL);
  const r1RangesR = getR1SlotRanges(layoutR);
  const byeSetL   = buildByeSet(layoutL, r1RangesL);
  const byeSetR   = buildByeSet(layoutR, r1RangesR);

  const totalHL = n_L * D.hUnit;
  const totalHR = n_R * D.hUnit;
  const totalH  = Math.max(totalHL, totalHR);

  // Split slots; preserve original slotIndex so revealMode works correctly
  const slotsL: BracketSlot[] = slots.slice(0, n_L).map((s, i) => ({
    ...s,
    isBye: byeSetL.has(i),
  }));
  const slotsR: BracketSlot[] = slots.slice(n_L).map((s, i) => ({
    ...s,
    isBye: byeSetR.has(i),
  }));

  // Y-center of the last-round output for each side, and for the champion
  const leftFinalY  = D.labelH + totalHL / 2;
  const rightFinalY = D.labelH + totalHR / 2;
  const champY      = D.labelH + totalH  / 2;
  const sideConnW   = D.connW * 2;  // wider connector between bracket and champion

  return (
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      <div style={{ display: "flex", alignItems: "flex-start", width: "fit-content", margin: "0 auto", paddingBottom: 8 }}>

        {/* ── Left half ── */}
        <HalfBracket
          layout={layoutL} slots={slotsL} heights={heightsL} cumY={cumYL}
          r1Ranges={r1RangesL} totalH={totalHL} D={D}
          revealMode={revealMode} revealedSlots={revealedSlots}
          currentSlotIndex={currentSlotIndex}
        />

        {/* Left → Champion connector */}
        <svg width={sideConnW} height={D.labelH + totalH} style={{ flexShrink: 0, overflow: "visible" }}>
          <line
            x1={0}         y1={leftFinalY}
            x2={sideConnW} y2={champY}
            stroke="rgba(255,215,0,0.5)" strokeWidth="1.5"
          />
        </svg>

        {/* ── Champion box ── */}
        <ChampionBox totalH={totalH} D={D} />

        {/* Champion → Right connector */}
        <svg width={sideConnW} height={D.labelH + totalH} style={{ flexShrink: 0, overflow: "visible" }}>
          <line
            x1={0}         y1={champY}
            x2={sideConnW} y2={rightFinalY}
            stroke="rgba(255,215,0,0.5)" strokeWidth="1.5"
          />
        </svg>

        {/* ── Right half (mirrored) ── */}
        <HalfBracket
          layout={layoutR} slots={slotsR} heights={heightsR} cumY={cumYR}
          r1Ranges={r1RangesR} totalH={totalHR} D={D}
          mirrored
          revealMode={revealMode} revealedSlots={revealedSlots}
          currentSlotIndex={currentSlotIndex}
        />

      </div>
    </div>
  );
}

// ── HalfBracket (used by both layouts) ───────────────────────────────────────

interface HalfBracketProps {
  layout: BracketLayout;
  slots: BracketSlot[];
  heights: number[][];
  cumY: number[][];
  r1Ranges: [number, number][];
  totalH: number;
  D: BracketDims;
  mirrored?: boolean;
  revealMode?: boolean;
  revealedSlots?: Set<number>;
  currentSlotIndex?: number;
}

function HalfBracket({
  layout, slots, heights, cumY, r1Ranges, totalH, D,
  mirrored = false,
  revealMode, revealedSlots, currentSlotIndex,
}: HalfBracketProps) {
  const numRounds = layout.rounds.length;

  const inner = (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {layout.rounds.map((round, r) => (
        <Fragment key={r}>

          {/* ── Round column ── */}
          <div style={{
            width: D.colW,
            height: D.labelH + totalH,
            position: "relative",
            flexShrink: 0,
          }}>
            {/* Round label — un-flip text when bracket is mirrored */}
            <div style={{
              height: D.labelH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.28)",
              whiteSpace: "nowrap",
              ...(mirrored ? { transform: "scaleX(-1)" } : {}),
            }}>
              {round.label}
            </div>

            {/* Match entries */}
            {round.entries.map((entry, e) => {
              const entryH = heights[r][e];
              const entryY = cumY[r][e];

              const entrySlots: (BracketSlot | null)[] =
                r === 0
                  ? Array.from({ length: entry.size }, (_, j) =>
                      slots[r1Ranges[e][0] + j] ?? null
                    )
                  : Array.from({ length: entry.size }, () => null);

              const boxH   = D.slotH * entry.size + D.slotGap * Math.max(0, entry.size - 1) + D.matchPad * 2;
              const topPad = Math.max(0, (entryH - boxH) / 2);
              const isByeEntry = entry.kind === "bye";
              const isPartial  = entry.kind === "partial";

              return (
                <div
                  key={e}
                  style={{
                    position: "absolute",
                    top: D.labelH + entryY,
                    left: 4, right: 4,
                    height: entryH,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    paddingTop: topPad,
                  }}
                >
                  <div style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    background: isByeEntry
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.04)",
                    border: isByeEntry
                      ? "1px dashed rgba(255,255,255,0.1)"
                      : isPartial
                      ? "1px solid rgba(255,215,0,0.15)"
                      : "1px solid rgba(255,255,255,0.09)",
                    padding: D.matchPad,
                    display: "flex",
                    flexDirection: "column",
                    gap: D.slotGap,
                  }}>
                    {entrySlots.map((slot, j) => (
                      <Fragment key={j}>
                        {j > 0 && (
                          <div style={{
                            height: 1,
                            background: "rgba(255,255,255,0.06)",
                            margin: "0 2px",
                          }} />
                        )}
                        <SlotBox
                          slot={slot}
                          isByeEntry={isByeEntry && j === 0}
                          r={r}
                          D={D}
                          revealMode={revealMode}
                          revealedSlots={revealedSlots}
                          currentSlotIndex={currentSlotIndex}
                          mirrored={mirrored}
                        />
                      </Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Connector SVG between rounds ── */}
          {r < numRounds - 1 && (
            <ConnectorSVG
              groups={getConnectorGroups(layout, r, heights, cumY)}
              totalH={totalH}
              labelH={D.labelH}
              connW={D.connW}
            />
          )}

        </Fragment>
      ))}
    </div>
  );

  // Mirror the whole half-bracket; text elements individually un-flip via `mirrored` prop
  if (mirrored) {
    return <div style={{ transform: "scaleX(-1)" }}>{inner}</div>;
  }
  return inner;
}

// ── Champion box ──────────────────────────────────────────────────────────────

function ChampionBox({ totalH, D }: { totalH: number; D: BracketDims }) {
  return (
    <div style={{
      width: D.champW,
      height: D.labelH + totalH,
      position: "relative",
      flexShrink: 0,
    }}>
      {/* Label — aligned with round labels row */}
      <div style={{
        height: D.labelH,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: "rgba(255,215,0,0.55)",
        whiteSpace: "nowrap",
      }}>
        Champion
      </div>

      {/* Slot-sized trophy box, vertically centered in the bracket area */}
      <div style={{
        position: "absolute",
        top: totalH / 2 - D.slotH / 2,
        left: 4,
        right: 4,
        height: D.slotH,
        borderRadius: 7,
        background: "rgba(255,215,0,0.1)",
        border: "1.5px solid rgba(255,215,0,0.42)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ fontSize: Math.round(D.slotH * 0.58), lineHeight: 1 }}>🏆</span>
      </div>
    </div>
  );
}

// ── Slot box ──────────────────────────────────────────────────────────────────

function SlotBox({
  slot,
  isByeEntry,
  r,
  D,
  revealMode,
  revealedSlots,
  currentSlotIndex,
  mirrored = false,
}: {
  slot: BracketSlot | null;
  isByeEntry: boolean;
  r: number;
  D: BracketDims;
  revealMode?: boolean;
  revealedSlots?: Set<number>;
  currentSlotIndex?: number;
  mirrored?: boolean;
}) {
  const isR1      = r === 0;
  const revealed  = revealMode && slot ? revealedSlots?.has(slot.slotIndex) : true;
  const isCurrent = revealMode && slot ? slot.slotIndex === currentSlotIndex : false;
  const name      = (isR1 && slot?.participant?.name) ?? null;

  // Un-flip text that was flipped by the parent scaleX(-1)
  const textFlip: React.CSSProperties = mirrored
    ? { transform: "scaleX(-1)", display: "block", minWidth: 0 }
    : {};

  // Auto-advance slot: real participant, no opponents
  if (isByeEntry && slot?.participant) {
    return (
      <div style={{
        height: D.slotH,
        borderRadius: 4,
        background: "rgba(255,215,0,0.08)",
        border: "1px solid rgba(255,215,0,0.2)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 5,
        paddingRight: 5,
        gap: 4,
        overflow: "hidden",
      }}>
        <span style={{
          fontSize: 9,
          color: "rgba(255,215,0,0.7)",
          flexShrink: 0,
          fontWeight: 700,
          ...(mirrored ? { transform: "scaleX(-1)", display: "inline-block" } : {}),
        }}>
          →
        </span>
        <span style={{
          flex: 1,
          fontSize: 10,
          fontWeight: 600,
          color: !revealMode || revealed ? "rgba(255,215,0,0.85)" : "rgba(255,255,255,0.14)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          ...textFlip,
        }}>
          {!revealMode || revealed ? (name ?? "?") : "···"}
        </span>
      </div>
    );
  }

  const bg = isR1 && name && (!revealMode || revealed)
    ? "rgba(97,97,216,0.12)"
    : "rgba(255,255,255,0.04)";

  const border = isR1 && name && (!revealMode || revealed)
    ? isCurrent
      ? "1px solid rgba(97,97,216,0.6)"
      : "1px solid rgba(97,97,216,0.28)"
    : "1px solid rgba(255,255,255,0.08)";

  return (
    <div style={{
      height: D.slotH,
      borderRadius: 4,
      background: bg,
      border,
      display: "flex",
      alignItems: "center",
      paddingLeft: 6,
      paddingRight: 4,
      overflow: "hidden",
      transition: "background 0.2s, border-color 0.2s",
    }}>
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: isR1 && name && (!revealMode || revealed)
          ? "rgba(255,255,255,0.88)"
          : "rgba(255,255,255,0.2)",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        ...textFlip,
      }}>
        {isR1
          ? !revealMode || revealed
            ? (name ?? "?")
            : "···"
          : "?"}
      </span>
    </div>
  );
}

// ── SVG connectors ────────────────────────────────────────────────────────────

function ConnectorSVG({
  groups,
  totalH,
  labelH,
  connW,
}: {
  groups: ReturnType<typeof getConnectorGroups>;
  totalH: number;
  labelH: number;
  connW: number;
}) {
  const gatherX = Math.round(connW * 0.6);
  const stroke  = "rgba(255,255,255,0.18)";
  const strokeW = "1";

  return (
    <svg
      width={connW}
      height={labelH + totalH}
      style={{ flexShrink: 0, overflow: "visible" }}
    >
      <g transform={`translate(0,${labelH})`}>
        {groups.map(({ inputCenters, outputCenter }, gi) => {
          if (inputCenters.length === 1) {
            const y = inputCenters[0];
            return (
              <line
                key={gi}
                x1={0} y1={y}
                x2={connW} y2={outputCenter}
                stroke={stroke} strokeWidth={strokeW}
              />
            );
          }

          const top    = inputCenters[0];
          const bottom = inputCenters[inputCenters.length - 1];

          return (
            <g key={gi}>
              {inputCenters.map((ic, j) => (
                <line key={j}
                  x1={0} y1={ic}
                  x2={gatherX} y2={ic}
                  stroke={stroke} strokeWidth={strokeW}
                />
              ))}
              <line
                x1={gatherX} y1={top}
                x2={gatherX} y2={bottom}
                stroke={stroke} strokeWidth={strokeW}
              />
              <line
                x1={gatherX} y1={outputCenter}
                x2={connW}   y2={outputCenter}
                stroke={stroke} strokeWidth={strokeW}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
