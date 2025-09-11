import { useState } from "react";
import { Link } from "react-router-dom";
import MfaManager from "../components/auth/MfaManager";
import ChangePasswordForm from "../components/auth/ChangePasswordForm";
import DeleteAccountModal from "../components/auth/DeleteAccountModal";
import CancelDeletionBanner from "../components/auth/CancelDeletionBanner";
import { UserAuth } from "../context/AuthContext";

const Settings = () => {
  const auth = UserAuth();
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const handleDeleteAccountSuccess = () => {
    // Rafraîchir le statut de suppression après programmation
    auth?.refreshDeletionStatus();
    setShowDeleteAccountModal(false);
  };

  const handleCancelDeletion = () => {
    // Rafraîchir le statut de suppression après annulation
    auth?.refreshDeletionStatus();
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
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{auth.session.user?.email}</span>
            </div>
            {auth.session.user?.user_metadata?.pseudo && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Pseudo</span>
                <span className="font-medium">
                  {auth.session.user.user_metadata.pseudo}
                </span>
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
    </div>
  );
};

export default Settings;
