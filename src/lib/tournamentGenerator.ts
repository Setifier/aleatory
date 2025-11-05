import {
  TournamentCreationForm,
  TournamentMatch,
  MatchStage,
} from "../types/tournament";

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateBracketMatches = (
  tournamentId: string,
  participants: string[],
  participantsPerMatch: number = 2
): Omit<TournamentMatch, "id" | "created_at">[] => {
  const shuffledParticipants = shuffleArray(participants);
  const matches: Omit<TournamentMatch, "id" | "created_at">[] = [];

  const getStage = (count: number): MatchStage => {
    if (count > 16) return "r32";
    if (count > 8) return "r16";
    if (count > 4) return "r8";
    if (count > 2) return "quarter";
    return "semi";
  };

  const stage = getStage(shuffledParticipants.length);
  let matchNumber = 1;

  for (let i = 0; i < shuffledParticipants.length; i += participantsPerMatch) {
    const matchParticipants = shuffledParticipants.slice(
      i,
      i + participantsPerMatch
    );

    if (matchParticipants.length === 1) {
      matchParticipants.push("BYE");
    }

    matches.push({
      tournament_id: tournamentId,
      stage,
      match_number: matchNumber++,
      round: 1,
      participants: matchParticipants,
      winner_name: undefined,
      winner_score: undefined,
      played_at: undefined,
      group_name: undefined,
    });
  }

  return matches;
};

export const generateGroupMatches = (
  tournamentId: string,
  participants: string[],
  participantsPerGroup: number,
  groupNamingFormat: "A-Z" | "1-30" | "custom",
  customGroupNames?: string[]
): Omit<TournamentMatch, "id" | "created_at">[] => {
  const shuffledParticipants = shuffleArray(participants);
  const matches: Omit<TournamentMatch, "id" | "created_at">[] = [];

  const groupCount = Math.ceil(
    shuffledParticipants.length / participantsPerGroup
  );

  const getGroupName = (index: number): string => {
    if (
      groupNamingFormat === "custom" &&
      customGroupNames &&
      customGroupNames[index]
    ) {
      return customGroupNames[index];
    }
    if (groupNamingFormat === "1-30") {
      return `Group ${index + 1}`;
    }
    return `Group ${String.fromCharCode(65 + index)}`;
  };

  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  shuffledParticipants.forEach((participant, index) => {
    groups[index % groupCount].push(participant);
  });

  groups.forEach((groupParticipants, groupIndex) => {
    const groupName = getGroupName(groupIndex);
    let matchNumber = 1;

    for (let i = 0; i < groupParticipants.length; i++) {
      for (let j = i + 1; j < groupParticipants.length; j++) {
        matches.push({
          tournament_id: tournamentId,
          stage: "group",
          group_name: groupName,
          match_number: matchNumber++,
          round: undefined,
          participants: [groupParticipants[i], groupParticipants[j]],
          winner_name: undefined,
          winner_score: undefined,
          played_at: undefined,
        });
      }
    }
  });

  return matches;
};

export const generateTournament = (
  tournamentId: string,
  form: TournamentCreationForm
): Omit<TournamentMatch, "id" | "created_at">[] => {
  if (form.format === "bracket") {
    return generateBracketMatches(
      tournamentId,
      form.participants,
      form.participants_per_match || 2
    );
  }

  if (form.format === "group") {
    return generateGroupMatches(
      tournamentId,
      form.participants,
      form.participants_per_group || 4,
      form.group_naming_format || "A-Z",
      form.custom_group_names
    );
  }

  return [];
};
