import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { DrawMode, Participant, DrawPot } from "../../types/groupsDraw";
import Button from "../ui/Button";
import ParticipantsList from "./ParticipantsList";
import PotsTabs from "./PotsTabs";
import DraggableParticipant from "./DraggableParticipant";

interface ParticipantsStepProps {
  drawMode: DrawMode;
  participants: Participant[];
  pots: DrawPot[];
  onAddParticipant: (name: string, potIndex?: number) => boolean;
  onRemoveParticipant: (id: string) => void;
  onAddPot: () => void;
  onRemovePot: (index: number) => void;
  onMoveParticipantToPot: (participantId: string, potIndex: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function ParticipantsStep({
  drawMode,
  participants,
  pots,
  onAddParticipant,
  onRemoveParticipant,
  onAddPot,
  onRemovePot,
  onMoveParticipantToPot,
  onComplete,
  onBack,
}: ParticipantsStepProps) {
  const [inputValue, setInputValue] = useState("");
  const [activePotIndex, setActivePotIndex] = useState(0);
  const [draggedParticipantId, setDraggedParticipantId] = useState<string | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const potIndex = drawMode === "pots" ? activePotIndex : undefined;
      const success = onAddParticipant(inputValue, potIndex);
      if (success) {
        setInputValue("");
      }
    }
  };

  const handleClear = () => {
    participants.forEach((p) => onRemoveParticipant(p.id));
  };

  const canProceed = () => {
    if (drawMode === "random") {
      return participants.length >= 4;
    }
    // Pots mode: all pots must have at least 1 participant
    return pots.every((pot) => pot.participants.length > 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetPotIndex: number) => {
    e.preventDefault();
    if (draggedParticipantId) {
      onMoveParticipantToPot(draggedParticipantId, targetPotIndex);
      setDraggedParticipantId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Participant Form */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-white/80 mb-4 font-semibold">
          Ajouter des participants
        </h3>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nom du participant..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-colors"
            maxLength={50}
          />
          <Button type="submit" variant="primary" disabled={!inputValue.trim()}>
            Ajouter
          </Button>
        </form>

        <p className="text-xs text-white/40 mt-2">
          {drawMode === "random"
            ? "Minimum 4 participants requis"
            : `Ajout au ${pots[activePotIndex]?.name || "pot actuel"}`}
        </p>
      </div>

      {/* Pots Tabs (only for pots mode) */}
      {drawMode === "pots" && (
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <PotsTabs
            pots={pots}
            activePotIndex={activePotIndex}
            onSelectPot={setActivePotIndex}
            onAddPot={onAddPot}
            onRemovePot={onRemovePot}
          />
        </div>
      )}

      {/* Participants List */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        {drawMode === "random" ? (
          <ParticipantsList
            participants={participants}
            onRemove={onRemoveParticipant}
            onClear={handleClear}
          />
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, activePotIndex)}
            className="min-h-[200px] rounded-lg border-2 border-dashed border-white/10 p-4 transition-colors"
          >
            <div className="mb-4">
              <h4 className="text-white/80 font-semibold">
                {pots[activePotIndex]?.name}
              </h4>
              <p className="text-xs text-white/40">
                Glissez-déposez pour réorganiser ou changer de pot
              </p>
            </div>

            {pots[activePotIndex]?.participants.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <p className="text-2xl mb-2">📋</p>
                <p>Aucun participant dans ce pot</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {pots[activePotIndex]?.participants.map((participant, index) => (
                    <DraggableParticipant
                      key={participant.id}
                      participant={participant}
                      index={index}
                      onRemove={onRemoveParticipant}
                      onDragStart={setDraggedParticipantId}
                      onDragEnd={() => setDraggedParticipantId(null)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          ← Retour
        </Button>
        <Button
          onClick={onComplete}
          variant="gradient"
          size="lg"
          withGlow
          disabled={!canProceed()}
        >
          Suivant →
        </Button>
      </div>
    </div>
  );
}
