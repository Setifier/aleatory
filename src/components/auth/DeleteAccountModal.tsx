import { useState } from "react";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import SimpleModal from "../ui/SimpleModal";
import MfaVerificationModal from "./MfaVerificationModal";
import { scheduleAccountDeletion, validateDeleteAccountData, type DeleteAccountData } from "../../lib/accountService";
import { getUserMfaFactors } from "../../lib/mfaService";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "warning" | "authentication" | "confirmation" | "mfa";

const DeleteAccountModal = ({ isOpen, onClose, onSuccess }: DeleteAccountModalProps) => {
  const [step, setStep] = useState<Step>("warning");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Données d'authentification
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  
  // MFA
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [hasMfa, setHasMfa] = useState(false);

  const handleClose = () => {
    setStep("warning");
    setPassword("");
    setConfirmationText("");
    setError("");
    setLoading(false);
    setShowPassword(false);
    setShowMfaModal(false);
    setHasMfa(false);
    onClose();
  };

  const handleWarningNext = () => {
    setStep("authentication");
    setError("");
  };

  const handleAuthenticationNext = async () => {
    setError("");
    setLoading(true);

    try {
      // Vérifier s'il y a du MFA configuré
      const mfaResult = await getUserMfaFactors();
      const hasActiveMfa = mfaResult.factors.some(f => f.status === "verified");
      setHasMfa(hasActiveMfa);

      if (hasActiveMfa) {
        // Si MFA activé, demander la vérification
        setShowMfaModal(true);
        setLoading(false);
      } else {
        // Sinon, passer à la confirmation
        setStep("confirmation");
        setLoading(false);
      }
    } catch (error) {
      setError("Erreur lors de la vérification MFA");
      setLoading(false);
    }
  };

  const handleMfaSuccess = () => {
    setShowMfaModal(false);
    setStep("confirmation");
  };

  const handleMfaCancel = () => {
    setShowMfaModal(false);
    setLoading(false);
  };

  const handleFinalConfirmation = async () => {
    setError("");
    setLoading(true);

    // Validation finale
    const validationError = validateDeleteAccountData({ password, confirmationText });
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const result = await scheduleAccountDeletion(password, confirmationText);
      
      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setError(result.error || "Erreur lors de la programmation de la suppression");
      }
    } catch (error) {
      setError("Erreur inattendue lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "authentication") {
      setStep("warning");
    } else if (step === "confirmation") {
      setStep("authentication");
    }
  };

  // Composant icône œil pour le mot de passe
  const EyeIcon = ({ show, onClick }: { show: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      tabIndex={-1}
    >
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      <SimpleModal isOpen={isOpen} onClose={handleClose}>
        <div className="p-6">
          {/* Étape 1: Avertissement */}
          {step === "warning" && (
            <>
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Supprimer définitivement votre compte
                </h3>
              </div>

              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ Cette action est irréversible</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Toutes vos données seront définitivement supprimées</li>
                    <li>• Tous vos tirages et listes sauvegardées seront perdus</li>
                    <li>• Votre pseudo ne pourra plus être utilisé</li>
                    <li>• Cette action ne peut pas être annulée après 7 jours</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🕒 Délai de grâce de 7 jours</h4>
                  <p className="text-blue-700 text-sm">
                    Vous aurez 7 jours pour changer d'avis et annuler la suppression. 
                    Un email de confirmation vous sera envoyé avec les instructions.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleClose}
                  label="Annuler"
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                />
                <Button
                  onClick={handleWarningNext}
                  label="Continuer"
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                />
              </div>
            </>
          )}

          {/* Étape 2: Authentification */}
          {step === "authentication" && (
            <>
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-2xl">🔐</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Vérification de sécurité
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Pour continuer, veuillez confirmer votre identité en saisissant votre mot de passe.
                {hasMfa && " Une vérification 2FA sera également requise."}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Votre mot de passe"
                    disabled={loading}
                  />
                  <EyeIcon 
                    show={showPassword} 
                    onClick={() => setShowPassword(!showPassword)} 
                  />
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleBack}
                  label="← Retour"
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={loading}
                />
                <Button
                  onClick={handleAuthenticationNext}
                  label="Continuer"
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  disabled={!password.trim() || loading}
                />
              </div>
            </>
          )}

          {/* Étape 3: Confirmation finale */}
          {step === "confirmation" && (
            <>
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 text-2xl">🗑️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirmation finale
                </h3>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-semibold mb-2">
                  Dernière étape avant la programmation de la suppression
                </p>
                <p className="text-red-700 text-sm">
                  Tapez exactement <strong>SUPPRIMER</strong> dans le champ ci-dessous pour confirmer 
                  que vous souhaitez programmer la suppression de votre compte dans 7 jours.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tapez "SUPPRIMER" pour confirmer
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="SUPPRIMER"
                  disabled={loading}
                />
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleBack}
                  label="← Retour"
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={loading}
                />
                <Button
                  onClick={handleFinalConfirmation}
                  label={loading ? "Programmation..." : "Programmer la suppression"}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  disabled={confirmationText.toUpperCase() !== "SUPPRIMER" || loading}
                />
              </div>
            </>
          )}
        </div>
      </SimpleModal>

      {/* Modal MFA */}
      <MfaVerificationModal
        isOpen={showMfaModal}
        onClose={handleMfaCancel}
        onSuccess={handleMfaSuccess}
        title="Vérification 2FA requise"
        description="Pour supprimer votre compte, veuillez d'abord confirmer votre identité avec votre code d'authentification 2FA."
      />
    </>
  );
};

export default DeleteAccountModal;