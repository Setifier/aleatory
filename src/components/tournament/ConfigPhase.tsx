import { motion } from "framer-motion";
import type { TournamentMode, GroupsConfig, Participant, DrawPot, BracketMatchSize, BracketSlot } from "../../types/tournamentDraw";
import type { GroupNamingFormat } from "../../types/groupsDraw";
import { computeBracket, getR1SlotRanges } from "../../lib/bracketEngine";
import BracketDisplay from "./BracketDisplay";

interface ConfigPhaseProps {
  mode: TournamentMode;
  participants: Participant[];
  pots: DrawPot[];
  groupsConfig: GroupsConfig;
  bracketMatchSize: BracketMatchSize;
  error: string | null;
  onUpdateGroupsConfig: (updates: Partial<GroupsConfig>) => void;
  onSetBracketMatchSize: (size: BracketMatchSize) => void;
  onMoveParticipantToPot: (participantId: string, potIndex: number) => void;
  onAddPot: () => void;
  onRemovePot: (potIndex: number) => void;
}

const NAMING_FORMATS: { id: GroupNamingFormat; label: string; example: string }[] = [
  { id: "A-Z", label: "Lettres", example: "Groupe A, B, C…" },
  { id: "1-30", label: "Chiffres", example: "Groupe 1, 2, 3…" },
  { id: "custom", label: "Personnalisé", example: "Noms libres" },
];

// ── Mini SVG bracket diagrams ─────────────────────────────────────────────────

/** 1v1 SE: 4 players → 2 semis → champion */
function SVGBracket1v1({ active }: { active: boolean }) {
  const s = active ? "rgba(161,149,248," : "rgba(255,255,255,";
  const fill = s + (active ? "0.8)" : "0.28)");
  const conn = s + "0.35)";
  const gold = "rgba(255,215,0,0.6)";
  return (
    <svg viewBox="0 0 62 46" width="62" height="46" overflow="visible">
      {/* R1 pair 1 */}
      <rect x="0" y="0"  width="18" height="6" rx="1.5" fill={fill} />
      <rect x="0" y="10" width="18" height="6" rx="1.5" fill={fill} />
      <line x1="18" y1="3"  x2="22" y2="3"  stroke={conn} strokeWidth="1" />
      <line x1="18" y1="13" x2="22" y2="13" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="3"  x2="22" y2="13" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="8"  x2="26" y2="8"  stroke={conn} strokeWidth="1" />
      {/* R1 pair 2 */}
      <rect x="0" y="30" width="18" height="6" rx="1.5" fill={fill} />
      <rect x="0" y="40" width="18" height="6" rx="1.5" fill={fill} />
      <line x1="18" y1="33" x2="22" y2="33" stroke={conn} strokeWidth="1" />
      <line x1="18" y1="43" x2="22" y2="43" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="33" x2="22" y2="43" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="38" x2="26" y2="38" stroke={conn} strokeWidth="1" />
      {/* R2 semis */}
      <rect x="26" y="5"  width="16" height="6" rx="1.5" fill={fill} fillOpacity="0.55" />
      <rect x="26" y="35" width="16" height="6" rx="1.5" fill={fill} fillOpacity="0.55" />
      <line x1="42" y1="8"  x2="46" y2="8"  stroke={conn} strokeWidth="1" />
      <line x1="42" y1="38" x2="46" y2="38" stroke={conn} strokeWidth="1" />
      <line x1="46" y1="8"  x2="46" y2="38" stroke={conn} strokeWidth="1" />
      <line x1="46" y1="23" x2="50" y2="23" stroke={conn} strokeWidth="1" />
      {/* Champion */}
      <circle cx="55" cy="23" r="5" fill={gold} />
      <text x="55" y="26.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="rgba(255,215,0,0.95)">1</text>
    </svg>
  );
}

/** 3-way: 3 players → champion */
function SVGBracket3way({ active }: { active: boolean }) {
  const s = active ? "rgba(161,149,248," : "rgba(255,255,255,";
  const fill = s + (active ? "0.8)" : "0.28)");
  const conn = s + "0.35)";
  const gold = "rgba(255,215,0,0.6)";
  return (
    <svg viewBox="0 0 54 26" width="54" height="26" overflow="visible">
      <rect x="0" y="0"  width="18" height="6" rx="1.5" fill={fill} />
      <rect x="0" y="10" width="18" height="6" rx="1.5" fill={fill} />
      <rect x="0" y="20" width="18" height="6" rx="1.5" fill={fill} />
      <line x1="18" y1="3"  x2="22" y2="3"  stroke={conn} strokeWidth="1" />
      <line x1="18" y1="13" x2="22" y2="13" stroke={conn} strokeWidth="1" />
      <line x1="18" y1="23" x2="22" y2="23" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="3"  x2="22" y2="23" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="13" x2="26" y2="13" stroke={conn} strokeWidth="1" />
      <rect x="26" y="10" width="16" height="6" rx="1.5" fill={fill} fillOpacity="0.55" />
      <line x1="42" y1="13" x2="46" y2="13" stroke={conn} strokeWidth="1" />
      <circle cx="50" cy="13" r="4.5" fill={gold} />
      <text x="50" y="16" textAnchor="middle" fontSize="6" fontWeight="900" fill="rgba(255,215,0,0.95)">1</text>
    </svg>
  );
}

/** 4-way: 4 players → champion */
function SVGBracket4way({ active }: { active: boolean }) {
  const s = active ? "rgba(161,149,248," : "rgba(255,255,255,";
  const fill = s + (active ? "0.8)" : "0.28)");
  const conn = s + "0.35)";
  const gold = "rgba(255,215,0,0.6)";
  return (
    <svg viewBox="0 0 54 36" width="54" height="36" overflow="visible">
      <rect x="0" y="0"  width="18" height="6" rx="1.5" fill={fill} />
      <rect x="0" y="10" width="18" height="6" rx="1.5" fill={fill} />
      <rect x="0" y="20" width="18" height="6" rx="1.5" fill={fill} />
      <rect x="0" y="30" width="18" height="6" rx="1.5" fill={fill} />
      <line x1="18" y1="3"  x2="22" y2="3"  stroke={conn} strokeWidth="1" />
      <line x1="18" y1="13" x2="22" y2="13" stroke={conn} strokeWidth="1" />
      <line x1="18" y1="23" x2="22" y2="23" stroke={conn} strokeWidth="1" />
      <line x1="18" y1="33" x2="22" y2="33" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="3"  x2="22" y2="33" stroke={conn} strokeWidth="1" />
      <line x1="22" y1="18" x2="26" y2="18" stroke={conn} strokeWidth="1" />
      <rect x="26" y="15" width="16" height="6" rx="1.5" fill={fill} fillOpacity="0.55" />
      <line x1="42" y1="18" x2="46" y2="18" stroke={conn} strokeWidth="1" />
      <circle cx="50" cy="18" r="4.5" fill={gold} />
      <text x="50" y="21" textAnchor="middle" fontSize="6" fontWeight="900" fill="rgba(255,215,0,0.95)">1</text>
    </svg>
  );
}

/** Double Élim (coming soon) */
function SVGBracketDE() {
  const fill = "rgba(255,255,255,0.18)";
  const conn = "rgba(255,255,255,0.12)";
  const gold = "rgba(255,215,0,0.25)";
  return (
    <svg viewBox="0 0 62 48" width="62" height="48">
      {/* W bracket */}
      <text x="1" y="6" fontSize="5" fontWeight="700" fill="rgba(255,255,255,0.3)">W</text>
      <rect x="7" y="0"  width="14" height="5" rx="1" fill={fill} />
      <rect x="7" y="8"  width="14" height="5" rx="1" fill={fill} />
      <line x1="21" y1="2.5" x2="24" y2="2.5" stroke={conn} strokeWidth="1" />
      <line x1="21" y1="10.5" x2="24" y2="10.5" stroke={conn} strokeWidth="1" />
      <line x1="24" y1="2.5" x2="24" y2="10.5" stroke={conn} strokeWidth="1" />
      <line x1="24" y1="6.5" x2="27" y2="6.5" stroke={conn} strokeWidth="1" />
      <rect x="27" y="4" width="14" height="5" rx="1" fill={fill} />
      {/* separator */}
      <line x1="0" y1="20" x2="62" y2="20" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 2" />
      {/* L bracket */}
      <text x="1" y="32" fontSize="5" fontWeight="700" fill="rgba(255,255,255,0.2)">L</text>
      <rect x="7" y="26" width="14" height="5" rx="1" fill={fill} fillOpacity="0.6" />
      <rect x="7" y="34" width="14" height="5" rx="1" fill={fill} fillOpacity="0.6" />
      <line x1="21" y1="28.5" x2="24" y2="28.5" stroke={conn} strokeWidth="1" />
      <line x1="21" y1="36.5" x2="24" y2="36.5" stroke={conn} strokeWidth="1" />
      <line x1="24" y1="28.5" x2="24" y2="36.5" stroke={conn} strokeWidth="1" />
      <line x1="24" y1="32.5" x2="27" y2="32.5" stroke={conn} strokeWidth="1" />
      <rect x="27" y="30" width="14" height="5" rx="1" fill={fill} fillOpacity="0.6" />
      {/* Grand Final */}
      <line x1="41" y1="6.5"  x2="47" y2="6.5"  stroke={conn} strokeWidth="1" />
      <line x1="41" y1="32.5" x2="47" y2="32.5" stroke={conn} strokeWidth="1" />
      <line x1="47" y1="6.5"  x2="47" y2="32.5" stroke={conn} strokeWidth="1" />
      <line x1="47" y1="19.5" x2="51" y2="19.5" stroke={conn} strokeWidth="1" />
      <circle cx="56" cy="19.5" r="4.5" fill={gold} />
      <text x="56" y="22.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="rgba(255,215,0,0.6)">1</text>
    </svg>
  );
}

/** Round Robin (coming soon) */
function SVGRoundRobin() {
  const node = "rgba(255,255,255,0.2)";
  const line = "rgba(255,255,255,0.1)";
  const pts = [
    [10, 8], [34, 8], [42, 28], [22, 42], [2, 28],
  ];
  const edges: [number, number][] = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++)
      edges.push([i, j]);
  return (
    <svg viewBox="0 0 44 50" width="44" height="50">
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
          stroke={line} strokeWidth="1"
        />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={node} />
      ))}
    </svg>
  );
}

const ACTIVE_FORMATS: { size: BracketMatchSize; label: string; Diagram: React.FC<{ active: boolean }> }[] = [
  { size: 2, label: "Élim. 1v1",    Diagram: SVGBracket1v1  },
  { size: 3, label: "Triple",       Diagram: SVGBracket3way },
  { size: 4, label: "Quadruple",    Diagram: SVGBracket4way },
];

export default function ConfigPhase({
  mode,
  participants,
  pots,
  groupsConfig,
  bracketMatchSize,
  error,
  onUpdateGroupsConfig,
  onSetBracketMatchSize,
  onMoveParticipantToPot,
  onAddPot,
  onRemovePot,
}: ConfigPhaseProps) {
  const isGroupMode = mode === "groups" || mode === "both";
  const perGroup = Math.ceil(participants.length / groupsConfig.numberOfGroups);

  // Bracket mode: visual format selector
  if (mode === "bracket") {
    const n = participants.length;

    // Natural bracket layout for the selected match size
    const layout     = computeBracket(n, bracketMatchSize);
    const numRounds  = layout.rounds.length;
    const r1Entries  = layout.rounds[0].entries;
    const autoCount  = r1Entries.filter((e) => e.kind === "bye").length;
    const partialCount = r1Entries.filter((e) => e.kind === "partial").length;

    // Build preview slots (empty structure — shows "?" in each box)
    const r1Ranges = getR1SlotRanges(layout);
    const previewSlots: BracketSlot[] = Array.from({ length: n }, (_, i) => {
      let isBye = false;
      r1Entries.forEach((entry, e) => {
        if (entry.kind === "bye") {
          const [start, end] = r1Ranges[e];
          if (i >= start && i < end) isBye = true;
        }
      });
      return { slotIndex: i + 1, participant: null, isBye };
    });

    return (
      <div className="px-6 pt-5 pb-4 space-y-5">
        <div className="text-center">
          <h3 className="text-xl font-black text-white uppercase tracking-wide">
            Configuration bracket
          </h3>
          <p className="text-white/40 text-sm mt-1">{n} participant{n > 1 ? "s" : ""}</p>
        </div>

        {/* Active format selector */}
        <div className="space-y-2">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            Format des matchs
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACTIVE_FORMATS.map(({ size: ms, label, Diagram }) => {
              const cl      = computeBracket(n, ms);
              const rounds  = cl.rounds.length;
              const auto    = cl.rounds[0].entries.filter((e) => e.kind === "bye").length;
              const partial = cl.rounds[0].entries.filter((e) => e.kind === "partial").length;
              const selected = bracketMatchSize === ms;

              let sub = `${rounds} tour${rounds > 1 ? "s" : ""}`;
              if (auto > 0)         sub += ` · ${auto} auto`;
              else if (partial > 0) sub += ` · 1 partiel`;

              return (
                <button
                  key={ms}
                  onClick={() => onSetBracketMatchSize(ms)}
                  className="flex flex-col items-center gap-2.5 py-3.5 px-2 rounded-2xl transition-all"
                  style={
                    selected
                      ? { background: "rgba(97,97,216,0.2)", border: "1.5px solid rgba(97,97,216,0.55)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  <Diagram active={selected} />
                  <div className="text-center">
                    <p
                      className="text-xs font-black leading-tight"
                      style={{ color: selected ? "#a195f8" : "rgba(255,255,255,0.55)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[10px] mt-0.5 leading-tight"
                      style={{ color: selected ? "rgba(161,149,248,0.6)" : "rgba(255,255,255,0.28)" }}
                    >
                      {sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live bracket preview */}
        <div className="space-y-2">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            Aperçu du bracket
          </label>
          <div
            className="rounded-2xl p-3"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <BracketDisplay
              slots={previewSlots}
              participantCount={n}
              matchSize={bracketMatchSize}
              mini
            />
          </div>
        </div>

        {/* Coming-soon formats */}
        <div className="space-y-2">
          <label className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            Bientôt disponible
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div
              className="flex flex-col items-center gap-2.5 py-3.5 px-2 rounded-2xl cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div style={{ opacity: 0.35 }}>
                <SVGBracketDE />
              </div>
              <div className="text-center">
                <p className="text-xs font-black leading-tight text-white/30">Double Élim.</p>
                <p className="text-[10px] mt-0.5 text-white/18">Bientôt</p>
              </div>
            </div>
            <div
              className="flex flex-col items-center gap-2.5 py-3.5 px-2 rounded-2xl cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div style={{ opacity: 0.35 }}>
                <SVGRoundRobin />
              </div>
              <div className="text-center">
                <p className="text-xs font-black leading-tight text-white/30">Round Robin</p>
                <p className="text-[10px] mt-0.5 text-white/18">Bientôt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <InfoRow label="Participants" value={`${n}`} />
          <InfoRow label="Nombre de tours" value={`${numRounds}`} />
          <InfoRow label="Par match" value={`${bracketMatchSize}`} />
          {autoCount > 0 && (
            <InfoRow
              label="Auto-avance"
              value={`${autoCount} slot${autoCount > 1 ? "s" : ""}`}
              sub="(qualifié·e direct·e)"
            />
          )}
          {partialCount > 0 && (
            <InfoRow
              label="Match réduit"
              value={`${partialCount}`}
              sub={`(< ${bracketMatchSize} joueurs)`}
            />
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>
    );
  }

  // Groups / Both mode
  const maxGroups = groupsConfig.namingFormat === "A-Z" ? 26 : 30;

  return (
    <div className="px-6 pt-5 pb-4 space-y-5">
      <div className="text-center">
        <h3 className="text-xl font-black text-white uppercase tracking-wide">
          Configuration des groupes
        </h3>
        <p className="text-white/40 text-sm mt-1">
          {participants.length} participants · ~{perGroup} par groupe
        </p>
      </div>

      {/* Number of groups */}
      <div className="space-y-2">
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Nombre de groupes
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpdateGroupsConfig({ numberOfGroups: Math.max(2, groupsConfig.numberOfGroups - 1) })}
            className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 text-white font-bold transition-all text-lg flex-shrink-0"
          >
            −
          </button>
          <div
            className="flex-1 text-center py-2.5 rounded-xl font-black text-white text-xl"
            style={{ background: "rgba(97,97,216,0.15)", border: "1px solid rgba(97,97,216,0.3)" }}
          >
            {groupsConfig.numberOfGroups}
          </div>
          <button
            onClick={() =>
              onUpdateGroupsConfig({
                numberOfGroups: Math.min(
                  maxGroups,
                  Math.min(participants.length, groupsConfig.numberOfGroups + 1)
                ),
              })
            }
            className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 text-white font-bold transition-all text-lg flex-shrink-0"
          >
            +
          </button>
        </div>
        <p className="text-white/30 text-xs text-center">
          ~{perGroup} participant{perGroup > 1 ? "s" : ""} par groupe
        </p>
      </div>

      {/* Naming format */}
      <div className="space-y-2">
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Format de nommage
        </label>
        <div className="flex gap-2">
          {NAMING_FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() =>
                onUpdateGroupsConfig({
                  namingFormat: f.id,
                  customNames:
                    f.id === "custom"
                      ? Array.from({ length: groupsConfig.numberOfGroups }, (_, i) => `Groupe ${i + 1}`)
                      : groupsConfig.customNames,
                })
              }
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={
                groupsConfig.namingFormat === f.id
                  ? { background: "rgba(97,97,216,0.25)", border: "1px solid rgba(97,97,216,0.5)", color: "#a195f8" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
              }
            >
              <span className="block font-bold">{f.label}</span>
              <span className="block text-xs opacity-60">{f.example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom names */}
      {groupsConfig.namingFormat === "custom" && (
        <div className="space-y-2">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            Noms personnalisés
          </label>
          <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto">
            {Array.from({ length: groupsConfig.numberOfGroups }, (_, i) => (
              <input
                key={i}
                type="text"
                value={groupsConfig.customNames[i] ?? ""}
                onChange={(e) => {
                  const names = [...groupsConfig.customNames];
                  names[i] = e.target.value;
                  onUpdateGroupsConfig({ customNames: names });
                }}
                placeholder={`Groupe ${i + 1}`}
                className="px-3 py-2 rounded-xl text-sm bg-black/40 border border-white/12 text-white placeholder-white/25 focus:border-primary-400 focus:outline-none transition-colors"
              />
            ))}
          </div>
        </div>
      )}

      {/* Pots toggle */}
      {isGroupMode && (
        <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <p className="text-white font-semibold text-sm">Tirage par chapeaux</p>
            <p className="text-white/35 text-xs">Un participant de chaque chapeau par groupe</p>
          </div>
          <button
            onClick={() => onUpdateGroupsConfig({ usePots: !groupsConfig.usePots })}
            className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
            style={{
              background: groupsConfig.usePots
                ? "rgba(97,97,216,0.8)"
                : "rgba(255,255,255,0.12)",
            }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: groupsConfig.usePots ? "calc(100% - 20px)" : "4px" }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
          </button>
        </div>
      )}

      {/* Pots assignment */}
      {groupsConfig.usePots && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Assignation aux chapeaux
            </label>
            <div className="flex gap-2">
              <button
                onClick={onAddPot}
                disabled={pots.length >= 8}
                className="text-xs text-primary-400 hover:text-primary-300 disabled:opacity-30 transition-colors"
              >
                + Chapeau
              </button>
              <button
                onClick={() => onRemovePot(pots.length - 1)}
                disabled={pots.length <= 2}
                className="text-xs text-white/30 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                − Chapeau
              </button>
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-1.5">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="flex-1 text-white/80 text-sm truncate">{p.name}</span>
                <select
                  value={p.potIndex ?? ""}
                  onChange={(e) => onMoveParticipantToPot(p.id, Number(e.target.value))}
                  className="bg-black/50 border border-white/15 text-white/70 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-primary-400"
                >
                  <option value="">— Chapeau —</option>
                  {pots.map((pot) => (
                    <option key={pot.index} value={pot.index}>
                      {pot.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {pots.map((pot) => (
              <span
                key={pot.index}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
              >
                {pot.name}: {pot.participants.length}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  );
}

function InfoRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white font-bold text-sm">
        {value}
        {sub && <span className="text-white/35 font-normal ml-1 text-xs">{sub}</span>}
      </span>
    </div>
  );
}
