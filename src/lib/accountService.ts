import { supabase } from "./supabaseClient";
import { logSupabaseError } from "./logger";

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

export const deleteAccountImmediately =
  async (): Promise<DeleteAccountResult> => {
    try {
      const { data, error } = await supabase.rpc("delete_own_account");

      if (error) {
        logSupabaseError("delete_own_account", error);
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
      logSupabaseError("delete_own_account (unexpected)", err);
      return {
        success: false,
        error: "Erreur inattendue lors de la suppression",
      };
    }
  };
