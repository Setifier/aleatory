import { motion } from "framer-motion";
import type { TournamentMode } from "../../types/tournamentDraw";

interface ModeSelectPhaseProps {
  onSelect: (mode: TournamentMode) => void;
}

const MODES: {
  id: TournamentMode;
  badge: string;
  label: string;
  sub: string;
  examples: string;
}[] = [
  {
    id: "groups",
    badge: "GRP",
    label: "Tirage de groupes",
    sub: "Phase de poules",
    examples: "Coupe du Monde, Euro, Champions League…",
  },
  {
    id: "bracket",
    badge: "KO",
    label: "Élimination directe",
    sub: "Tableau knockout",
    examples: "Wimbledon, March Madness, tournoi local…",
  },
];

export default function ModeSelectPhase({ onSelect }: ModeSelectPhaseProps) {
  return (
    <div className="px-6 pt-6 pb-4 space-y-3">
      <div className="text-center mb-5">
        <h3 className="text-xl font-black text-white uppercase tracking-wide">
          Format du tirage
        </h3>
        <p className="text-white/40 text-sm mt-1">Choisissez le type de tirage au sort</p>
      </div>

      {MODES.map((m, i) => (
        <motion.button
          key={m.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => onSelect(m.id)}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all group"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          whileHover={{ scale: 1.01, backgroundColor: "rgba(97,97,216,0.1)" }}
          whileTap={{ scale: 0.99 }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black tracking-wide flex-shrink-0"
            style={{
              background: "rgba(97,97,216,0.18)",
              color: "rgba(161,149,248,0.95)",
              border: "1px solid rgba(97,97,216,0.25)",
            }}
          >
            {m.badge}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base mb-0.5">{m.label}</p>
            <p className="text-white/35 text-xs truncate">{m.examples}</p>
          </div>
          <span className="text-white/25 group-hover:text-primary-400 transition-colors text-lg flex-shrink-0">
            →
          </span>
        </motion.button>
      ))}
    </div>
  );
}
