import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { isMfaEnabledInPreferences } from "../lib/mfaPreferences";
import { getAccountDeletionStatus } from "../lib/accountService";

interface SessionWithAal extends Session {
  aal?: 'aal1' | 'aal2';
}

interface AuthResult {
  success: boolean;
  error?: string | Error;
  data?: unknown;
  needsEmailConfirmation?: boolean | null;
  requiresMfa?: boolean;
  message?: string;
  requiresReauth?: boolean;
  isUserAlreadyExists?: boolean;
}

interface AuthContextType {
  session: Session | null;
  signUpNewUser: (
    email: string,
    password: string,
    pseudo?: string
  ) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  signInUser: (email: string, password: string) => Promise<AuthResult>;
  mfaChallenge: { factorId: string; challengeId: string } | null;
  verifyMfaAndSignIn: (code: string) => Promise<AuthResult>;
  isMfaRequired: boolean;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  // Suppression de compte
  isAccountScheduledForDeletion: boolean;
  accountDeletionDate?: Date;
  accountDeletionDaysRemaining?: number;
  refreshDeletionStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<{ factorId: string; challengeId: string } | null>(null);
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  
  // États pour la suppression de compte
  const [isAccountScheduledForDeletion, setIsAccountScheduledForDeletion] = useState(false);
  const [accountDeletionDate, setAccountDeletionDate] = useState<Date | undefined>(undefined);
  const [accountDeletionDaysRemaining, setAccountDeletionDaysRemaining] = useState<number | undefined>(undefined);

  // Sign Up
  const signUpNewUser = async (
    email: string,
    password: string,
    pseudo?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          pseudo: pseudo, // Stockage du pseudo dans user_metadata
        },
      },
    });

    if (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);

      // Vérifier si c'est une erreur "User already registered"
      if (error.message && error.message.includes("User already registered")) {
        return {
          success: false,
          error: error.message || "Utilisateur déjà enregistré",
          isUserAlreadyExists: true
        };
      }

      return { success: false, error: error.message || "Erreur lors de l'inscription" };
    }

    return {
      success: true,
      data,
      needsEmailConfirmation: !data.session && !!data.user,
    };
  };

  // Sign In
  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Erreur lors de la connexion:", error);
        return { success: false, error };
      }

      // Vérifier d'abord si l'utilisateur a des facteurs MFA
      const { data: factors } = await supabase.auth.mfa.listFactors();

      // Si l'utilisateur a des facteurs MFA ET que MFA est activé dans les préférences
      if (factors?.all && factors.all.length > 0 && isMfaEnabledInPreferences()) {
        const aal = (data.session as SessionWithAal)?.aal;
        
        // Si pas AAL2, alors MFA requis (peu importe si aal1, undefined, etc.)
        if (aal !== 'aal2') {
          const factor = factors.all[0];
          
          // IMPORTANT: Créer le challenge AVANT de se déconnecter
          const { data: challenge } = await supabase.auth.mfa.challenge({ 
            factorId: factor.id 
          });
          
          if (challenge) {
            // Marquer MFA comme requis AVANT de définir le challenge
            setIsMfaRequired(true);
            
            setMfaChallenge({
              factorId: factor.id,
              challengeId: challenge.id
            });
            
            return { 
              success: false, 
              requiresMfa: true,
              message: "Code d'authentification requis"
            };
          } else {
            console.error("Impossible de créer le challenge MFA");
          }
        }
      }

      // Si on arrive ici sans session, c'est que MFA est requis
      if (!data.session && data.user && factors?.all && factors.all.length > 0) {
        const factor = factors.all[0];
        const { data: challenge } = await supabase.auth.mfa.challenge({ 
          factorId: factor.id 
        });
        
        if (challenge) {
          setMfaChallenge({
            factorId: factor.id,
            challengeId: challenge.id
          });
          
          return { 
            success: false, 
            requiresMfa: true,
            message: "Code d'authentification requis"
          };
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return { success: false, error: "Erreur de connexion" };
    }
  };

  // Vérifier le code MFA et finaliser la connexion
  const verifyMfaAndSignIn = async (code: string) => {
    if (!mfaChallenge) {
      return { success: false, error: "Aucun défi MFA en cours" };
    }

    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: mfaChallenge.factorId,
        challengeId: mfaChallenge.challengeId,
        code: code
      });

      if (error) {
        console.error("Erreur vérification MFA:", error);
        return { success: false, error };
      }

      // Réinitialiser le challenge MFA et l'état
      setMfaChallenge(null);
      setIsMfaRequired(false);
      
      return { success: true, data };
    } catch (error) {
      console.error("Erreur lors de la vérification MFA:", error);
      return { success: false, error: "Erreur de vérification MFA" };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign Out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
        return { success: false, error };
      }
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      return { success: false, error: "Erreur de déconnexion" };
    }
  };

  // Update Password
  const updatePassword = async (_currentPassword: string, newPassword: string) => {
    try {
      if (!session?.user?.email) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      // Vérifier si l'utilisateur a des facteurs MFA ET si MFA est activé dans les préférences
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasMfa = factors?.all && factors.all.length > 0;
      const isMfaEnabledByUser = isMfaEnabledInPreferences();
      
      // Si MFA activé ET préférence utilisateur MFA activée, vérifier le niveau AAL
      if (hasMfa && isMfaEnabledByUser && (session as SessionWithAal).aal !== 'aal2') {
        return { 
          success: false, 
          error: "Veuillez vous reconnecter avec votre code d'authentification pour modifier votre mot de passe",
          requiresReauth: true 
        };
      }

      // D'abord, vérifier le mot de passe actuel
      // On ne peut pas utiliser signInWithPassword car cela créerait une nouvelle session
      // On va plutôt faire une vérification différente si nécessaire
      
      // Tenter la mise à jour directement
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
        
        // Si erreur liée à la vérification du mot de passe actuel
        if (updateError.message?.includes('invalid')) {
          return { success: false, error: "Mot de passe actuel incorrect" };
        }
        
        return { success: false, error: "Erreur lors de la mise à jour du mot de passe" };
      }

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      return { success: false, error: "Une erreur est survenue" };
    }
  };

  // Rafraîchir le statut de suppression de compte
  const refreshDeletionStatus = useCallback(async () => {
    if (session) {
      const status = await getAccountDeletionStatus();
      setIsAccountScheduledForDeletion(status.isScheduledForDeletion);
      setAccountDeletionDate(status.scheduledDate);
      setAccountDeletionDaysRemaining(status.daysRemaining);
    } else {
      // Reset si pas de session
      setIsAccountScheduledForDeletion(false);
      setAccountDeletionDate(undefined);
      setAccountDeletionDaysRemaining(undefined);
    }
  }, [session]);

  // Rafraîchir le statut de suppression lors du changement de session
  useEffect(() => {
    refreshDeletionStatus();
  }, [session, refreshDeletionStatus]);

  return (
    <AuthContext.Provider
      value={{ 
        session, 
        signUpNewUser, 
        signOut, 
        signInUser, 
        mfaChallenge, 
        verifyMfaAndSignIn, 
        isMfaRequired, 
        updatePassword,
        isAccountScheduledForDeletion,
        accountDeletionDate,
        accountDeletionDaysRemaining,
        refreshDeletionStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('UserAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
