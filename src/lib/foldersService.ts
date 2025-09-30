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

/**
 * Vérifier si un dossier existe déjà pour l'utilisateur connecté
 */
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

    // Normaliser le nom du dossier pour la comparaison
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

/**
 * Créer un nouveau dossier pour l'utilisateur connecté
 */
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

    // Valider et normaliser le nom du dossier
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

    // Normaliser le nom du dossier (comme pour les items)
    const normalizedName = normalizeText(trimmedName);

    // Vérifier si le dossier existe déjà
    const existsResult = await checkFolderExists(normalizedName);
    if (existsResult.error) {
      return { success: false, error: existsResult.error };
    }

    if (existsResult.exists) {
      return { success: false, error: "Un dossier avec ce nom existe déjà" };
    }

    // Créer le dossier
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

/**
 * Charger tous les dossiers de l'utilisateur connecté
 */
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

/**
 * Supprimer un dossier de l'utilisateur connecté
 */
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

    // Normaliser le nom du dossier pour la suppression
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
