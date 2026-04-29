export type DrawMode = "random" | "pots";
export type GroupNamingFormat = "A-Z" | "1-30" | "custom";

export interface Participant {
  id: string;
  name: string;
  potIndex?: number; // Only for pots mode (0 = Pot 1, 1 = Pot 2, etc.)
}

export interface DrawPot {
  index: number;
  name: string; // "Pot 1", "Pot 2", etc.
  participants: Participant[];
}

export interface Group {
  id: string;
  name: string; // "Group A", "Group 1", or custom
  participants: Participant[];
}

export interface GroupsDrawConfig {
  title: string;
  drawMode: DrawMode;
  participants: Participant[];
  pots?: DrawPot[]; // Only for pots mode
  numberOfGroups: number;
  participantsPerGroup: number;
  groupNamingFormat: GroupNamingFormat;
  customGroupNames?: string[];
}

export interface DrawAnimationState {
  currentGroupIndex: number;
  currentParticipantIndex: number;
  isDrawing: boolean;
  completedGroups: Set<number>;
}

export interface GroupsDrawResult {
  id?: string; // DB ID if saved
  title: string;
  drawMode: DrawMode;
  groups: Group[];
  totalParticipants: number;
  createdAt: Date;
  config: GroupsDrawConfig;
}

export interface GroupsDrawHistoryEntry {
  id: string;
  user_id: string;
  title: string;
  draw_mode: DrawMode;
  groups_data: Group[]; // JSON
  config_data: GroupsDrawConfig; // JSON
  total_participants: number;
  created_at: string;
}
