import { supabase } from "./supabaseClient";
import { normalizeText } from "./textUtils";
import { getAuthUser, handleServiceError } from "./serviceUtils";
import { logSupabaseError } from "./logger";

// Reserved folder names — auto-created on first load, auto-populated on every draw
export const RECENT_FOLDER_NAME = "récents";
export const TOURNAMENT_RECENT_FOLDER_NAME = "récents (tournoi)";

export interface FolderItem {
  id: number;
  user_id: string;
  folder_name: string;
  created_at: string;
}

export const createFolder = async (
  folderName: string
): Promise<{ success: boolean; error?: string; folder?: FolderItem }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const trimmed = folderName.trim();
    if (!trimmed) return { success: false, error: "Folder name cannot be empty" };
    if (trimmed.length > 50) return { success: false, error: "Folder name cannot exceed 50 characters" };

    const name = normalizeText(trimmed);

    if (name === RECENT_FOLDER_NAME || name === TOURNAMENT_RECENT_FOLDER_NAME) {
      return { success: false, error: "This folder name is reserved" };
    }

    const { data: existing } = await supabase
      .from("folders")
      .select("id")
      .eq("user_id", user.id)
      .eq("folder_name", name)
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, error: "A folder with this name already exists" };
    }

    const { data, error } = await supabase
      .from("folders")
      .insert([{ user_id: user.id, folder_name: name }])
      .select()
      .single();

    if (error) {
      logSupabaseError("createFolder", error);
      return { success: false, error: error.message };
    }

    return { success: true, folder: data };
  } catch (err) {
    return handleServiceError("createFolder", "folders", "create", err, { folderName });
  }
};

export const loadUserFolders = async (): Promise<{ success: boolean; error?: string; folders: FolderItem[] }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, folders: [] };

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logSupabaseError("loadUserFolders", error);
      return { success: false, error: error.message, folders: [] };
    }

    return { success: true, folders: data ?? [] };
  } catch (err) {
    return { success: false, folders: [], ...handleServiceError("loadUserFolders", "folders", "load", err) };
  }
};

// Returns the recent folder for the current user, creating it if it doesn't exist.
export const getOrCreateRecentFolder = async (): Promise<FolderItem | null> => {
  try {
    const user = await getAuthUser();
    if (!user) return null;

    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .eq("folder_name", RECENT_FOLDER_NAME)
      .limit(1);

    if (data && data.length > 0) return data[0];

    const { data: newFolder, error } = await supabase
      .from("folders")
      .insert([{ user_id: user.id, folder_name: RECENT_FOLDER_NAME }])
      .select()
      .single();

    if (error) {
      logSupabaseError("getOrCreateRecentFolder", error);
      return null;
    }

    return newFolder;
  } catch (err) {
    handleServiceError("getOrCreateRecentFolder", "folders", "getOrCreate", err);
    return null;
  }
};

export const getOrCreateTournamentRecentFolder = async (): Promise<FolderItem | null> => {
  try {
    const user = await getAuthUser();
    if (!user) return null;

    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .eq("folder_name", TOURNAMENT_RECENT_FOLDER_NAME)
      .limit(1);

    if (data && data.length > 0) return data[0];

    const { data: newFolder, error } = await supabase
      .from("folders")
      .insert([{ user_id: user.id, folder_name: TOURNAMENT_RECENT_FOLDER_NAME }])
      .select()
      .single();

    if (error) {
      logSupabaseError("getOrCreateTournamentRecentFolder", error);
      return null;
    }

    return newFolder;
  } catch (err) {
    handleServiceError("getOrCreateTournamentRecentFolder", "folders", "getOrCreate", err);
    return null;
  }
};

export const deleteFolder = async (
  folderName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("user_id", user.id)
      .eq("folder_name", normalizeText(folderName));

    if (error) {
      logSupabaseError("deleteFolder", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return handleServiceError("deleteFolder", "folders", "delete", err, { folderName });
  }
};
