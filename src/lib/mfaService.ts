import { supabase } from "./supabaseClient";

export interface MfaFactor {
  id: string;
  type: 'totp';
  status: 'verified' | 'unverified';
  created_at: string;
  friendly_name?: string;
}

export interface EnrollTotpResult {
  success: boolean;
  factor?: MfaFactor;
  qrCode?: string;
  secret?: string;
  error?: string;
}

export interface VerifyTotpResult {
  success: boolean;
  error?: string;
}

/**
 * Récupérer tous les facteurs MFA de l'utilisateur
 */
export const getUserMfaFactors = async (): Promise<{
  factors: MfaFactor[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    
    if (error) {
      // Error logged for debugging
      return { factors: [], error: error.message };
    }

    return { 
      factors: (data.all || []).map(factor => ({
        id: factor.id,
        type: 'totp' as const,
        status: factor.status,
        created_at: factor.created_at,
        friendly_name: factor.friendly_name
      }))
    };
  } catch (error) {
    // Error logged for debugging
    return { factors: [], error: "Erreur inattendue" };
  }
};

/**
 * Inscrire un nouveau facteur TOTP (Google Authenticator)
 */
export const enrollTotp = async (friendlyName?: string): Promise<EnrollTotpResult> => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: friendlyName || 'Authenticator App'
    });

    if (error) {
      // Error logged for debugging
      return { success: false, error: error.message };
    }

    return {
      success: true,
      factor: {
        id: data.id,
        type: 'totp' as const,
        status: 'unverified' as const,
        created_at: new Date().toISOString(),
        friendly_name: data.friendly_name
      },
      qrCode: data.totp?.qr_code,
      secret: data.totp?.secret
    };
  } catch (error) {
    // Error logged for debugging
    return { success: false, error: "Erreur inattendue" };
  }
};

/**
 * Vérifier un code TOTP pour finaliser l'inscription
 */
export const verifyTotpEnrollment = async (
  factorId: string, 
  code: string
): Promise<VerifyTotpResult> => {
  try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    });

    if (error) {
      // Error logged for debugging
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    // Error logged for debugging
    return { success: false, error: "Erreur inattendue" };
  }
};

/**
 * Supprimer un facteur MFA
 */
export const unenrollMfaFactor = async (factorId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      // Error logged for debugging
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    // Error logged for debugging
    return { success: false, error: "Erreur inattendue" };
  }
};

/**
 * Créer un défi MFA pour la connexion
 */
export const createMfaChallenge = async (factorId: string): Promise<{
  success: boolean;
  challengeId?: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });

    if (error) {
      // Error logged for debugging
      return { success: false, error: error.message };
    }

    return { success: true, challengeId: data.id };
  } catch (error) {
    // Error logged for debugging
    return { success: false, error: "Erreur inattendue" };
  }
};

/**
 * Vérifier un code MFA lors de la connexion
 */
export const verifyMfaCode = async (
  factorId: string,
  challengeId: string, 
  code: string
): Promise<VerifyTotpResult> => {
  try {
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });

    if (error) {
      // Error logged for debugging
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    // Error logged for debugging
    return { success: false, error: "Erreur inattendue" };
  }
};