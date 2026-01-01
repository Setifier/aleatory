import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useGroupsDraw } from "../../hooks/useGroupsDraw";
import StepIndicator from "./StepIndicator";
import DrawConfigStep from "./DrawConfigStep";
import ParticipantsStep from "./ParticipantsStep";
import GroupsConfigStep from "./GroupsConfigStep";
import DrawAnimation from "./DrawAnimation";
import DrawResults from "./DrawResults";
import DrawHistory from "./DrawHistory";
import type { DrawMode, GroupNamingFormat } from "../../types/groupsDraw";

interface GroupsDrawSectionProps {
  isAuthenticated: boolean;
}

export default function GroupsDrawSection({
  isAuthenticated,
}: GroupsDrawSectionProps) {
  const {
    config,
    currentStep,
    participants,
    pots,
    groups,
    drawResult,
    isDrawing,
    animationState,
    history,
    isLoadingHistory,
    error,
    setDrawMode,
    setTitle,
    setGroupConfig,
    addParticipant,
    removeParticipant,
    moveParticipantToPot,
    performDraw,
    saveDraw,
    deleteHistoryEntry,
    nextStep,
    previousStep,
    resetDraw,
  } = useGroupsDraw(isAuthenticated);

  // Handle add/remove pots
  const [localPots, setLocalPots] = useState(pots);

  const handleStep1Complete = (mode: DrawMode, title: string) => {
    setDrawMode(mode);
    setTitle(title);
    nextStep();
  };

  const handleStep2Complete = () => {
    nextStep();
  };

  const handleStep3Complete = (
    numberOfGroups: number,
    participantsPerGroup: number,
    namingFormat: GroupNamingFormat,
    customNames?: string[]
  ) => {
    setGroupConfig(numberOfGroups, participantsPerGroup, namingFormat, customNames);
    performDraw();
  };

  const handleAddPot = () => {
    setLocalPots((prev) => [
      ...prev,
      {
        index: prev.length,
        name: `Pot ${prev.length + 1}`,
        participants: [],
      },
    ]);
  };

  const handleRemovePot = (index: number) => {
    setLocalPots((prev) => {
      const newPots = prev.filter((p) => p.index !== index);
      // Re-index
      return newPots.map((pot, idx) => ({
        ...pot,
        index: idx,
        name: `Pot ${idx + 1}`,
      }));
    });
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="glass-dark rounded-lg p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Step Indicator (only show during form steps) */}
      {!drawResult && !isDrawing && (
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      )}

      {/* Step 1: Configuration */}
      {currentStep === 1 && !drawResult && !isDrawing && (
        <DrawConfigStep onComplete={handleStep1Complete} />
      )}

      {/* Step 2: Participants */}
      {currentStep === 2 && !drawResult && !isDrawing && config && (
        <ParticipantsStep
          drawMode={config.drawMode}
          participants={participants}
          pots={config.drawMode === "pots" ? localPots : pots}
          onAddParticipant={addParticipant}
          onRemoveParticipant={removeParticipant}
          onAddPot={handleAddPot}
          onRemovePot={handleRemovePot}
          onMoveParticipantToPot={moveParticipantToPot}
          onComplete={handleStep2Complete}
          onBack={previousStep}
        />
      )}

      {/* Step 3: Groups Configuration */}
      {currentStep === 3 && !drawResult && !isDrawing && config && (
        <GroupsConfigStep
          totalParticipants={participants.length}
          onComplete={handleStep3Complete}
          onBack={previousStep}
        />
      )}

      {/* Draw Animation */}
      <AnimatePresence>
        {isDrawing && (
          <DrawAnimation groups={groups} animationState={animationState} />
        )}
      </AnimatePresence>

      {/* Results */}
      {drawResult && !isDrawing && (
        <DrawResults
          result={drawResult}
          onSave={isAuthenticated && !drawResult.id ? saveDraw : undefined}
          onReset={resetDraw}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* History */}
      {!isLoadingHistory && history.length > 0 && (
        <DrawHistory
          history={history}
          onDelete={isAuthenticated ? deleteHistoryEntry : undefined}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}
