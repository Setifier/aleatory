import { supabase } from "./supabaseClient";

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

/**
 * Supprimer le compte immédiatement via la fonction SQL
 */
export const deleteAccountImmediately =
  async (): Promise<DeleteAccountResult> => {
    try {
      // ✅ Appeler directement la fonction SQL
      const { data, error } = await supabase.rpc("delete_own_account");

      if (error) {
        console.error("Erreur suppression:", error);
        return {
          success: false,
          error: "Erreur lors de la suppression du compte",
        };
      }

      if (!data?.success) {
        return {
          success: false,
          error: data?.error || "Erreur lors de la suppression",
        };
      }

      return { success: true };
    } catch (err) {
      console.error("Erreur inattendue:", err);
      return {
        success: false,
        error: "Erreur inattendue lors de la suppression",
      };
    }
  };
