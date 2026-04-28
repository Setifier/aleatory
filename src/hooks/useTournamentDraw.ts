import { useState, useCallback } from "react";
import type { Participant, DrawPot, Group } from "../types/groupsDraw";
import type {
  TournamentMode,
  TournamentPhase,
  GroupsConfig,
  BracketSlot,
  DrawStep,
  BracketMatchSize,
} from "../types/tournamentDraw";
import { DrawAlgorithm } from "../lib/drawAlgorithm";
import { computeBracket, getR1SlotRanges } from "../lib/bracketEngine";

const DEFAULT_GROUPS_CONFIG: GroupsConfig = {
  numberOfGroups: 4,
  namingFormat: "A-Z",
  customNames: [],
  usePots: false,
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGroupsDrawSteps(groups: Group[]): DrawStep[] {
  const steps: DrawStep[] = [];
  const maxPerGroup = Math.max(...groups.map((g) => g.participants.length));
  for (let i = 0; i < maxPerGroup; i++) {
    for (let gi = 0; gi < groups.length; gi++) {
      const p = groups[gi].participants[i];
      if (p) {
        steps.push({
          id: crypto.randomUUID(),
          participant: p,
          groupName: groups[gi].name,
          groupIndex: gi,
        });
      }
    }
  }
  return steps;
}

function buildBracketDrawSteps(participants: Participant[], matchSize: number): {
  steps: DrawStep[];
  slots: BracketSlot[];
  size: number;
} {
  const n  = participants.length;
  const ms = Math.max(2, matchSize);

  // Use the natural bracket layout — no power-of-ms padding
  const layout   = computeBracket(n, ms);
  const r1Ranges = getR1SlotRanges(layout);

  // Mark slots that belong to "bye" entries (auto-advance, single participant)
  const byeSlots = new Set<number>();
  layout.rounds[0].entries.forEach((entry, e) => {
    if (entry.kind === "bye") {
      for (let j = r1Ranges[e][0]; j < r1Ranges[e][1]; j++) {
        byeSlots.add(j);
      }
    }
  });

  const shuffled = shuffleArray(participants);
  const slots: BracketSlot[] = shuffled.map((p, i) => ({
    slotIndex: i + 1,
    participant: p,
    isBye: byeSlots.has(i),  // true = auto-advance (not empty)
  }));
  const steps: DrawStep[] = shuffled.map((p, i) => ({
    id: crypto.randomUUID(),
    participant: p,
    slotIndex: i + 1,
  }));
  return { steps, slots, size: n };
}

export const useTournamentDraw = (isAuthenticated = false) => {
  const [phase, setPhase] = useState<TournamentPhase>(1);
  const [mode, setMode] = useState<TournamentMode | null>(null);
  const [title, setTitleState] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pots, setPots] = useState<DrawPot[]>([
    { index: 0, name: "Chapeau 1", participants: [] },
    { index: 1, name: "Chapeau 2", participants: [] },
  ]);
  const [groupsConfig, setGroupsConfigState] = useState<GroupsConfig>(DEFAULT_GROUPS_CONFIG);

  const [drawSteps, setDrawSteps] = useState<DrawStep[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [drawnGroups, setDrawnGroups] = useState<Group[]>([]);
  const [bracketSlots, setBracketSlots] = useState<BracketSlot[]>([]);
  const [bracketSize, setBracketSize] = useState(0);
  const [bracketMatchSize, setBracketMatchSize] = useState<BracketMatchSize>(2);
  const [error, setError] = useState<string | null>(null);

  const selectMode = useCallback((m: TournamentMode) => {
    setMode(m);
    setPhase(2);
    setError(null);
  }, []);

  const addParticipant = useCallback(
    (name: string): boolean => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      if (participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        setError(`"${trimmed}" est déjà dans la liste`);
        return false;
      }
      setParticipants((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed }]);
      setError(null);
      return true;
    },
    [participants]
  );

  const toggleParticipant = useCallback((name: string): void => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setParticipants((prev) => {
      const existing = prev.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
      if (existing) return prev.filter((p) => p.id !== existing.id);
      return [...prev, { id: crypto.randomUUID(), name: trimmed }];
    });
    setError(null);
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setPots((prev) =>
      prev.map((pot) => ({
        ...pot,
        participants: pot.participants.filter((p) => p.id !== id),
      }))
    );
  }, []);

  const clearParticipants = useCallback(() => {
    setParticipants([]);
    setPots((prev) => prev.map((p) => ({ ...p, participants: [] })));
  }, []);

  const setTitle = useCallback((t: string) => setTitleState(t), []);

  const updateGroupsConfig = useCallback((updates: Partial<GroupsConfig>) => {
    setGroupsConfigState((prev) => ({ ...prev, ...updates }));
  }, []);

  const moveParticipantToPot = useCallback(
    (participantId: string, potIndex: number) => {
      const participant = participants.find((p) => p.id === participantId);
      if (!participant) return;
      setPots((prev) =>
        prev.map((pot) => ({
          ...pot,
          participants:
            pot.index === potIndex
              ? [
                  ...pot.participants.filter((p) => p.id !== participantId),
                  { ...participant, potIndex },
                ]
              : pot.participants.filter((p) => p.id !== participantId),
        }))
      );
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, potIndex } : p))
      );
    },
    [participants]
  );

  const addPot = useCallback(() => {
    setPots((prev) => {
      if (prev.length >= 8) return prev;
      const index = prev.length;
      return [...prev, { index, name: `Chapeau ${index + 1}`, participants: [] }];
    });
  }, []);

  const removePot = useCallback((potIndex: number) => {
    setPots((prev) => {
      if (prev.length <= 2) return prev;
      setParticipants((pprev) =>
        pprev.map((p) => (p.potIndex === potIndex ? { ...p, potIndex: undefined } : p))
      );
      return prev
        .filter((p) => p.index !== potIndex)
        .map((p, i) => ({ ...p, index: i, name: `Chapeau ${i + 1}` }));
    });
  }, []);

  const goToPhase = useCallback((p: TournamentPhase) => {
    setPhase(p);
    setError(null);
  }, []);

  const startDraw = useCallback(() => {
    if (!mode) return;

    if (mode === "groups" || mode === "both") {
      if (participants.length < 4) {
        setError("Il faut au moins 4 participants pour un tirage de groupes");
        return;
      }
      if (participants.length < groupsConfig.numberOfGroups) {
        setError(`Il faut au moins ${groupsConfig.numberOfGroups} participants (1 par groupe)`);
        return;
      }
      if (groupsConfig.usePots) {
        const empty = pots.find((pot) => pot.participants.length === 0);
        if (empty) {
          setError(`${empty.name} est vide`);
          return;
        }
        const counts = pots.map((p) => p.participants.length);
        if (counts.some((c) => c !== counts[0])) {
          setError("Tous les chapeaux doivent avoir le même nombre de participants");
          return;
        }
      }
    } else {
      if (participants.length < 2) {
        setError("Il faut au moins 2 participants");
        return;
      }
    }

    setError(null);

    if (mode === "groups" || mode === "both") {
      const groupNames = DrawAlgorithm.generateGroupNames(
        groupsConfig.numberOfGroups,
        groupsConfig.namingFormat,
        groupsConfig.customNames.length >= groupsConfig.numberOfGroups
          ? groupsConfig.customNames
          : undefined
      );
      let groups: Group[];
      if (groupsConfig.usePots) {
        groups = DrawAlgorithm.potsDraw(pots, groupsConfig.numberOfGroups, groupNames);
      } else {
        groups = DrawAlgorithm.randomDraw(participants, groupsConfig.numberOfGroups, groupNames);
      }
      setDrawnGroups(groups);
      setDrawSteps(buildGroupsDrawSteps(groups));
    } else {
      const { steps, slots, size } = buildBracketDrawSteps(participants, bracketMatchSize);
      setDrawSteps(steps);
      setBracketSlots(slots);
      setBracketSize(size);
    }

    setRevealedCount(0);
    setPhase(4);
  }, [mode, participants, groupsConfig, pots]);

  const revealNext = useCallback(() => {
    setRevealedCount((prev) => Math.min(prev + 1, drawSteps.length));
  }, [drawSteps.length]);

  const revealAll = useCallback(() => {
    setRevealedCount(drawSteps.length);
  }, [drawSteps.length]);

  const finishDraw = useCallback(() => {
    setRevealedCount(drawSteps.length);
    setPhase(5);
  }, [drawSteps.length]);

  const reset = useCallback(() => {
    setPhase(1);
    setMode(null);
    setTitleState("");
    setParticipants([]);
    setPots([
      { index: 0, name: "Chapeau 1", participants: [] },
      { index: 1, name: "Chapeau 2", participants: [] },
    ]);
    setGroupsConfigState(DEFAULT_GROUPS_CONFIG);
    setDrawSteps([]);
    setRevealedCount(0);
    setDrawnGroups([]);
    setBracketSlots([]);
    setBracketSize(0);
    setBracketMatchSize(2);
    setError(null);
  }, []);

  const minParticipants = mode === "bracket" ? 2 : 4;
  const canProceedFromParticipants = participants.length >= minParticipants;

  return {
    phase,
    mode,
    title,
    participants,
    pots,
    groupsConfig,
    drawSteps,
    revealedCount,
    drawnGroups,
    bracketSlots,
    bracketSize,
    bracketMatchSize,
    setBracketMatchSize,
    error,
    isAuthenticated,
    minParticipants,
    canProceedFromParticipants,
    selectMode,
    addParticipant,
    toggleParticipant,
    removeParticipant,
    clearParticipants,
    setTitle,
    updateGroupsConfig,
    moveParticipantToPot,
    addPot,
    removePot,
    goToPhase,
    startDraw,
    revealNext,
    revealAll,
    finishDraw,
    reset,
  };
};
