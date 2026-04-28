import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { isMfaEnabledInPreferences } from "../lib/mfaPreferences";
import { SupabaseError } from "../lib/errorUtils";

import * as Sentry from "@sentry/react";

interface SessionWithAal extends Session {
  aal?: "aal1" | "aal2";
}

interface AuthResult {
  success: boolean;
  error?: string | SupabaseError;
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
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<{
    factorId: string;
    challengeId: string;
  } | null>(null);
  const [isMfaRequired, setIsMfaRequired] = useState(false);

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
      // Capture Sentry
      Sentry.captureException(error, {
        tags: {
          action: "signup",
          error_type: error.code || "unknown",
        },
        extra: {
          email, // OK car c'est l'email de l'utilisateur qui s'inscrit
          isAlreadyRegistered: error.message?.includes(
            "User already registered"
          ),
        },
      });

      if (error.message && error.message.includes("User already registered")) {
        return {
          success: false,
          error: error.message || "Utilisateur déjà enregistré",
          isUserAlreadyExists: true,
        };
      }

      return {
        success: false,
        error: error.message || "Erreur lors de l'inscription",
      };
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
        Sentry.captureException(error, {
          tags: {
            action: "signin",
            error_type: error.code || "unknown",
          },
          extra: { email },
        });

        return {
          success: false,
          error: error.message || "Erreur de connexion",
        };
      }


      const { data: factors } = await supabase.auth.mfa.listFactors();


      if (
        factors?.all &&
        factors.all.length > 0 &&
        isMfaEnabledInPreferences()
      ) {
        const aal = (data.session as SessionWithAal)?.aal;

        // Si pas AAL2, alors MFA requis (peu importe si aal1, undefined, etc.)
        if (aal !== "aal2") {
          const factor = factors.all[0];


          const { data: challenge } = await supabase.auth.mfa.challenge({
            factorId: factor.id,
          });

          if (challenge) {

            setIsMfaRequired(true);

            setMfaChallenge({
              factorId: factor.id,
              challengeId: challenge.id,
            });

            return {
              success: false,
              requiresMfa: true,
              message: "Code d'authentification requis",
            };
          }
        }
      }

      // Si on arrive ici sans session, c'est que MFA est requis
      if (
        !data.session &&
        data.user &&
        factors?.all &&
        factors.all.length > 0
      ) {
        const factor = factors.all[0];
        const { data: challenge } = await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

        if (challenge) {
          setMfaChallenge({
            factorId: factor.id,
            challengeId: challenge.id,
          });

          return {
            success: false,
            requiresMfa: true,
            message: "Code d'authentification requis",
          };
        }
      }

      return { success: true, data };
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          action: "signin",
          error_type: "unexpected",
        },
        extra: { email },
      });

      return { success: false, error: "Erreur de connexion" };
    }
  };


  const verifyMfaAndSignIn = async (code: string) => {
    if (!mfaChallenge) {
      return { success: false, error: "Aucun défi MFA en cours" };
    }

    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: mfaChallenge.factorId,
        challengeId: mfaChallenge.challengeId,
        code: code,
      });

      if (error) {
        Sentry.captureException(error, {
          tags: {
            action: "mfa_verify",
            error_type: error.code || "unknown",
          },
        });

        return {
          success: false,
          error: error.message || "Erreur de vérification MFA",
        };
      }


      setMfaChallenge(null);
      setIsMfaRequired(false);

      return { success: true, data };
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          action: "mfa_verify",
          error_type: "unexpected",
        },
      });

      return { success: false, error: "Erreur de vérification MFA" };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
        Sentry.captureException(error, {
          tags: { action: "signout" },
        });

        return {
          success: false,
          error: error.message || "Erreur de déconnexion",
        };
      }
      return { success: true };
    } catch (error) {
      Sentry.captureException(error, {
        tags: { action: "signout", error_type: "unexpected" },
      });

      return { success: false, error: "Erreur de déconnexion" };
    }
  };

  // Update Password
  const updatePassword = async (
    _currentPassword: string,
    newPassword: string
  ) => {
    try {
      if (!session?.user?.email) {
        return { success: false, error: "Utilisateur non connecté" };
      }


      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasMfa = factors?.all && factors.all.length > 0;
      const isMfaEnabledByUser = isMfaEnabledInPreferences();


      if (
        hasMfa &&
        isMfaEnabledByUser &&
        (session as SessionWithAal).aal !== "aal2"
      ) {
        return {
          success: false,
          error:
            "Veuillez vous reconnecter avec votre code d'authentification pour modifier votre mot de passe",
          requiresReauth: true,
        };
      }






      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Sentry.captureException(updateError, {
          tags: {
            action: "update_password",
            requires_reauth: (session as SessionWithAal).aal !== "aal2",
          },
        });


        if (updateError.message?.includes("invalid")) {
          return { success: false, error: "Mot de passe actuel incorrect" };
        }

        return {
          success: false,
          error: "Erreur lors de la mise à jour du mot de passe",
        };
      }

      return { success: true };
    } catch (error) {
      Sentry.captureException(error, {
        tags: { action: "update_password", error_type: "unexpected" },
      });

      return { success: false, error: "Une erreur est survenue" };
    }
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UserAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
