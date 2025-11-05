import React from "react";
import { useMfaVerification } from "../../hooks/useMfaVerification";

interface MfaVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const MfaVerificationModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Vérification requise",
  description = "Entrez votre code d'authentification à deux facteurs pour continuer."
}: MfaVerificationModalProps) => {
  const {
    code,
    isLoading,
    error,
    setError,
    setLoading,
    handleCodeChange,
    validateCode,
    reset,
    isCodeValid,
  } = useMfaVerification();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCode()) return;

    setLoading(true);

    try {

      const { supabase } = await import("../../lib/supabaseClient");
      
      // Lister les facteurs MFA
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (!factors?.all || factors.all.length === 0) {
        throw new Error("Aucun facteur MFA trouvé");
      }

      const factor = factors.all[0];


      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id
      });

      if (challengeError || !challenge) {
        throw new Error(challengeError?.message || "Impossible de créer le défi MFA");
      }


      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code: code
      });

      if (verifyError) {
        throw new Error(verifyError.message || "Code invalide");
      }


      onSuccess();
      handleClose();
      
    } catch {
      // Error logged for debugging
      setError("Erreur lors de la vérification");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 text-xl">🔐</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code d'authentification
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="123456"
              className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              maxLength={6}
              disabled={isLoading}
              autoComplete="one-time-code"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Entrez le code à 6 chiffres de votre application d'authentification
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg shadow-sm">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isCodeValid || isLoading}
              className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Vérification..." : "Vérifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MfaVerificationModal;