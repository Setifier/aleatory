import { supabase } from "./supabaseClient";
import {
  Tournament,
  TournamentMatch,
  TournamentCreationForm,
} from "../types/tournament";
import type {
  GroupsDrawConfig,
  GroupsDrawResult,
  Group,
} from "../types/groupsDraw";
import { logSupabaseError } from "./logger";
import * as Sentry from "@sentry/react";

export const createTournament = async (
  form: TournamentCreationForm
): Promise<{ success: boolean; tournament?: Tournament; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("tournaments")
      .insert({
        user_id: user.id,
        title: form.title,
        format: form.format,
        participant_count: form.participants.length,
        participants_per_match: form.participants_per_match,
        participants_per_group: form.participants_per_group,
        group_naming_format: form.group_naming_format,
        custom_group_names: form.custom_group_names,
        has_final_phase: form.has_final_phase,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      logSupabaseError("create tournament", error);
      Sentry.captureException(error, {
        tags: { service: "tournament", action: "create" },
      });
      return { success: false, error: error.message };
    }

    return { success: true, tournament: data };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "create",
        error_type: "unexpected",
      },
    });
    return { success: false, error: "Unexpected error" };
  }
};

export const getUserTournaments = async (): Promise<{
  tournaments: Tournament[];
  error?: string;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { tournaments: [], error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logSupabaseError("get tournaments", error);
      Sentry.captureException(error, {
        tags: { service: "tournament", action: "get" },
      });
      return { tournaments: [], error: error.message };
    }

    return { tournaments: data || [] };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: { service: "tournament", action: "get", error_type: "unexpected" },
    });
    return { tournaments: [], error: "Unexpected error" };
  }
};

export const getTournamentById = async (
  tournamentId: string
): Promise<{ tournament?: Tournament; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single();

    if (error) {
      logSupabaseError("get tournament by id", error);
      Sentry.captureException(error, {
        tags: { service: "tournament", action: "getById" },
        extra: { tournamentId },
      });
      return { error: error.message };
    }

    return { tournament: data };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "getById",
        error_type: "unexpected",
      },
    });
    return { error: "Unexpected error" };
  }
};

export const createTournamentMatches = async (
  tournamentId: string,
  matches: Omit<TournamentMatch, "id" | "created_at">[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("tournament_matches").insert(matches);

    if (error) {
      logSupabaseError("create matches", error);
      Sentry.captureException(error, {
        tags: { service: "tournament", action: "createMatches" },
        extra: { tournamentId, matchCount: matches.length },
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "createMatches",
        error_type: "unexpected",
      },
    });
    return { success: false, error: "Unexpected error" };
  }
};

export const getTournamentMatches = async (
  tournamentId: string
): Promise<{ matches: TournamentMatch[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("tournament_matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("stage", { ascending: true })
      .order("match_number", { ascending: true });

    if (error) {
      logSupabaseError("get matches", error);
      Sentry.captureException(error, {
        tags: { service: "tournament", action: "getMatches" },
        extra: { tournamentId },
      });
      return { matches: [], error: error.message };
    }

    return { matches: data || [] };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "getMatches",
        error_type: "unexpected",
      },
    });
    return { matches: [], error: "Unexpected error" };
  }
};

export const updateTournamentStatus = async (
  tournamentId: string,
  status: "draft" | "active" | "completed"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("tournaments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", tournamentId);

    if (error) {
      logSupabaseError("update tournament status", error);
      Sentry.captureException(error, {
        tags: { service: "tournament", action: "updateStatus" },
        extra: { tournamentId, status },
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "updateStatus",
        error_type: "unexpected",
      },
    });
    return { success: false, error: "Unexpected error" };
  }
};

export const deleteTournament = async (
  tournamentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", tournamentId);

    if (error) {
      logSupabaseError("delete tournament", error);
      Sentry.captureException(error, {
        tags: { service: "tournament", action: "delete" },
        extra: { tournamentId },
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "delete",
        error_type: "unexpected",
      },
    });
    return { success: false, error: "Unexpected error" };
  }
};

// ===== GROUPS DRAW METHODS =====

export const saveGroupsDraw = async (
  config: GroupsDrawConfig,
  result: GroupsDrawResult
): Promise<{ success: boolean; draw?: GroupsDrawResult; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    // Create tournament entry
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        user_id: user.id,
        title: config.title || `Tirage du ${new Date().toLocaleDateString("fr-FR")}`,
        format: "group",
        status: "completed",
        participant_count: config.participants.length,
        participants_per_group: config.participantsPerGroup,
        group_naming_format: config.groupNamingFormat,
        custom_group_names: config.customGroupNames,
      })
      .select()
      .single();

    if (tournamentError) {
      logSupabaseError("save groups draw - tournament", tournamentError);
      Sentry.captureException(tournamentError, {
        tags: { service: "tournament", action: "saveGroupsDraw" },
      });
      return { success: false, error: tournamentError.message };
    }

    // Create match entries for each participant in each group
    const matches: Omit<TournamentMatch, "id" | "created_at">[] = [];
    result.groups.forEach((group) => {
      group.participants.forEach((participant, participantIndex) => {
        matches.push({
          tournament_id: tournament.id,
          stage: "group",
          group_name: group.name,
          match_number: participantIndex,
          participants: [participant.name],
        });
      });
    });

    if (matches.length > 0) {
      const { error: matchesError } = await supabase
        .from("tournament_matches")
        .insert(matches);

      if (matchesError) {
        logSupabaseError("save groups draw - matches", matchesError);
        // Don't fail the whole operation, just log
      }
    }

    const savedResult: GroupsDrawResult = {
      ...result,
      id: tournament.id,
    };

    return { success: true, draw: savedResult };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "saveGroupsDraw",
        error_type: "unexpected",
      },
    });
    return { success: false, error: "Unexpected error" };
  }
};

export const getGroupsDraws = async (): Promise<{
  draws: GroupsDrawResult[];
  error?: string;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { draws: [], error: "Utilisateur non connecté" };
    }

    // Get tournaments with format "group"
    const { data: tournaments, error: tournamentsError } = await supabase
      .from("tournaments")
      .select("*")
      .eq("user_id", user.id)
      .eq("format", "group")
      .order("created_at", { ascending: false })
      .limit(50);

    if (tournamentsError) {
      logSupabaseError("get groups draws", tournamentsError);
      Sentry.captureException(tournamentsError, {
        tags: { service: "tournament", action: "getGroupsDraws" },
      });
      return { draws: [], error: tournamentsError.message };
    }

    if (!tournaments || tournaments.length === 0) {
      return { draws: [] };
    }

    // For each tournament, get the groups (from matches)
    const draws: GroupsDrawResult[] = await Promise.all(
      tournaments.map(async (tournament) => {
        const { data: matches } = await supabase
          .from("tournament_matches")
          .select("*")
          .eq("tournament_id", tournament.id)
          .eq("stage", "group");

        // Reconstruct groups from matches
        const groupsMap = new Map<string, Group>();

        matches?.forEach((match) => {
          if (!match.group_name) return;

          if (!groupsMap.has(match.group_name)) {
            groupsMap.set(match.group_name, {
              id: crypto.randomUUID(),
              name: match.group_name,
              participants: [],
            });
          }

          const group = groupsMap.get(match.group_name)!;
          match.participants.forEach((participantName: string) => {
            group.participants.push({
              id: crypto.randomUUID(),
              name: participantName,
            });
          });
        });

        const groups = Array.from(groupsMap.values());

        return {
          id: tournament.id,
          title: tournament.title,
          drawMode: "random", // Default, could be extended to store this
          groups,
          totalParticipants: tournament.participant_count,
          createdAt: new Date(tournament.created_at),
          config: {
            title: tournament.title,
            drawMode: "random",
            participants: [],
            numberOfGroups: groups.length,
            participantsPerGroup: tournament.participants_per_group || 0,
            groupNamingFormat: tournament.group_naming_format || "A-Z",
            customGroupNames: tournament.custom_group_names,
          },
        };
      })
    );

    return { draws };
  } catch (error) {
    logSupabaseError("unexpected error", error);
    Sentry.captureException(error, {
      tags: {
        service: "tournament",
        action: "getGroupsDraws",
        error_type: "unexpected",
      },
    });
    return { draws: [], error: "Unexpected error" };
  }
};

export const deleteGroupsDraw = async (
  drawId: string
): Promise<{ success: boolean; error?: string }> => {
  return deleteTournament(drawId);
};
