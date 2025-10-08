import { supabase } from "./supabaseClient";
import { normalizeText } from "./textUtils";
import { logSupabaseError } from "./logger";
import * as Sentry from "@sentry/react";

// Type pour la relation item_folders depuis Supabase
export type ItemFolderRelation = {
  folder_id: number;
};

// Type pour les données brutes venant de Supabase avec les jointures
export type SavedItemRaw = {
  id: number;
  user_id: string;
  item_name: string;
  folder_id?: number | null; // Gardé pour compatibilité mais deprecated
  created_at: string;
  item_folders?: ItemFolderRelation[]; // Relations depuis la jointure
};

// Type final exposé par l'API
export type SavedItem = {
  id: number;
  user_id: string;
  item_name: string;
  folder_id?: number | null; // Gardé pour compatibilité mais deprecated
  folder_ids?: number[]; // Nouveau: array des dossiers
  created_at: string;
};

// Vérifier si un item existe déjà
export const checkItemExists = async (
  itemName: string
): Promise<{ exists: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { exists: false, error: "Utilisateur non connecté" };
    }

    // Normaliser le nom de l'item pour la comparaison
    const normalizedName = normalizeText(itemName);

    const { data, error } = await supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_name", normalizedName)
      .limit(1);

    if (error) {
      logSupabaseError("vérification existence item", error);
      return { exists: false, error: error.message };
    }

    return { exists: data && data.length > 0 };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);

    Sentry.captureException(error, {
      tags: {
        service: 'savedItems',
        action: 'checkExists'
      },
      extra: { itemName }
    });

    return { exists: false, error: "Erreur inattendue" };
  }
};

// Sauvegarder un item
export const saveItem = async (
  itemName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    // Normaliser le nom de l'item
    const normalizedName = normalizeText(itemName);

    // Vérifier si l'item existe déjà (avec le nom normalisé)
    const existsResult = await checkItemExists(normalizedName);
    if (existsResult.error) {
      return { success: false, error: existsResult.error };
    }
    
    if (existsResult.exists) {
      return { success: false, error: `"${normalizedName}" est déjà enregistré` };
    }

    const { error } = await supabase
      .from("saved_items")
      .insert([
        {
          user_id: user.id,
          item_name: normalizedName,
        },
      ])
      .select();

    if (error) {
      logSupabaseError("sauvegarde item", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);

    Sentry.captureException(error, {
      tags: {
        service: 'savedItems',
        action: 'save'
      },
      extra: { itemName }
    });

    return { success: false, error: "Erreur inattendue" };
  }
};

// Charger les items de l'utilisateur avec leurs dossiers
export const loadUserItems = async (): Promise<{
  items: SavedItem[];
  error?: string;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { items: [], error: "Utilisateur non connecté" };
    }

    // Charger les items avec leurs relations de dossiers
    const { data, error } = await supabase
      .from("saved_items")
      .select(`
        *,
        item_folders (
          folder_id
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logSupabaseError("chargement items utilisateur", error);
      return { items: [], error: error.message };
    }

    // Transformer les données pour inclure folder_ids avec types corrects
    const itemsWithFolders: SavedItem[] = (data as SavedItemRaw[] || []).map(item => ({
      ...item,
      folder_ids: (item.item_folders || []).map((rel: ItemFolderRelation) => rel.folder_id)
    }));

    return { items: itemsWithFolders };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);

    Sentry.captureException(error, {
      tags: {
        service: 'savedItems',
        action: 'load'
      }
    });

    return { items: [], error: "Erreur inattendue" };
  }
};

// Supprimer un item
export const deleteItem = async (
  itemName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    // Normaliser le nom de l'item pour la suppression
    const normalizedName = normalizeText(itemName);

    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_name", normalizedName);

    if (error) {
      logSupabaseError("suppression item", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logSupabaseError("erreur inattendue", error);

    Sentry.captureException(error, {
      tags: {
        service: 'savedItems',
        action: 'delete'
      },
      extra: { itemName }
    });

    return { success: false, error: "Erreur inattendue" };
  }
};

// Toggle d'assignation item-dossier (ajouter ou retirer)
export const toggleItemFolder = async (
  itemId: number,
  folderId: number,
  shouldAssign: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    if (shouldAssign) {
      // Ajouter la relation
      const { error } = await supabase
        .from("item_folders")
        .insert({
          item_id: itemId,
          folder_id: folderId,
          user_id: user.id
        });

      if (error) {
        // Si l'erreur est due à une contrainte unique, c'est OK
        if (error.code === '23505') {
          return { success: true };
        }
        logSupabaseError("insertion relation item-dossier", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } else {
      // Supprimer la relation
      const { error } = await supabase
        .from("item_folders")
        .delete()
        .eq("item_id", itemId)
        .eq("folder_id", folderId)
        .eq("user_id", user.id);

      if (error) {
        logSupabaseError("suppression relation item-dossier", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    }
  } catch (error) {
    logSupabaseError("erreur inattendue", error);

    Sentry.captureException(error, {
      tags: {
        service: 'savedItems',
        action: 'toggleFolder'
      },
      extra: { itemId, folderId, shouldAssign }
    });

    return { success: false, error: "Erreur inattendue" };
  }
};

// Assigner un item à un dossier (fonction legacy, garde pour compatibilité)
export const assignItemToFolder = async (
  itemId: number,
  folderId: number | null
): Promise<{ success: boolean; error?: string }> => {
  if (folderId === null) {
    // Pour décocher, on ne fait rien car on utilise maintenant toggleItemFolder
    return { success: true };
  }

  return toggleItemFolder(itemId, folderId, true);
};

// Obtenir les items d'un dossier spécifique (nouvelle version avec item_folders)
export const getItemsByFolder = async (
  folderId: number | null
): Promise<{ success: boolean; error?: string; items?: SavedItem[] }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    if (folderId === null) {
      // Récupérer les items sans dossier (pas dans item_folders)
      const { data, error } = await supabase
        .from("saved_items")
        .select(`
          *,
          item_folders!left (
            folder_id
          )
        `)
        .eq("user_id", user.id)
        .is("item_folders.folder_id", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur récupération items sans dossier:", error);
        logSupabaseError("récupération items sans dossier", error);

        Sentry.captureException(error, {
          tags: {
            service: 'savedItems',
            action: 'getByFolder',
            folderType: 'none'
          }
        });

        return { success: false, error: error.message };
      }

      return { success: true, items: data || [] };
    } else {
      // Récupérer les items d'un dossier spécifique via item_folders
      const { data, error } = await supabase
        .from("saved_items")
        .select(`
          *,
          item_folders!inner (
            folder_id
          )
        `)
        .eq("user_id", user.id)
        .eq("item_folders.folder_id", folderId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur récupération items par dossier:", error);
        logSupabaseError("récupération items par dossier", error);

        Sentry.captureException(error, {
          tags: {
            service: 'savedItems',
            action: 'getByFolder',
            folderId
          }
        });

        return { success: false, error: error.message };
      }

      return { success: true, items: data || [] };
    }
  } catch (error) {
    logSupabaseError("erreur inattendue", error);

    Sentry.captureException(error, {
      tags: {
        service: 'savedItems',
        action: 'getByFolder'
      },
      extra: { folderId }
    });

    return { success: false, error: "Erreur inattendue" };
  }
};
