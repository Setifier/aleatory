import { supabase } from "./supabaseClient";
import { normalizeText } from "./textUtils";
import { logSupabaseError } from "./logger";


export interface FolderItem {
  id: number;
  user_id: string;
  folder_name: string;
  created_at: string;
}

export interface CreateFolderResult {
  success: boolean;
  error?: string;
  folder?: FolderItem;
}

export interface LoadFoldersResult {
  success: boolean;
  error?: string;
  folders: FolderItem[];
}

export interface DeleteFolderResult {
  success: boolean;
  error?: string;
}

export interface CheckFolderExistsResult {
  exists: boolean;
  error?: string;
}

export const checkFolderExists = async (
  folderName: string
): Promise<CheckFolderExistsResult> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { exists: false, error: "Utilisateur non connecté" };
    }

    const normalizedName = normalizeText(folderName);

    const { data, error } = await supabase
      .from("folders")
      .select("id")
      .eq("user_id", user.id)
      .eq("folder_name", normalizedName)
      .limit(1);

    if (error) {
      logSupabaseError("vérification dossier", error);
      return { exists: false, error: error.message };
    }

    return { exists: data && data.length > 0 };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);
    return { exists: false, error: "Erreur inattendue" };
  }
};

export const createFolder = async (
  folderName: string
): Promise<CreateFolderResult> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    const trimmedName = folderName.trim();
    if (!trimmedName) {
      return {
        success: false,
        error: "Le nom du dossier ne peut pas être vide",
      };
    }

    if (trimmedName.length > 50) {
      return {
        success: false,
        error: "Le nom du dossier ne peut pas dépasser 50 caractères",
      };
    }

    const normalizedName = normalizeText(trimmedName);
    const existsResult = await checkFolderExists(normalizedName);
    if (existsResult.error) {
      return { success: false, error: existsResult.error };
    }

    if (existsResult.exists) {
      return { success: false, error: "Un dossier avec ce nom existe déjà" };
    }

    const { data, error } = await supabase
      .from("folders")
      .insert([
        {
          user_id: user.id,
          folder_name: normalizedName,
        },
      ])
      .select()
      .single();

    if (error) {
      logSupabaseError("création dossier", error);
      return { success: false, error: error.message };
    }

    return { success: true, folder: data };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);
    return { success: false, error: "Erreur inattendue" };
  }
};

export const loadUserFolders = async (): Promise<LoadFoldersResult> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté", folders: [] };
    }

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logSupabaseError("chargement dossiers", error);
      return { success: false, error: error.message, folders: [] };
    }

    return { success: true, folders: data || [] };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);
    return { success: false, error: "Erreur inattendue", folders: [] };
  }
};

export const deleteFolder = async (
  folderName: string
): Promise<DeleteFolderResult> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    const normalizedName = normalizeText(folderName);

    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("user_id", user.id)
      .eq("folder_name", normalizedName);

    if (error) {
      logSupabaseError("suppression dossier", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);
    return { success: false, error: "Erreur inattendue" };
  }
};
