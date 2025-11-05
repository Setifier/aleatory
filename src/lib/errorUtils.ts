export type SupabaseError = {
  message: string;
  status?: number;
  code?: string;
};

export const getErrorMessage = (error: string | SupabaseError): string => {
  if (typeof error === "string") {
    return error;
  }
  return error.message;
};
