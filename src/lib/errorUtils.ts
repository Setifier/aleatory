// Type pour les erreurs Supabase
export type SupabaseError = {
  message: string;
  status?: number;
  code?: string;
};

// Helper pour extraire le message d'une erreur
export const getErrorMessage = (error: string | SupabaseError): string => {
  if (typeof error === "string") {
    return error;
  }
  return error.message;
};
