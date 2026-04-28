import type { Participant, DrawPot, Group, GroupNamingFormat } from "./groupsDraw";

export type TournamentMode = "groups" | "bracket" | "both";
export type TournamentPhase = 1 | 2 | 3 | 4 | 5;
export type BracketMatchSize = 2 | 3 | 4;

export interface GroupsConfig {
  numberOfGroups: number;
  namingFormat: GroupNamingFormat;
  customNames: string[];
  usePots: boolean;
}

export interface BracketSlot {
  slotIndex: number;
  participant: Participant | null;
  isBye: boolean;
}

export interface DrawStep {
  id: string;
  participant: Participant;
  groupName?: string;
  groupIndex?: number;
  slotIndex?: number;
}

export interface TournamentDrawResult {
  id?: string;
  mode: TournamentMode;
  title: string;
  totalParticipants: number;
  groups?: Group[];
  bracketSlots?: BracketSlot[];
  bracketSize?: number;
  createdAt: Date;
}

export type { Participant, DrawPot, Group, GroupNamingFormat };
