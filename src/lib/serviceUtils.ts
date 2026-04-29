import * as Sentry from "@sentry/react";
import { logSupabaseError } from "./logger";
import { supabase } from "./supabaseClient";

// Postgres unique violation error code
export const PG_UNIQUE_VIOLATION = "23505";

export type ServiceResult<T = void> = T extends void
  ? { success: boolean; error?: string }
  : { success: boolean; error?: string } & ({ success: true } & T | { success: false });

// Returns the authenticated user or null
export const getAuthUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Centralized Supabase/Sentry error reporter for service functions
export const handleServiceError = (
  context: string,
  service: string,
  action: string,
  error: unknown,
  extra?: Record<string, unknown>
): { success: false; error: string } => {
  logSupabaseError(context, error);
  Sentry.captureException(error, {
    tags: { service, action },
    extra,
  });
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unexpected error",
  };
};
