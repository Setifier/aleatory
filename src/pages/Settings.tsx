import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import ProfileSection from "../components/settings/ProfileSection";
import SecuritySection from "../components/settings/SecuritySection";
import SessionSection from "../components/settings/SessionSection";
import AdvancedActionsSection from "../components/settings/AdvancedActionsSection";
import EmailConfirmationModal from "../components/settings/EmailConfirmationModal";

const Settings = () => {
  const auth = UserAuth();
  const navigate = useNavigate();
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<{
    oldEmail: string;
    newEmail: string;
    expiresAt: number;
  } | null>(null);

  const handleSignOut = async () => {
    try {
      const result = await auth?.signOut();
      if (result?.success) {
        navigate("/signin");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleEmailChangeRequested = (pendingData: {
    oldEmail: string;
    newEmail: string;
    expiresAt: number;
  }) => {
    setPendingEmailChange(pendingData);
    savePendingEmailChange(pendingData);
    setShowEmailConfirmModal(true);
  };

  // Fonctions pour gérer la persistance
  const savePendingEmailChange = (data: typeof pendingEmailChange) => {
    if (data) {
      localStorage.setItem("pendingEmailChange", JSON.stringify(data));
    } else {
      localStorage.removeItem("pendingEmailChange");
    }
  };

  const loadPendingEmailChange = () => {
    try {
      const saved = localStorage.getItem("pendingEmailChange");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const checkEmailConfirmations = useCallback(() => {
    if (!pendingEmailChange || !auth?.session?.user) return;

    const currentEmail = auth.session.user.email;
    const { newEmail, expiresAt } = pendingEmailChange;

    // Vérifier si le délai d'attente est dépassé (24h)
    if (Date.now() > expiresAt) {
      setPendingEmailChange(null);
      savePendingEmailChange(null);
      return;
    }

    // Si l'email actuel correspond au nouvel email, le changement a réussi
    if (currentEmail === newEmail) {
      setPendingEmailChange(null);
      savePendingEmailChange(null);
    }
  }, [pendingEmailChange, auth?.session?.user]);

  // Charger le changement d'email en attente au démarrage
  useEffect(() => {
    const savedPending = loadPendingEmailChange();
    if (savedPending) {
      setPendingEmailChange(savedPending);
    }
  }, []);

  // Surveiller les changements d'email
  useEffect(() => {
    if (!pendingEmailChange) return;

    // Vérifier immédiatement
    checkEmailConfirmations();

    // Puis surveiller périodiquement
    const interval = setInterval(() => {
      checkEmailConfirmations();
    }, 5000); // Vérifier toutes les 5 secondes

    return () => clearInterval(interval);
  }, [pendingEmailChange, checkEmailConfirmations]);

  // Surveiller les changements d'authentification
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        checkEmailConfirmations();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkEmailConfirmations]);

  // Si pas connecté, afficher un message
  if (!auth?.session) {
    return (
      <div className="bg-secondary-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg border max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder aux paramètres.
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-50 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-gray-700">
              Accueil
            </Link>
            <span>→</span>
            <span>Paramètres</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        </div>

        {/* Profile Section */}
        <ProfileSection onEmailChangeRequested={handleEmailChangeRequested} />

        {/* Security Section */}
        <SecuritySection />

        {/* Session Section */}
        <SessionSection onSignOut={handleSignOut} />

        {/* Advanced Actions Section */}
        <AdvancedActionsSection />

        {/* Email Confirmation Modal */}
        {pendingEmailChange && (
          <EmailConfirmationModal
            isOpen={showEmailConfirmModal}
            onClose={() => setShowEmailConfirmModal(false)}
            pendingEmailChange={pendingEmailChange}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
