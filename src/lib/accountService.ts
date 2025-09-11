import { supabase } from "./supabaseClient";

export interface ScheduleDeletionResult {
  success: boolean;
  error?: string;
  scheduledDate?: Date;
}

export interface CancelDeletionResult {
  success: boolean;
  error?: string;
}

export interface DeleteAccountData {
  password: string;
  confirmationText: string;
}

/**
 * Programmer la suppression du compte dans 7 jours
 */
export const scheduleAccountDeletion = async (
  password: string,
  confirmationText: string
): Promise<ScheduleDeletionResult> => {
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "Utilisateur non connecté" };
    }

    // Vérifier le mot de passe en tentant une réauthentification
    if (!user.email) {
      return { success: false, error: "Email utilisateur introuvable" };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    });

    if (signInError) {
      return { success: false, error: "Mot de passe incorrect" };
    }

    // Vérifier le texte de confirmation
    if (confirmationText.toUpperCase() !== "SUPPRIMER") {
      return { success: false, error: "Texte de confirmation incorrect" };
    }

    // Appeler la fonction Supabase pour programmer la suppression
    const { data, error } = await supabase.rpc('schedule_account_deletion');

    if (error) {
      console.error("Erreur fonction schedule_account_deletion:", error);
      return { 
        success: false, 
        error: "Erreur lors de la programmation de la suppression" 
      };
    }

    if (!data?.success) {
      return { 
        success: false, 
        error: data?.error || "Erreur lors de la programmation" 
      };
    }

    return { 
      success: true, 
      scheduledDate: new Date(data.scheduled_date)
    };

  } catch (error) {
    console.error("Erreur programmation suppression:", error);
    return { 
      success: false, 
      error: "Erreur inattendue lors de la programmation" 
    };
  }
};

/**
 * Annuler la suppression programmée du compte
 */
export const cancelAccountDeletion = async (): Promise<CancelDeletionResult> => {
  try {
    // Appeler la fonction Supabase pour annuler la suppression
    const { data, error } = await supabase.rpc('cancel_account_deletion');

    if (error) {
      console.error("Erreur fonction cancel_account_deletion:", error);
      return { 
        success: false, 
        error: "Erreur lors de l'annulation" 
      };
    }

    if (!data?.success) {
      return { 
        success: false, 
        error: data?.error || "Erreur lors de l'annulation" 
      };
    }

    return { success: true };

  } catch (error) {
    console.error("Erreur annulation suppression:", error);
    return { 
      success: false, 
      error: "Erreur inattendue lors de l'annulation" 
    };
  }
};

/**
 * Vérifier si le compte est programmé pour suppression
 */
export const getAccountDeletionStatus = async (): Promise<{
  isScheduledForDeletion: boolean;
  scheduledDate?: Date;
  daysRemaining?: number;
}> => {
  try {
    // Appeler la fonction Supabase pour récupérer le statut
    const { data, error } = await supabase.rpc('get_deletion_status');

    if (error) {
      console.error("Erreur fonction get_deletion_status:", error);
      return { isScheduledForDeletion: false };
    }

    if (!data?.success) {
      console.error("Erreur récupération statut:", data?.error);
      return { isScheduledForDeletion: false };
    }

    if (!data.is_scheduled) {
      return { isScheduledForDeletion: false };
    }

    return {
      isScheduledForDeletion: true,
      scheduledDate: new Date(data.scheduled_date),
      daysRemaining: Math.max(0, data.days_remaining)
    };
  } catch (error) {
    console.error("Erreur vérification statut suppression:", error);
    return { isScheduledForDeletion: false };
  }
};

/**
 * Valider les données de suppression de compte
 */
export const validateDeleteAccountData = (data: DeleteAccountData): string | null => {
  if (!data.password.trim()) {
    return "Le mot de passe est requis";
  }

  if (data.password.length < 8) {
    return "Mot de passe trop court";
  }

  if (data.confirmationText.toUpperCase() !== "SUPPRIMER") {
    return "Veuillez taper exactement 'SUPPRIMER' pour confirmer";
  }

  return null;
};