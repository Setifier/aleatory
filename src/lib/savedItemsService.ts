import { supabase } from "./supabaseClient";

export type SavedItem = {
  id: number;
  user_id: string;
  item_name: string;
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

    const { data, error } = await supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_name", itemName)
      .limit(1);

    if (error) {
      console.error("Erreur vérification:", error);
      return { exists: false, error: error.message };
    }

    return { exists: data && data.length > 0 };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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

    const { data, error } = await supabase
      .from("saved_items")
      .insert([
        {
          user_id: user.id,
          item_name: itemName,
        },
      ])
      .select();

    if (error) {
      console.error("Erreur sauvegarde:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { success: false, error: "Erreur inattendue" };
  }
};

// Charger les items de l'utilisateur
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
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement:", error);
      return { items: [], error: error.message };
    }

    return { items: data || [] };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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

    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_name", itemName);

    if (error) {
      console.error("Erreur suppression:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { success: false, error: "Erreur inattendue" };
  }
};
