import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MfaManager from "../components/auth/MfaManager";
import ChangePasswordForm from "../components/auth/ChangePasswordForm";
import DeleteAccountModal from "../components/auth/DeleteAccountModal";
import CancelDeletionBanner from "../components/auth/CancelDeletionBanner";
import { UserAuth } from "../context/AuthContext";
import { formatAndValidatePseudo } from "../lib/pseudoUtils";
import { formatAndValidateEmail } from "../lib/emailUtils";
import { supabase } from "../lib/supabaseClient";

const Settings = () => {
  const auth = UserAuth();
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const [pseudoValue, setPseudoValue] = useState("");
  const [pseudoError, setPseudoError] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<{
    oldEmail: string,
    newEmail: string,
    expiresAt: number
  } | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleDeleteAccountSuccess = () => {
    // Rafraîchir le statut de suppression après programmation
    auth?.refreshDeletionStatus();
    setShowDeleteAccountModal(false);
  };

  const handleCancelDeletion = () => {
    // Rafraîchir le statut de suppression après annulation
    auth?.refreshDeletionStatus();
  };

  // Fonctions pour gérer la persistance
  const savePendingEmailChange = (data: typeof pendingEmailChange) => {
    if (data) {
      localStorage.setItem('pendingEmailChange', JSON.stringify(data));
    } else {
      localStorage.removeItem('pendingEmailChange');
    }
  };

  const loadPendingEmailChange = () => {
    try {
      const saved = localStorage.getItem('pendingEmailChange');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const checkEmailConfirmations = () => {
    if (!pendingEmailChange || !auth?.session?.user) return;

    const currentEmail = auth.session.user.email;
    const { newEmail, expiresAt } = pendingEmailChange;

    // Vérifier si le délai d'attente est dépassé (24h)
    if (Date.now() > expiresAt) {
      // Expiration - annuler le changement
      setPendingEmailChange(null);
      savePendingEmailChange(null);
      return;
    }

    // Si l'email actuel est le nouveau email, alors tout est confirmé
    if (currentEmail === newEmail) {
      // Changement terminé !
      setPendingEmailChange(null);
      savePendingEmailChange(null);
    }
  };



  // Charger l'état persistant au montage et écouter les changements auth
  useEffect(() => {
    const savedPending = loadPendingEmailChange();
    if (savedPending) {
      setPendingEmailChange(savedPending);
    }
  }, []);

  useEffect(() => {
    checkEmailConfirmations();
  }, [auth?.session?.user?.email]);

  // Timer pour vérifier l'expiration et mettre à jour l'affichage
  useEffect(() => {
    if (!pendingEmailChange) return;

    const interval = setInterval(() => {
      checkEmailConfirmations();
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [pendingEmailChange]);


  // Écouter les événements auth de Supabase pour détecter les confirmations
  useEffect(() => {
    if (!auth?.session) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        checkEmailConfirmations();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pendingEmailChange, auth?.session]);

  const handleStartEditPseudo = () => {
    const currentPseudo = auth?.session?.user?.user_metadata?.pseudo || "";
    setPseudoValue(currentPseudo);
    setPseudoError("");
    setIsEditingPseudo(true);
  };

  const handleCancelEditPseudo = () => {
    setIsEditingPseudo(false);
    setPseudoValue("");
    setPseudoError("");
  };

  const handleSavePseudo = async () => {
    const validation = formatAndValidatePseudo(pseudoValue);
    
    if (!validation.isValid) {
      setPseudoError(validation.error || "Pseudo invalide");
      return;
    }

    const currentPseudo = auth?.session?.user?.user_metadata?.pseudo || "";
    if (validation.formatted === currentPseudo) {
      setPseudoError("Le nouveau pseudo doit être différent");
      return;
    }

    try {
      // Utiliser la fonction updateUser de Supabase
      const { error } = await supabase.auth.updateUser({
        data: { pseudo: validation.formatted }
      });

      if (error) {
        setPseudoError("Erreur lors de la mise à jour");
        return;
      }

      setIsEditingPseudo(false);
      setPseudoValue("");
      setPseudoError("");
    } catch {
      setPseudoError("Une erreur est survenue");
    }
  };

  const handleStartEditEmail = () => {
    const currentEmail = auth?.session?.user?.email || "";
    setEmailValue(currentEmail);
    setEmailError("");
    setIsEditingEmail(true);
  };

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEmailValue("");
    setEmailError("");
  };

  const handleSaveEmail = async () => {
    const validation = formatAndValidateEmail(emailValue);
    
    if (!validation.isValid) {
      setEmailError(validation.error || "Email invalide");
      return;
    }

    const currentEmail = auth?.session?.user?.email || "";
    if (validation.formatted === currentEmail) {
      setEmailError("Le nouvel email doit être différent");
      return;
    }

    try {
      // Changer l'email avec Supabase nécessite une confirmation
      const { error } = await supabase.auth.updateUser({
        email: validation.formatted
      });

      if (error) {
        setEmailError("Erreur lors de la mise à jour");
        return;
      }

      setIsEditingEmail(false);
      setEmailValue("");
      setEmailError("");
      
      // Enregistrer les emails en attente et afficher la modale
      const pendingData = {
        oldEmail: currentEmail,
        newEmail: validation.formatted,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
      };
      setPendingEmailChange(pendingData);
      savePendingEmailChange(pendingData);
      setShowEmailConfirmModal(true);
    } catch {
      setEmailError("Une erreur est survenue");
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await auth?.signOut();
      if (result?.success) {
        window.location.href = '/signin';
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setShowSignOutModal(false);
    }
  };

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

        {/* Banner d'annulation de suppression */}
        {auth?.isAccountScheduledForDeletion &&
          auth?.accountDeletionDate &&
          auth?.accountDeletionDaysRemaining !== undefined && (
            <CancelDeletionBanner
              scheduledDate={auth.accountDeletionDate}
              daysRemaining={auth.accountDeletionDaysRemaining}
              onCancelled={handleCancelDeletion}
            />
          )}

        {/* Section Informations du compte */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">👤</span>
            Informations du compte
          </h2>
          <div className="space-y-3">
            <div className="py-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Email</span>
                {!isEditingEmail ? (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{auth.session.user?.email}</span>
                    <button
                      onClick={handleStartEditEmail}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Modifier l'email"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="nouvelle@email.com"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="p-1 text-green-600 hover:text-green-700"
                      title="Sauvegarder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelEditEmail}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="Annuler"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {emailError && (
                <div className="mt-1 text-red-500 text-xs">
                  {emailError}
                </div>
              )}
            </div>

            {/* Emails en attente de confirmation */}
            {pendingEmailChange && (
              <div className="py-3">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      ⏳ En attente de confirmation de changement d'email
                    </h4>
                    <p className="text-xs text-amber-700">
                      Vérifiez vos emails (<strong>{pendingEmailChange.oldEmail}</strong> et <strong>{pendingEmailChange.newEmail}</strong>) et cliquez sur les liens de confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {auth.session.user?.user_metadata?.pseudo && (
              <div className="py-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Pseudo</span>
                  {!isEditingPseudo ? (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {auth.session.user.user_metadata.pseudo}
                      </span>
                      <button
                        onClick={handleStartEditPseudo}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Modifier le pseudo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={pseudoValue}
                        onChange={(e) => setPseudoValue(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSavePseudo}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Sauvegarder"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEditPseudo}
                        className="p-1 text-red-500 hover:text-red-600"
                        title="Annuler"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {pseudoError && (
                  <div className="mt-1 text-red-500 text-xs">
                    {pseudoError}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Compte créé le</span>
              <span className="font-medium">
                {new Date(
                  auth.session.user?.created_at || ""
                ).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🔐</span>
            Sécurité
          </h2>

          {/* Modification du mot de passe */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Mot de passe
            </h3>
            {!showChangePasswordForm ? (
              <button
                onClick={() => setShowChangePasswordForm(true)}
                className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
              >
                Modifier le mot de passe
              </button>
            ) : (
              <ChangePasswordForm
                onCancel={() => setShowChangePasswordForm(false)}
              />
            )}
          </div>

          {/* Authentification à deux facteurs */}
          <div className="pt-6 border-t border-gray-200">
            <MfaManager />
          </div>
        </div>

        {/* Section Suppression du compte */}
        {!auth?.isAccountScheduledForDeletion && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="space-y-4">
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-red-800 mb-2">
                  Supprimer définitivement votre compte
                </h3>
                <p className="text-red-700 text-sm mb-4">
                  Cette action supprimera toutes vos données de manière
                  irréversible. Vous aurez cependant 7 jours pour changer d'avis
                  après confirmation.
                </p>
                <button
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Changer de compte */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🔄</span>
            Changer de compte
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Vous souhaitez vous connecter avec un autre compte ? Déconnectez-vous pour accéder à la page de connexion.
          </p>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
          >
            Changer de compte
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Modal de suppression de compte */}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onSuccess={handleDeleteAccountSuccess}
      />

      {/* Mini modale de confirmation changement email */}
      {showEmailConfirmModal && pendingEmailChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📧 Changement d'email initié
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-800 mb-2">Étape 1 :</p>
                <p>Vérifiez <strong>{pendingEmailChange.newEmail}</strong></p>
                <p>→ Cliquez sur le lien de confirmation</p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="font-medium text-orange-800 mb-2">Étape 2 :</p>
                <p>Vérifiez <strong>{pendingEmailChange.oldEmail}</strong></p>
                <p>→ Cliquez sur le lien de confirmation</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="font-medium text-yellow-800">⚠️ Important :</p>
                <p>Vous serez déconnecté après validation des 2 emails. Reconnectez-vous avec votre nouvelle adresse.</p>
              </div>
            </div>

            <button
              onClick={() => setShowEmailConfirmModal(false)}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}

      {/* Modale de confirmation déconnexion */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Changer de compte ?
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Vous allez être déconnecté et redirigé vers la page de connexion.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
