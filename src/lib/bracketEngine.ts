/**
 * bracketEngine.ts
 *
 * "Natural" bracket algorithm: given n participants and ms players per match,
 * compute the organic round structure — no power-of-ms padding, no wasted byes.
 *
 * For n=16, ms=3:
 *   R1:   [3,3,3,3,3, bye(1)]  → 6 advancing
 *   R2:   [3,3]                → 2 advancing
 *   Final: [partial(2)]        → 1 winner
 *
 * Definitions:
 *   full    – a complete match with exactly ms participants
 *   partial – a match with 2..ms-1 participants (always the last in a round)
 *   bye     – a single participant who auto-advances (always the last in a round)
 */

export type MatchKind = "full" | "partial" | "bye";

export interface MatchEntry {
  kind: MatchKind;
  /** Actual number of participants in this match */
  size: number;
}

export interface BracketRound {
  roundIdx: number;
  label: string;
  entries: MatchEntry[];
  /** Number of outputs advancing to the next round */
  outputCount: number;
}

export interface BracketLayout {
  rounds: BracketRound[];
  participantCount: number;
  matchSize: number;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compute the natural bracket round structure for n players, ms per match.
 */
export function computeBracket(n: number, ms: number): BracketLayout {
  const matchSize = Math.max(2, ms);
  const rounds: BracketRound[] = [];
  let current = n;
  let roundIdx = 0;
  // When the previous round had a bye, put THIS round's bye FIRST so the
  // previous bye-player feeds into a real match rather than another bye.
  let prevHadBye = false;

  // Count total rounds first (needed for labels)
  let totalRounds = 0;
  {
    let t = n;
    while (t > 1) {
      const f = Math.floor(t / matchSize);
      const r = t % matchSize;
      t = f + (r > 0 ? 1 : 0);
      totalRounds++;
    }
  }

  while (current > 1) {
    const full = Math.floor(current / matchSize);
    const rem  = current % matchSize;

    // bye-front: move the bye entry to the top so the previous round's bye-winner
    // feeds into a full match here instead of cascading into another bye.
    const byeFront = prevHadBye && rem === 1;

    const entries: MatchEntry[] = [];
    if (byeFront) entries.push({ kind: "bye", size: 1 });
    for (let i = 0; i < full; i++) entries.push({ kind: "full", size: matchSize });
    if (!byeFront) {
      if      (rem === 1) entries.push({ kind: "bye",     size: 1   });
      else if (rem  >  1) entries.push({ kind: "partial", size: rem });
    }
    // (when byeFront is true, rem === 1 and the bye is already pushed above)

    const outputCount = full + (rem > 0 ? 1 : 0);
    rounds.push({ roundIdx, label: getRoundLabel(roundIdx, totalRounds), entries, outputCount });
    prevHadBye = rem === 1;
    current = outputCount;
    roundIdx++;
  }

  return { rounds, participantCount: n, matchSize };
}

/**
 * For a given set of entries in round r+1 and the previous round's outputCount,
 * compute which input indices [start, end) each entry in r+1 reads from.
 */
export function getInputRanges(
  prevOutputCount: number,
  entries: MatchEntry[],
  matchSize: number
): [number, number][] {
  const ranges: [number, number][] = [];
  let idx = 0;
  for (const entry of entries) {
    let consumed: number;
    if (entry.kind === "full") {
      consumed = matchSize;
    } else if (entry.kind === "bye") {
      // bye always reads exactly 1 input — whether it is first or last
      consumed = 1;
    } else {
      // partial: always last in entries, takes all remaining inputs
      consumed = prevOutputCount - idx;
    }
    ranges.push([idx, idx + consumed]);
    idx += consumed;
  }
  return ranges;
}

/**
 * Compute the allocated pixel height for every entry in every round.
 *
 * Rule: each R1 entry gets `entry.size * hUnit` pixels.
 *       Each subsequent entry inherits the summed height of its inputs.
 *       This guarantees all round columns have the same total height = n * hUnit.
 *
 * Returns heights[roundIdx][entryIdx].
 */
export function computeHeights(layout: BracketLayout, hUnit: number): number[][] {
  const heights: number[][] = [];

  // R1: height proportional to actual participant count
  heights.push(layout.rounds[0].entries.map(e => e.size * hUnit));

  for (let r = 1; r < layout.rounds.length; r++) {
    const round    = layout.rounds[r];
    const prev     = layout.rounds[r - 1];
    const prevH    = heights[r - 1];
    const ranges   = getInputRanges(prev.outputCount, round.entries, layout.matchSize);
    heights.push(
      ranges.map(([start, end]) =>
        prevH.slice(start, end).reduce((sum, h) => sum + h, 0)
      )
    );
  }

  return heights;
}

/**
 * Compute cumulative Y-start positions for every entry in every round.
 * Returns cumY[roundIdx][entryIdx].
 */
export function computeCumY(heights: number[][]): number[][] {
  return heights.map(rh => {
    const cum: number[] = [];
    let y = 0;
    for (const h of rh) { cum.push(y); y += h; }
    return cum;
  });
}

/**
 * For the connector column between round r and round r+1,
 * return one descriptor per r+1 entry:
 *   inputCenters – Y centers of each r input feeding this r+1 entry
 *   outputCenter – Y center of the r+1 entry
 */
export function getConnectorGroups(
  layout: BracketLayout,
  roundIdx: number,
  heights: number[][],
  cumY: number[][]
) {
  const r  = roundIdx;
  const r1 = layout.rounds[r];
  const r2 = layout.rounds[r + 1];
  const ranges = getInputRanges(r1.outputCount, r2.entries, layout.matchSize);

  return ranges.map(([start, end], eIdx) => {
    const inputCenters = Array.from({ length: end - start }, (_, j) => {
      const i = start + j;
      return cumY[r][i] + heights[r][i] / 2;
    });
    const outputCenter = cumY[r + 1][eIdx] + heights[r + 1][eIdx] / 2;
    return { inputCenters, outputCenter };
  });
}

/**
 * Return [startSlot, endSlot) ranges for each R1 entry.
 * Participants slots[start..end-1] belong to entry e.
 */
export function getR1SlotRanges(layout: BracketLayout): [number, number][] {
  const ranges: [number, number][] = [];
  let start = 0;
  for (const entry of layout.rounds[0].entries) {
    ranges.push([start, start + entry.size]);
    start += entry.size;
  }
  return ranges;
}

// ── Legacy helper (used in ConfigPhase SVG previews) ─────────────────────────

export function nextPowerOf(n: number, base: number): number {
  let p = base;
  while (p < n) p *= base;
  return p;
}

// ── Internal ──────────────────────────────────────────────────────────────────

function getRoundLabel(roundIdx: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIdx;
  if (fromEnd === 0) return "Finale";
  if (fromEnd === 1) return "Demi-finales";
  if (fromEnd === 2) return "Quarts";
  if (fromEnd === 3) return "1/8";
  if (fromEnd === 4) return "1/16";
  return `Tour ${roundIdx + 1}`;
}
