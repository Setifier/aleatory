import { useState, useRef, useEffect } from "react";
import { UserAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/errorUtils";
import { logger } from "../../lib/logger";
import MfaVerificationModal from "./MfaVerificationModal";

interface SessionWithAal {
  aal?: "aal1" | "aal2";
}

interface ChangePasswordFormProps {
  onCancel: () => void;
}

const ChangePasswordForm = ({ onCancel }: ChangePasswordFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState<{
    current: string;
    new: string;
  } | null>(null);


  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  const auth = UserAuth();

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs sont requis");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {

      const { supabase } = await import("../../lib/supabaseClient");
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasMfa = factors?.all && factors.all.length > 0;

      if (hasMfa && (auth?.session as SessionWithAal)?.aal !== "aal2") {

        setPendingPasswordData({
          current: currentPassword,
          new: newPassword,
        });
        setShowMfaModal(true);
        setIsLoading(false);
        return;
      }


      await performPasswordUpdate(currentPassword, newPassword);
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      logger.error("Erreur changement mot de passe", error);
      setIsLoading(false);
    }
  };

  const performPasswordUpdate = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const result = await auth?.updatePassword(currentPassword, newPassword);

      if (result?.success) {
        setSuccess("Mot de passe modifié avec succès !");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPendingPasswordData(null);
        timeoutRef.current = window.setTimeout(() => {
          onCancel();
        }, 2000);
      } else {
        setError(
          result?.error
            ? getErrorMessage(result.error)
            : "Erreur lors de la modification du mot de passe"
        );
      }
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      logger.error("Erreur changement mot de passe", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSuccess = async () => {
    if (pendingPasswordData) {
      setShowMfaModal(false);
      setIsLoading(true);
      await performPasswordUpdate(
        pendingPasswordData.current,
        pendingPasswordData.new
      );
    }
  };

  const handleMfaCancel = () => {
    setShowMfaModal(false);
    setPendingPasswordData(null);
    setIsLoading(false);
  };


  const EyeIcon = ({
    show,
    onClick,
  }: {
    show: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors flex items-center"
      tabIndex={-1}
    >
      {show ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Modifier le mot de passe
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mot de passe actuel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe actuel
          </label>
          <div className="flex">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
            <EyeIcon
              show={showCurrentPassword}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            />
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <div className="flex">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={isLoading}
              minLength={8}
            />
            <EyeIcon
              show={showNewPassword}
              onClick={() => setShowNewPassword(!showNewPassword)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
        </div>

        {/* Confirmation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le nouveau mot de passe
          </label>
          <div className="flex">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
            <EyeIcon
              show={showConfirmPassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg shadow-sm">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Boutons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Modification..." : "Modifier"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Modal MFA */}
      <MfaVerificationModal
        isOpen={showMfaModal}
        onClose={handleMfaCancel}
        onSuccess={handleMfaSuccess}
        title="Vérification 2FA requise"
        description="Pour modifier votre mot de passe, veuillez d'abord confirmer votre identité avec votre code d'authentification."
      />
    </div>
  );
};

export default ChangePasswordForm;
