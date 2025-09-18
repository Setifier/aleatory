import { useState } from "react";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import SimpleModal from "../ui/SimpleModal";
import { createMfaChallenge, verifyMfaCode, type MfaFactor } from "../../lib/mfaService";
import { useMfaVerification } from "../../hooks/useMfaVerification";

interface MfaFactorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  factors: MfaFactor[];
}

const MfaFactorSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  factors 
}: MfaFactorSelectionModalProps) => {
  const [selectedFactor, setSelectedFactor] = useState<MfaFactor | null>(null);
  const [challengeId, setChallengeId] = useState<string>("");
  const [step, setStep] = useState<"select" | "verify">("select");
  
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

  const verifiedFactors = factors.filter(f => f.status === "verified");

  const handleFactorSelect = async (factor: MfaFactor) => {
    setLoading(true);
    setError("");
    
    const result = await createMfaChallenge(factor.id);
    
    if (result.success && result.challengeId) {
      setSelectedFactor(factor);
      setChallengeId(result.challengeId);
      setStep("verify");
    } else {
      setError(result.error || "Erreur lors de la création du défi");
    }
    
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!selectedFactor || !challengeId) return;
    
    if (!validateCode()) return;

    setLoading(true);

    const result = await verifyMfaCode(selectedFactor.id, challengeId, code);
    
    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      setError(result.error || "Code invalide");
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setSelectedFactor(null);
    setChallengeId("");
    setStep("select");
    reset();
    onClose();
  };

  return (
    <SimpleModal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Vérification requise
        </h3>
        
        <p className="text-gray-600 mb-4">
          Pour des raisons de sécurité, vous devez vous authentifier avec votre 2FA 
          avant de pouvoir le désactiver.
        </p>

        {step === "select" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-3">
              Choisissez une méthode d'authentification :
            </p>
            
            {verifiedFactors.map((factor) => (
              <div 
                key={factor.id}
                className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleFactorSelect(factor)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Application d'authentification
                    </div>
                    <div className="text-sm text-gray-500">
                      {factor.friendly_name || "Authenticator App"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Entrez le code à 6 chiffres de votre application d'authentification :
            </p>
            
            <input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              maxLength={6}
              autoFocus
            />
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Méthode sélectionnée :</span>
              <span className="font-medium">{selectedFactor?.friendly_name || "Authenticator App"}</span>
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        <div className="flex space-x-3 pt-4 mt-6 border-t">
          {step === "verify" && (
            <Button
              onClick={() => setStep("select")}
              label="← Retour"
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              disabled={isLoading}
            />
          )}
          
          <Button
            onClick={step === "select" ? handleClose : handleVerify}
            label={step === "select" ? "Annuler" : "Vérifier"}
            className={step === "select" ? "flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300" : "flex-1"}
            disabled={isLoading || (step === "verify" && !isCodeValid)}
          />
        </div>
      </div>
    </SimpleModal>
  );
};

export default MfaFactorSelectionModal;