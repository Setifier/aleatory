import { motion } from "framer-motion";
import type { Group } from "../../types/groupsDraw";
import type { BracketSlot, TournamentMode } from "../../types/tournamentDraw";
import BracketDisplay from "./BracketDisplay";

interface ResultsPhaseProps {
  mode: TournamentMode;
  title: string;
  groups: Group[];
  bracketSlots: BracketSlot[];
  bracketSize: number;
  bracketMatchSize?: number;
  totalParticipants: number;
  onClose: () => void;
}

export default function ResultsPhase({
  mode,
  title,
  groups,
  bracketSlots,
  bracketSize,
  bracketMatchSize = 2,
  totalParticipants,
  onClose,
}: ResultsPhaseProps) {
  const isGroups = mode === "groups" || mode === "both";
  const isBracket = mode === "bracket";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            {title || "Résultats du tirage"}
          </h2>
          <p className="text-white/40 text-xs mt-0.5">
            {totalParticipants} participants
            {isGroups && groups.length > 0 && ` · ${groups.length} groupes`}
            {isBracket && bracketSize > 0 && ` · Bracket de ${bracketSize}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 text-white/50 hover:text-white transition-all"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Groups view */}
        {isGroups && groups.length > 0 && (
          <section>
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              }}
            >
              {groups.map((group, gi) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.04 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  {/* Group header */}
                  <div
                    className="px-4 py-2.5"
                    style={{
                      background: "rgba(97,97,216,0.15)",
                      borderBottom: "1px solid rgba(97,97,216,0.2)",
                    }}
                  >
                    <p className="font-black text-primary-300 text-sm uppercase tracking-wide">
                      {group.name}
                    </p>
                    <p className="text-white/30 text-xs">
                      {group.participants.length} participant
                      {group.participants.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Participants */}
                  <div className="px-3 py-2 space-y-1">
                    {group.participants.map((p, pi) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 py-1"
                      >
                        <span
                          className="w-4 text-xs font-bold flex-shrink-0 text-center"
                          style={{ color: "rgba(161,149,248,0.6)" }}
                        >
                          {pi + 1}
                        </span>
                        <span className="text-white/85 text-sm font-medium truncate">
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Bracket view */}
        {isBracket && bracketSlots.length > 0 && (
          <section>
            <BracketDisplay
              slots={bracketSlots}
              participantCount={totalParticipants}
              matchSize={bracketMatchSize}
              compact
            />
          </section>
        )}

      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 flex gap-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-white/15 text-white/65 hover:text-white hover:bg-white/8 transition-all font-semibold text-sm"
        >
          Fermer
        </button>
        <button
          disabled
          title="Bientôt disponible"
          className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all cursor-not-allowed"
          style={{
            background: "rgba(188,184,143,0.08)",
            border: "1px solid rgba(188,184,143,0.2)",
            color: "rgba(188,184,143,0.35)",
          }}
        >
          Simulation →
        </button>
      </div>
    </div>
  );
}
