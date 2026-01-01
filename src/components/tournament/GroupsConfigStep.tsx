import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { GroupNamingFormat } from "../../types/groupsDraw";
import { DrawAlgorithm } from "../../lib/drawAlgorithm";
import Button from "../ui/Button";

interface GroupsConfigStepProps {
  totalParticipants: number;
  onComplete: (
    numberOfGroups: number,
    participantsPerGroup: number,
    namingFormat: GroupNamingFormat,
    customNames?: string[]
  ) => void;
  onBack: () => void;
}

export default function GroupsConfigStep({
  totalParticipants,
  onComplete,
  onBack,
}: GroupsConfigStepProps) {
  const [numberOfGroups, setNumberOfGroups] = useState(4);
  const [participantsPerGroup, setParticipantsPerGroup] = useState(
    Math.ceil(totalParticipants / 4)
  );
  const [namingFormat, setNamingFormat] = useState<GroupNamingFormat>("A-Z");
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate participants per group
  useEffect(() => {
    const calculated = Math.ceil(totalParticipants / numberOfGroups);
    setParticipantsPerGroup(calculated);
  }, [numberOfGroups, totalParticipants]);

  // Generate preview group names
  const previewNames = DrawAlgorithm.generateGroupNames(
    numberOfGroups,
    namingFormat,
    customNames
  );

  // Validate configuration
  const validate = (): string | null => {
    if (numberOfGroups < 2 || numberOfGroups > 30) {
      return "Le nombre de groupes doit être entre 2 et 30";
    }

    if (namingFormat === "A-Z" && numberOfGroups > 26) {
      return "Le format A-Z supporte maximum 26 groupes";
    }

    if (namingFormat === "custom") {
      if (customNames.some((name) => !name.trim())) {
        return "Tous les noms de groupe doivent être remplis";
      }
      const uniqueNames = new Set(customNames.map((n) => n.trim().toLowerCase()));
      if (uniqueNames.size !== customNames.length) {
        return "Les noms de groupe doivent être uniques";
      }
    }

    const totalCapacity = numberOfGroups * participantsPerGroup;
    if (totalCapacity < totalParticipants) {
      return `Capacité insuffisante : ${totalCapacity} places pour ${totalParticipants} participants`;
    }

    return null;
  };

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    onComplete(
      numberOfGroups,
      participantsPerGroup,
      namingFormat,
      namingFormat === "custom" ? customNames : undefined
    );
  };

  // Initialize custom names when switching to custom format
  useEffect(() => {
    if (namingFormat === "custom") {
      setCustomNames(
        Array.from({ length: numberOfGroups }, (_, i) => `Groupe ${i + 1}`)
      );
    }
  }, [namingFormat, numberOfGroups]);

  return (
    <div className="space-y-6">
      {/* Number of Groups */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <label className="block text-white/80 mb-4 font-semibold">
          Nombre de groupes
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="2"
            max="30"
            value={numberOfGroups}
            onChange={(e) => setNumberOfGroups(parseInt(e.target.value))}
            className="flex-1 accent-primary-500"
          />
          <div className="glass-dark px-4 py-2 rounded-lg border border-white/10 min-w-[80px] text-center">
            <span className="text-white font-bold text-xl">{numberOfGroups}</span>
          </div>
        </div>
      </div>

      {/* Participants per Group */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <label className="block text-white/80 mb-4 font-semibold">
          Participants par groupe
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="50"
            value={participantsPerGroup}
            onChange={(e) =>
              setParticipantsPerGroup(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>
        <p className="text-xs text-white/40 mt-2">
          Capacité totale : {numberOfGroups * participantsPerGroup} places
          pour {totalParticipants} participants
        </p>
      </div>

      {/* Naming Format */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <label className="block text-white/80 mb-4 font-semibold">
          Format des noms de groupes
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.button
            onClick={() => setNamingFormat("A-Z")}
            className={`p-4 rounded-lg border-2 transition-all ${
              namingFormat === "A-Z"
                ? "border-primary-400 bg-primary-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-bold text-white mb-1">A-Z</div>
            <div className="text-xs text-white/60">Max 26 groupes</div>
          </motion.button>

          <motion.button
            onClick={() => setNamingFormat("1-30")}
            className={`p-4 rounded-lg border-2 transition-all ${
              namingFormat === "1-30"
                ? "border-primary-400 bg-primary-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-bold text-white mb-1">1-30</div>
            <div className="text-xs text-white/60">Max 30 groupes</div>
          </motion.button>

          <motion.button
            onClick={() => setNamingFormat("custom")}
            className={`p-4 rounded-lg border-2 transition-all ${
              namingFormat === "custom"
                ? "border-primary-400 bg-primary-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-bold text-white mb-1">Personnalisé</div>
            <div className="text-xs text-white/60">Noms personnalisés</div>
          </motion.button>
        </div>
      </div>

      {/* Custom Names Input */}
      {namingFormat === "custom" && (
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <label className="block text-white/80 mb-4 font-semibold">
            Noms personnalisés des groupes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
            {customNames.map((name, index) => (
              <input
                key={index}
                type="text"
                value={name}
                onChange={(e) => {
                  const newNames = [...customNames];
                  newNames[index] = e.target.value;
                  setCustomNames(newNames);
                }}
                placeholder={`Groupe ${index + 1}`}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-colors"
                maxLength={30}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h4 className="text-white/80 mb-4 font-semibold">Aperçu des groupes</h4>
        <div className="flex flex-wrap gap-2">
          {previewNames.slice(0, 10).map((name, index) => (
            <div
              key={index}
              className="glass-dark px-3 py-1.5 rounded-lg border border-white/10 text-sm text-white"
            >
              {name}
            </div>
          ))}
          {numberOfGroups > 10 && (
            <div className="glass-dark px-3 py-1.5 rounded-lg border border-white/10 text-sm text-white/60">
              +{numberOfGroups - 10} autres
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-dark rounded-lg p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          ← Retour
        </Button>
        <Button onClick={handleSubmit} variant="gradient" size="lg" withGlow>
          Lancer le tirage 🎰
        </Button>
      </div>
    </div>
  );
}
