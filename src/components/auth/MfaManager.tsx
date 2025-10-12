import { useState, useEffect } from "react";
import {
  getUserMfaFactors,
  enrollTotp,
  verifyTotpEnrollment,
  unenrollMfaFactor,
  type MfaFactor,
} from "../../lib/mfaService";
import {
  isMfaEnabledInPreferences,
  setMfaEnabledPreference,
} from "../../lib/mfaPreferences";
import Button from "../ui/Button";
import SimpleModal from "../ui/SimpleModal";
import ErrorMessage from "../ui/ErrorMessage";
import Toggle from "../ui/Toggle";
import DisableMfaModal from "./DisableMfaModal";
import MfaFactorSelectionModal from "./MfaFactorSelectionModal";
import ConfirmModal from "../ui/ConfirmModal";

const MfaManager = () => {
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isMfaEnabled, setIsMfaEnabled] = useState(true);

  // États pour l'enrollment TOTP
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [currentFactorId, setCurrentFactorId] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // États pour la modale de désactivation
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  // État pour la vérification MFA avant désactivation
  const [showMfaVerification, setShowMfaVerification] = useState(false);

  // États pour le dialog de confirmation de suppression
  const [showRemoveFactorDialog, setShowRemoveFactorDialog] = useState(false);
  const [pendingFactorIdToRemove, setPendingFactorIdToRemove] =
    useState<string>("");

  // Charger les facteurs MFA existants
  const loadMfaFactors = async () => {
    setLoading(true);
    const result = await getUserMfaFactors();
    if (result.error) {
      setError(result.error);
    } else {
      setFactors(result.factors);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMfaFactors();
    // Charger la préférence MFA
    setIsMfaEnabled(isMfaEnabledInPreferences());
  }, []);

  // Sauvegarder la préférence MFA
  const toggleMfa = (enabled: boolean) => {
    if (!enabled && factors.length > 0) {
      // Si on désactive et qu'il y a des facteurs vérifiés, demander la vérification MFA
      const verifiedFactors = factors.filter((f) => f.status === "verified");
      if (verifiedFactors.length > 0) {
        setShowMfaVerification(true);
      } else {
        // S'il n'y a que des facteurs non vérifiés, montrer la modale d'avertissement directement
        setShowDisableModal(true);
      }
    } else {
      // Sinon, activer/désactiver directement
      setIsMfaEnabled(enabled);
      setMfaEnabledPreference(enabled);
    }
  };

  // Gérer le succès de la vérification MFA
  const handleMfaVerificationSuccess = () => {
    // Après vérification réussie, montrer la modale de confirmation
    setShowDisableModal(true);
  };

  // Confirmer la désactivation et supprimer tous les facteurs
  const confirmDisableMfa = async () => {
    setDisableLoading(true);
    setError("");

    try {
      // Supprimer tous les facteurs MFA
      for (const factor of factors) {
        const result = await unenrollMfaFactor(factor.id);
        if (!result.success) {
          throw new Error(
            result.error ||
              `Erreur lors de la suppression du facteur ${factor.id}`
          );
        }
      }

      // Désactiver les préférences MFA
      setIsMfaEnabled(false);
      setMfaEnabledPreference(false);
      setShowDisableModal(false);

      // Recharger les facteurs
      await loadMfaFactors();
    } catch {
      // Error logged for debugging
      setError("Erreur lors de la désactivation");
    } finally {
      setDisableLoading(false);
    }
  };

  // Commencer l'enrollment TOTP
  const handleEnrollTotp = async () => {
    setError("");

    const result = await enrollTotp();

    if (result.success && result.qrCode && result.secret && result.factor) {
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setCurrentFactorId(result.factor.id);
      setShowEnrollModal(true);
    } else {
      // Error logged for debugging
      setError(result.error || "Erreur lors de la configuration TOTP");
    }
  };

  // Vérifier le code TOTP et finaliser l'enrollment
  const handleVerifyTotp = async () => {
    if (!totpCode.trim()) {
      setError("Veuillez entrer un code à 6 chiffres");
      return;
    }

    setVerifyLoading(true);
    const result = await verifyTotpEnrollment(currentFactorId, totpCode);

    if (result.success) {
      setShowEnrollModal(false);
      setTotpCode("");
      setCurrentFactorId("");
      setQrCode("");
      setSecret("");
      setError("");
      // Recharger immédiatement
      await loadMfaFactors();
    } else {
      setError(result.error || "Code invalide");
    }
    setVerifyLoading(false);
  };

  // Demander confirmation avant suppression d'un facteur MFA
  const handleRemoveFactor = (factorId: string) => {
    setPendingFactorIdToRemove(factorId);
    setShowRemoveFactorDialog(true);
  };

  // Confirmer et exécuter la suppression du facteur
  const confirmRemoveFactor = async () => {
    if (!pendingFactorIdToRemove) return;

    setShowRemoveFactorDialog(false);

    const result = await unenrollMfaFactor(pendingFactorIdToRemove);
    if (result.success) {
      await loadMfaFactors(); // Recharger la liste
    } else {
      setError(result.error || "Erreur lors de la suppression");
    }

    // Cleanup
    setPendingFactorIdToRemove("");
  };

  // Annuler la suppression
  const cancelRemoveFactor = () => {
    setShowRemoveFactorDialog(false);
    setPendingFactorIdToRemove("");
  };

  const closeModal = async () => {
    // Si on ferme le modal pendant l'enrollment, supprimer le facteur créé
    if (currentFactorId) {
      await unenrollMfaFactor(currentFactorId);
      await loadMfaFactors(); // Rafraîchir la liste
    }

    setShowEnrollModal(false);
    setTotpCode("");
    setCurrentFactorId("");
    setQrCode("");
    setSecret("");
    setError("");
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Authentification à deux facteurs (2FA)
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Sécurisez votre compte avec une vérification supplémentaire
          </p>
        </div>

        <Toggle checked={isMfaEnabled} onChange={toggleMfa} />
      </div>

      {!isMfaEnabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-3">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Authentification à deux facteurs désactivée
          </h3>
          <p className="text-gray-600 text-sm">
            Activez ci-dessus pour configurer et utiliser l'authentification à
            deux facteurs
          </p>
        </div>
      )}

      {isMfaEnabled && (
        <>
          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              Protégez votre compte avec une authentification à deux facteurs.
              Vous aurez besoin d'une app comme{" "}
              <strong>Google Authenticator</strong> ou <strong>Authy</strong>.
            </p>
            {factors.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  ✅ <strong>MFA activé</strong> - Votre compte est protégé par
                  l'authentification à deux facteurs
                </p>
              </div>
            )}
          </div>

          <div className="mb-6 flex justify-end">
            <Button
              onClick={handleEnrollTotp}
              label="+ Ajouter TOTP"
              type="button"
            />
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Liste des facteurs MFA existants */}
          {factors.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">
                Méthodes configurées :
              </h3>
              {factors.map((factor) => (
                <div
                  key={factor.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Application d'authentification
                      </div>
                      <div className="text-sm text-gray-500">
                        {factor.friendly_name || "Authenticator App"} •{" "}
                        {factor.status}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRemoveFactor(factor.id)}
                    label="Supprimer"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium">
                Aucune méthode d'authentification configurée
              </p>
              <p className="text-sm mt-1">
                Cliquez sur "Ajouter TOTP" pour commencer
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal d'enrollment TOTP */}
      <SimpleModal isOpen={showEnrollModal} onClose={closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Configurer l'authentification TOTP
          </h3>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                1. Scannez ce QR code avec votre app d'authentification
              </p>
              {qrCode ? (
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                  <img src={qrCode} alt="QR Code TOTP" className="mx-auto" />
                </div>
              ) : (
                <div className="text-red-500">Erreur : QR Code non reçu</div>
              )}

              <p className="text-sm text-gray-500 mt-4">
                Ou entrez manuellement cette clé : <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {secret || "Clé non reçue"}
                </code>
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-gray-600 mb-4">
                2. Entrez le code à 6 chiffres généré par votre app
              </p>
              <input
                type="text"
                placeholder="123456"
                value={totpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setTotpCode(value);
                }}
                className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={6}
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={closeModal}
                label="Annuler"
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              />
              <Button
                onClick={handleVerifyTotp}
                label={
                  verifyLoading ? "Vérification..." : "Vérifier et activer"
                }
                className="flex-1"
                disabled={totpCode.length !== 6 || verifyLoading}
              />
            </div>
          </div>
        </div>
      </SimpleModal>

      {/* Modal de vérification MFA avant désactivation */}
      <MfaFactorSelectionModal
        isOpen={showMfaVerification}
        onClose={() => setShowMfaVerification(false)}
        onSuccess={handleMfaVerificationSuccess}
        factors={factors}
      />

      {/* Modal de désactivation MFA */}
      <DisableMfaModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={confirmDisableMfa}
        isLoading={disableLoading}
      />

      {/* Dialog de confirmation de suppression d'un facteur */}
      <ConfirmModal
        isOpen={showRemoveFactorDialog}
        title="Supprimer ce facteur"
        message="Êtes-vous sûr de vouloir supprimer ce facteur d'authentification ? Cette action est irréversible."
        onConfirm={confirmRemoveFactor}
        onCancel={cancelRemoveFactor}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive={true}
        advancedA11y={true}
      />
    </div>
  );
};

export default MfaManager;
