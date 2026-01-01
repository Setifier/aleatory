import { useState, useCallback, useEffect } from "react";
import type {
  Participant,
  DrawPot,
  Group,
  GroupsDrawConfig,
  DrawAnimationState,
  GroupsDrawResult,
  DrawMode,
  GroupNamingFormat,
} from "../types/groupsDraw";
import { DrawAlgorithm } from "../lib/drawAlgorithm";
import {
  saveGroupsDraw,
  getGroupsDraws,
  deleteGroupsDraw,
} from "../lib/tournamentService";
import { logSupabaseError } from "../lib/logger";

export interface UseGroupsDrawReturn {
  // Configuration state
  config: GroupsDrawConfig | null;
  currentStep: number;

  // Participants management
  participants: Participant[];
  pots: DrawPot[];

  // Draw state
  groups: Group[];
  drawResult: GroupsDrawResult | null;
  isDrawing: boolean;
  animationState: DrawAnimationState;

  // History
  history: GroupsDrawResult[];
  isLoadingHistory: boolean;

  // Error handling
  error: string | null;

  // Configuration methods
  setDrawMode: (mode: DrawMode) => void;
  setTitle: (title: string) => void;
  setGroupConfig: (
    numberOfGroups: number,
    participantsPerGroup: number,
    namingFormat: GroupNamingFormat,
    customNames?: string[]
  ) => void;

  // Participants methods
  addParticipant: (name: string, potIndex?: number) => boolean;
  removeParticipant: (id: string) => void;
  moveParticipantToPot: (participantId: string, potIndex: number) => void;
  reorderParticipantsInPot: (potIndex: number, newOrder: Participant[]) => void;

  // Draw methods
  performDraw: () => Promise<void>;
  saveDraw: () => Promise<boolean>;

  // History methods
  loadHistory: () => Promise<void>;
  deleteHistoryEntry: (drawId: string) => Promise<boolean>;
  loadDrawById: (drawId: string) => Promise<void>;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetDraw: () => void;

  // Validation
  canProceedToStep: (step: number) => boolean;
}

export const useGroupsDraw = (isAuthenticated: boolean = false): UseGroupsDrawReturn => {
  // Configuration state
  const [config, setConfig] = useState<GroupsDrawConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Participants management
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pots, setPots] = useState<DrawPot[]>([
    { index: 0, name: "Pot 1", participants: [] },
    { index: 1, name: "Pot 2", participants: [] },
  ]);

  // Draw state
  const [groups, setGroups] = useState<Group[]>([]);
  const [drawResult, setDrawResult] = useState<GroupsDrawResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [animationState, setAnimationState] = useState<DrawAnimationState>({
    currentGroupIndex: 0,
    currentParticipantIndex: 0,
    isDrawing: false,
    completedGroups: new Set(),
  });

  // History
  const [history, setHistory] = useState<GroupsDrawResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Load history on mount if authenticated
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingHistory(true);
    try {
      const { draws, error: fetchError } = await getGroupsDraws();
      if (fetchError) {
        setError(fetchError);
      } else {
        setHistory(draws);
      }
    } catch (err) {
      logSupabaseError("load groups draws history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  // Configuration methods
  const setDrawMode = useCallback((mode: DrawMode) => {
    setConfig((prev) => ({
      ...(prev || {
        title: "",
        drawMode: mode,
        participants: [],
        numberOfGroups: 4,
        participantsPerGroup: 4,
        groupNamingFormat: "A-Z",
      }),
      drawMode: mode,
    }));

    // Initialize pots if switching to pots mode
    if (mode === "pots" && pots.length === 0) {
      setPots([
        { index: 0, name: "Pot 1", participants: [] },
        { index: 1, name: "Pot 2", participants: [] },
      ]);
    }
  }, [pots.length]);

  const setTitle = useCallback((title: string) => {
    setConfig((prev) => ({
      ...(prev || {
        title,
        drawMode: "random",
        participants: [],
        numberOfGroups: 4,
        participantsPerGroup: 4,
        groupNamingFormat: "A-Z",
      }),
      title,
    }));
  }, []);

  const setGroupConfig = useCallback(
    (
      numberOfGroups: number,
      participantsPerGroup: number,
      namingFormat: GroupNamingFormat,
      customNames?: string[]
    ) => {
      setConfig((prev) => ({
        ...(prev || {
          title: "",
          drawMode: "random",
          participants: [],
          numberOfGroups,
          participantsPerGroup,
          groupNamingFormat: namingFormat,
        }),
        numberOfGroups,
        participantsPerGroup,
        groupNamingFormat: namingFormat,
        customGroupNames: customNames,
      }));
    },
    []
  );

  // Participants methods
  const addParticipant = useCallback((name: string, potIndex?: number): boolean => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    // Check for duplicates
    const isDuplicate = participants.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError(`"${trimmedName}" est déjà dans la liste`);
      return false;
    }

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: trimmedName,
      potIndex,
    };

    // Add to main participants list
    setParticipants((prev) => [...prev, newParticipant]);

    // If potIndex is specified, add to that pot
    if (potIndex !== undefined) {
      setPots((prev) =>
        prev.map((pot) =>
          pot.index === potIndex
            ? { ...pot, participants: [...pot.participants, newParticipant] }
            : pot
        )
      );
    }

    setError(null);
    return true;
  }, [participants]);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));

    // Also remove from pots if present
    setPots((prev) =>
      prev.map((pot) => ({
        ...pot,
        participants: pot.participants.filter((p) => p.id !== id),
      }))
    );
  }, []);

  const moveParticipantToPot = useCallback((participantId: string, potIndex: number) => {
    // Find participant
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;

    // Remove from all pots
    setPots((prev) =>
      prev.map((pot) => ({
        ...pot,
        participants: pot.participants.filter((p) => p.id !== participantId),
      }))
    );

    // Add to target pot
    setPots((prev) =>
      prev.map((pot) =>
        pot.index === potIndex
          ? {
              ...pot,
              participants: [...pot.participants, { ...participant, potIndex }],
            }
          : pot
      )
    );

    // Update participant
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, potIndex } : p
      )
    );
  }, [participants]);

  const reorderParticipantsInPot = useCallback(
    (potIndex: number, newOrder: Participant[]) => {
      setPots((prev) =>
        prev.map((pot) =>
          pot.index === potIndex ? { ...pot, participants: newOrder } : pot
        )
      );
    },
    []
  );

  // Draw methods
  const performDraw = useCallback(async () => {
    if (!config) return;

    // Validate configuration
    const validation = DrawAlgorithm.validateConfig(config);
    if (!validation.valid) {
      setError(validation.error || "Configuration invalide");
      return;
    }

    setIsDrawing(true);
    setAnimationState({
      currentGroupIndex: 0,
      currentParticipantIndex: 0,
      isDrawing: true,
      completedGroups: new Set(),
    });

    // Generate group names
    const groupNames = DrawAlgorithm.generateGroupNames(
      config.numberOfGroups,
      config.groupNamingFormat,
      config.customGroupNames
    );

    // Perform draw based on mode
    let drawnGroups: Group[];
    if (config.drawMode === "pots") {
      drawnGroups = DrawAlgorithm.potsDraw(pots, config.numberOfGroups, groupNames);
    } else {
      drawnGroups = DrawAlgorithm.randomDraw(
        participants,
        config.numberOfGroups,
        groupNames
      );
    }

    setGroups(drawnGroups);

    // Simulate animation delay (3.5s like lottery)
    await new Promise((resolve) => setTimeout(resolve, 3500));

    const result: GroupsDrawResult = {
      title: config.title,
      drawMode: config.drawMode,
      groups: drawnGroups,
      totalParticipants: participants.length,
      createdAt: new Date(),
      config,
    };

    setDrawResult(result);
    setIsDrawing(false);
    setAnimationState((prev) => ({ ...prev, isDrawing: false }));

    // Auto-save for authenticated users
    if (isAuthenticated) {
      const { success, draw } = await saveGroupsDraw(config, result);
      if (success && draw) {
        setDrawResult(draw);
        setHistory((prev) => [draw, ...prev.slice(0, 49)]);
      }
    } else {
      // Guest mode: keep in memory (max 10)
      setHistory((prev) => [result, ...prev.slice(0, 9)]);
    }
  }, [config, participants, pots, isAuthenticated]);

  const saveDraw = useCallback(async (): Promise<boolean> => {
    if (!drawResult || !config || !isAuthenticated) return false;

    const { success, draw } = await saveGroupsDraw(config, drawResult);
    if (success && draw) {
      setDrawResult(draw);
      setHistory((prev) => [draw, ...prev.slice(0, 49)]);
      return true;
    }
    return false;
  }, [drawResult, config, isAuthenticated]);

  // History methods
  const deleteHistoryEntry = useCallback(async (drawId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const { success } = await deleteGroupsDraw(drawId);
    if (success) {
      setHistory((prev) => prev.filter((d) => d.id !== drawId));
      return true;
    }
    return false;
  }, [isAuthenticated]);

  const loadDrawById = useCallback(async (drawId: string) => {
    const draw = history.find((d) => d.id === drawId);
    if (draw) {
      setDrawResult(draw);
      setGroups(draw.groups);
      setConfig(draw.config);
    }
  }, [history]);

  // Navigation
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetDraw = useCallback(() => {
    setDrawResult(null);
    setGroups([]);
    setCurrentStep(1);
    setError(null);
  }, []);

  // Validation
  const canProceedToStep = useCallback((step: number): boolean => {
    if (step === 2) {
      // Can proceed from step 1 if draw mode is selected
      return config?.drawMode !== undefined;
    }

    if (step === 3) {
      // Can proceed from step 2 if we have enough participants
      if (config?.drawMode === "pots") {
        return pots.every((pot) => pot.participants.length > 0);
      }
      return participants.length >= 4;
    }

    return false;
  }, [config, participants, pots]);

  return {
    // Configuration state
    config,
    currentStep,

    // Participants management
    participants,
    pots,

    // Draw state
    groups,
    drawResult,
    isDrawing,
    animationState,

    // History
    history,
    isLoadingHistory,

    // Error handling
    error,

    // Configuration methods
    setDrawMode,
    setTitle,
    setGroupConfig,

    // Participants methods
    addParticipant,
    removeParticipant,
    moveParticipantToPot,
    reorderParticipantsInPot,

    // Draw methods
    performDraw,
    saveDraw,

    // History methods
    loadHistory,
    deleteHistoryEntry,
    loadDrawById,

    // Navigation
    goToStep,
    nextStep,
    previousStep,
    resetDraw,

    // Validation
    canProceedToStep,
  };
};
