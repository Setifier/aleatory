import { supabase } from "./supabaseClient";
import { normalizeText } from "./textUtils";
import { logSupabaseError } from "./logger";
import * as Sentry from "@sentry/react";

export type ItemFolderRelation = {
  folder_id: number;
};

export type SavedItemRaw = {
  id: number;
  user_id: string;
  item_name: string;
  folder_id?: number | null;
  created_at: string;
  item_folders?: ItemFolderRelation[];
};

export type SavedItem = {
  id: number;
  user_id: string;
  item_name: string;
  folder_id?: number | null;
  folder_ids?: number[];
  created_at: string;
};

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

    const normalizedName = normalizeText(itemName);
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
      const { error } = await supabase
        .from("item_folders")
        .insert({
          item_id: itemId,
          folder_id: folderId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          return { success: true };
        }
        logSupabaseError("insertion relation item-dossier", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } else {
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

export const assignItemToFolder = async (
  itemId: number,
  folderId: number | null
): Promise<{ success: boolean; error?: string }> => {
  if (folderId === null) {
    return { success: true };
  }

  return toggleItemFolder(itemId, folderId, true);
};

export const getItemsByFolder = async (
  folderId: number | null
): Promise<{ success: boolean; error?: string; items?: SavedItem[] }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    if (folderId === null) {
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
