import { motion } from "framer-motion";
import { useState } from "react";
import type { DrawMode } from "../../types/groupsDraw";
import Button from "../ui/Button";

interface DrawConfigStepProps {
  onComplete: (mode: DrawMode, title: string) => void;
}

export default function DrawConfigStep({ onComplete }: DrawConfigStepProps) {
  const [title, setTitle] = useState("");
  const [selectedMode, setSelectedMode] = useState<DrawMode | null>(null);

  const handleSubmit = () => {
    if (selectedMode) {
      onComplete(selectedMode, title);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <label className="block text-white/80 mb-2 font-semibold">
          Titre du tirage (optionnel)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Tirage Coupe du Monde 2026"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-colors"
          maxLength={100}
        />
        {title && (
          <p className="text-xs text-white/40 mt-1">{title.length}/100</p>
        )}
      </div>

      {/* Mode Selection */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-white/80 mb-4 font-semibold">Mode de tirage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Random Mode Card */}
          <motion.button
            onClick={() => setSelectedMode("random")}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedMode === "random"
                ? "border-primary-400 bg-primary-500/10 shadow-glow-md"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-4xl mb-3">🎲</div>
            <h4 className="text-lg font-bold text-white mb-2">
              100% Aléatoire
            </h4>
            <p className="text-sm text-white/60">
              Tous les participants sont tirés au sort et répartis aléatoirement
              dans les groupes
            </p>
          </motion.button>

          {/* Pots Mode Card */}
          <motion.button
            onClick={() => setSelectedMode("pots")}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedMode === "pots"
                ? "border-secondary-400 bg-secondary-500/10 shadow-glow-md"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-4xl mb-3">🏆</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Chapeaux / Pots
            </h4>
            <p className="text-sm text-white/60">
              Organisez les participants en chapeaux (forts, moyens, faibles) pour
              un tirage équilibré
            </p>
          </motion.button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          variant="gradient"
          size="lg"
          withGlow
          disabled={!selectedMode}
        >
          Suivant →
        </Button>
      </div>
    </div>
  );
}
