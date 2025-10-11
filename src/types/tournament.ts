export type TournamentFormat = "bracket" | "group";
export type TournamentStatus = "draft" | "active" | "completed";
export type GroupNamingFormat = "A-Z" | "1-30" | "custom";
export type MatchStage =
  | "group"
  | "r32"
  | "r16"
  | "r8"
  | "quarter"
  | "semi"
  | "final";

export interface Tournament {
  id: string;
  user_id: string;
  title: string;
  format: TournamentFormat;
  status: TournamentStatus;
  participant_count: number;

  // Bracket config
  participants_per_match?: number;

  // Group config
  participants_per_group?: number;
  group_naming_format?: GroupNamingFormat;
  custom_group_names?: string[];
  has_final_phase?: boolean;

  // Result
  winner_name?: string;
  completed_at?: string;

  created_at: string;
  updated_at: string;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  stage: MatchStage;
  group_name?: string;
  match_number: number;
  round?: number;

  participants: string[];

  winner_name?: string;
  winner_score?: Record<string, number>;
  played_at?: string;

  created_at: string;
}

export interface TournamentCreationForm {
  title: string;
  format: TournamentFormat;
  participants: string[];

  // Bracket
  participants_per_match?: number;

  // Group
  participants_per_group?: number;
  group_naming_format?: GroupNamingFormat;
  custom_group_names?: string[];
  has_final_phase?: boolean;
}
