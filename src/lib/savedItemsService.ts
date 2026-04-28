import { supabase } from "./supabaseClient";
import { normalizeText } from "./textUtils";
import { getAuthUser, handleServiceError, PG_UNIQUE_VIOLATION } from "./serviceUtils";
import { logSupabaseError } from "./logger";

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

const mapRawItem = (item: SavedItemRaw): SavedItem => ({
  ...item,
  folder_ids: (item.item_folders ?? []).map((r) => r.folder_id),
});

export const saveItem = async (
  itemName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const name = normalizeText(itemName);

    const { data: existing } = await supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_name", name)
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, error: `"${name}" is already saved` };
    }

    const { error } = await supabase
      .from("saved_items")
      .insert([{ user_id: user.id, item_name: name }]);

    if (error) {
      logSupabaseError("saveItem", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return handleServiceError("saveItem", "savedItems", "save", err, { itemName });
  }
};

export const loadUserItems = async (): Promise<{ items: SavedItem[]; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { items: [] };

    const { data, error } = await supabase
      .from("saved_items")
      .select("*, item_folders(folder_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logSupabaseError("loadUserItems", error);
      return { items: [], error: error.message };
    }

    return { items: (data as SavedItemRaw[] ?? []).map(mapRawItem) };
  } catch (err) {
    return { items: [], ...handleServiceError("loadUserItems", "savedItems", "load", err) };
  }
};

export const deleteItem = async (
  itemName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_name", normalizeText(itemName));

    if (error) {
      logSupabaseError("deleteItem", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return handleServiceError("deleteItem", "savedItems", "delete", err, { itemName });
  }
};

export const toggleItemFolder = async (
  itemId: number,
  folderId: number,
  shouldAssign: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    if (shouldAssign) {
      const { error } = await supabase
        .from("item_folders")
        .insert({ item_id: itemId, folder_id: folderId, user_id: user.id });

      // Duplicate entry is not an error — item already belongs to this folder
      if (error && error.code !== PG_UNIQUE_VIOLATION) {
        logSupabaseError("toggleItemFolder insert", error);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from("item_folders")
        .delete()
        .eq("item_id", itemId)
        .eq("folder_id", folderId)
        .eq("user_id", user.id);

      if (error) {
        logSupabaseError("toggleItemFolder delete", error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    return handleServiceError("toggleItemFolder", "savedItems", "toggleFolder", err, {
      itemId,
      folderId,
      shouldAssign,
    });
  }
};

// Upserts an item into saved_items and links it to a folder.
// Used for auto-save on draw — silently ignores duplicates.
export const autoSaveItemToFolder = async (
  itemName: string,
  folderId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const name = normalizeText(itemName);

    const { data: existing } = await supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_name", name)
      .limit(1);

    let itemId: number;

    if (existing && existing.length > 0) {
      itemId = existing[0].id;
    } else {
      const { data: newItem, error: insertError } = await supabase
        .from("saved_items")
        .insert([{ user_id: user.id, item_name: name }])
        .select("id")
        .single();

      if (insertError) {
        logSupabaseError("autoSaveItemToFolder insert", insertError);
        return { success: false, error: insertError.message };
      }
      itemId = newItem.id;
    }

    const { error: folderError } = await supabase
      .from("item_folders")
      .insert({ item_id: itemId, folder_id: folderId, user_id: user.id });

    if (folderError && folderError.code !== PG_UNIQUE_VIOLATION) {
      logSupabaseError("autoSaveItemToFolder link folder", folderError);
    }

    return { success: true };
  } catch (err) {
    return handleServiceError("autoSaveItemToFolder", "savedItems", "autoSave", err, {
      itemName,
      folderId,
    });
  }
};
