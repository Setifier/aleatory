import { supabase } from "./supabaseClient";
import {
  Tournament,
  TournamentMatch,
  TournamentCreationForm,
} from "../types/tournament";
import { logSupabaseError } from "./logger";
import * as Sentry from "@sentry/react";

/**
 * Create a new tournament
 */
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

/**
 * Get user's tournaments
 */
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

/**
 * Get tournament by ID
 */
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

/**
 * Create tournament matches
 */
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

/**
 * Get tournament matches
 */
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

/**
 * Update tournament status
 */
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

/**
 * Delete tournament
 */
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
