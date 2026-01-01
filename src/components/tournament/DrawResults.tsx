import { motion } from "framer-motion";
import type { GroupsDrawResult } from "../../types/groupsDraw";
import GroupCard from "./GroupCard";
import Button from "../ui/Button";

interface DrawResultsProps {
  result: GroupsDrawResult;
  onSave?: () => Promise<boolean>;
  onReset: () => void;
  isAuthenticated: boolean;
}

export default function DrawResults({
  result,
  onSave,
  onReset,
  isAuthenticated,
}: DrawResultsProps) {
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2">
              {result.title || `Tirage du ${result.createdAt.toLocaleDateString("fr-FR")}`}
            </h2>
            <p className="text-white/60">
              {result.groups.length} groupes • {result.totalParticipants} participants
            </p>
          </div>

          <div className="flex gap-2">
            {isAuthenticated && !result.id && onSave && (
              <Button onClick={handleSave} variant="primary">
                💾 Sauvegarder
              </Button>
            )}
            <Button onClick={onReset} variant="outline">
              Nouveau tirage
            </Button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-white/80 font-semibold mb-4">Résultats du tirage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {result.groups.map((group, index) => (
            <GroupCard key={group.id} group={group} index={index} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-4 border border-white/10 text-center">
          <p className="text-white/60 text-sm mb-1">Groupes</p>
          <p className="text-2xl font-bold text-white">{result.groups.length}</p>
        </div>
        <div className="glass-strong rounded-xl p-4 border border-white/10 text-center">
          <p className="text-white/60 text-sm mb-1">Participants</p>
          <p className="text-2xl font-bold text-white">{result.totalParticipants}</p>
        </div>
        <div className="glass-strong rounded-xl p-4 border border-white/10 text-center">
          <p className="text-white/60 text-sm mb-1">Mode</p>
          <p className="text-lg font-bold text-white">
            {result.drawMode === "random" ? "🎲 Aléatoire" : "🏆 Pots"}
          </p>
        </div>
        <div className="glass-strong rounded-xl p-4 border border-white/10 text-center">
          <p className="text-white/60 text-sm mb-1">Date</p>
          <p className="text-sm font-bold text-white">
            {result.createdAt.toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
