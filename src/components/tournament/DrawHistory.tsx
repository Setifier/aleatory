import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { GroupsDrawResult } from "../../types/groupsDraw";
import Button from "../ui/Button";

interface DrawHistoryProps {
  history: GroupsDrawResult[];
  onDelete?: (drawId: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

export default function DrawHistory({
  history,
  onDelete,
  isAuthenticated,
}: DrawHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) return null;

  const handleDelete = async (drawId: string) => {
    if (onDelete && window.confirm("Supprimer ce tirage ?")) {
      await onDelete(drawId);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/80 font-semibold">
          Historique ({history.length})
        </h3>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
        >
          {isExpanded ? "Réduire" : "Voir tout"}
        </Button>
      </div>

      {!isAuthenticated && (
        <div className="glass-dark rounded-lg p-3 border border-yellow-500/30 bg-yellow-500/10 mb-4">
          <p className="text-yellow-400 text-sm">
            ⚠️ Mode invité : l'historique sera effacé à la fermeture de la page.
            Connectez-vous pour sauvegarder.
          </p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {history.slice(0, isExpanded ? undefined : 5).map((draw, index) => (
            <motion.div
              key={draw.id || index}
              className="glass-dark rounded-lg p-4 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">
                    {draw.title}
                  </h4>
                  <p className="text-sm text-white/60">
                    {draw.groups.length} groupes • {draw.totalParticipants}{" "}
                    participants
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {draw.createdAt.toLocaleDateString("fr-FR")} à{" "}
                    {draw.createdAt.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === draw.id ? null : draw.id || null)
                    }
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {expandedId === draw.id ? "▼" : "▶"}
                  </button>
                  {isAuthenticated && onDelete && draw.id && (
                    <button
                      onClick={() => handleDelete(draw.id!)}
                      className="text-white/60 hover:text-red-400 transition-colors"
                      aria-label="Supprimer"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded View */}
              <AnimatePresence>
                {expandedId === draw.id && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-white/10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {draw.groups.map((group) => (
                        <div
                          key={group.id}
                          className="glass-dark rounded-lg p-3 border border-white/5"
                        >
                          <h5 className="text-white font-semibold mb-2">
                            {group.name}
                          </h5>
                          <div className="space-y-1">
                            {group.participants.map((p, pIdx) => (
                              <div
                                key={p.id}
                                className="text-sm text-white/80"
                              >
                                {pIdx + 1}. {p.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {!isExpanded && history.length > 5 && (
        <p className="text-center text-white/40 text-sm mt-3">
          +{history.length - 5} tirage{history.length - 5 > 1 ? "s" : ""} de plus
        </p>
      )}
    </div>
  );
}
