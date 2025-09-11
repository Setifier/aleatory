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
  factor?: any;
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
      console.error("Erreur récupération facteurs MFA:", error);
      return { factors: [], error: error.message };
    }

    return { factors: data.all || [] };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
      console.error("Erreur enrollment TOTP:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      factor: data,
      qrCode: data.totp?.qr_code,
      secret: data.totp?.secret
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    });

    if (error) {
      console.error("Erreur vérification TOTP:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
      console.error("Erreur suppression facteur MFA:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
      console.error("Erreur création défi MFA:", error);
      return { success: false, error: error.message };
    }

    return { success: true, challengeId: data.id };
  } catch (error) {
    console.error("Erreur inattendue:", error);
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
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });

    if (error) {
      console.error("Erreur vérification MFA:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { success: false, error: "Erreur inattendue" };
  }
};