import { supabase } from "./supabaseClient";

// Fonction utilitaire pour normaliser le texte (comme pour les items)
const normalizeText = (text: string): string => {
  return (
    text
      // Réduire les espaces multiples à un seul espace
      .replace(/\s+/g, " ")
      // Supprimer les espaces en début et fin
      .trim()
      // Convertir tout en minuscules d'abord
      .toLowerCase()
      // Mettre en majuscule la première lettre de chaque mot (sauf après un tiret)
      .replace(/(?:^|\s)([a-z])/g, (match, letter) =>
        match.replace(letter, letter.toUpperCase())
      )
  );
};

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
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Aucun résultat trouvé, le dossier n'existe pas
        return { exists: false };
      }
      console.error("Erreur vérification dossier:", error);
      return { exists: false, error: error.message };
    }

    return { exists: !!data };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
      console.error("Erreur création dossier:", error);
      return { success: false, error: error.message };
    }

    return { success: true, folder: data };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
      console.error("Erreur chargement dossiers:", error);
      return { success: false, error: error.message, folders: [] };
    }

    return { success: true, folders: data || [] };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
      console.error("Erreur suppression dossier:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { success: false, error: "Erreur inattendue" };
  }
};
