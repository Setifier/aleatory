import { useState } from "react";
import { UserAuth } from "../../context/AuthContext";
import { formatAndValidatePseudo } from "../../lib/pseudoUtils";
import { formatAndValidateEmail } from "../../lib/emailUtils";
import { supabase } from "../../lib/supabaseClient";

interface ProfileSectionProps {
  onEmailChangeRequested: (pendingData: {
    oldEmail: string;
    newEmail: string;
    expiresAt: number;
  }) => void;
}

const ProfileSection = ({ onEmailChangeRequested }: ProfileSectionProps) => {
  const auth = UserAuth();
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const [pseudoValue, setPseudoValue] = useState("");
  const [pseudoError, setPseudoError] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailError, setEmailError] = useState("");

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
      const { error } = await supabase.auth.updateUser({
        data: { pseudo: validation.formatted },
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
      const { error } = await supabase.auth.updateUser({
        email: validation.formatted,
      });

      if (error) {
        setEmailError("Erreur lors de la mise à jour");
        return;
      }

      setIsEditingEmail(false);
      setEmailValue("");
      setEmailError("");

      const pendingData = {
        oldEmail: currentEmail,
        newEmail: validation.formatted,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 heures
      };
      onEmailChangeRequested(pendingData);
    } catch {
      setEmailError("Une erreur est survenue");
    }
  };

  const currentPseudo =
    auth?.session?.user?.user_metadata?.pseudo || "Non défini";
  const currentEmail = auth?.session?.user?.email || "Non défini";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Profil
      </h2>

      {/* Pseudo Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Pseudo</label>
          {!isEditingPseudo && (
            <button
              onClick={handleStartEditPseudo}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Modifier
            </button>
          )}
        </div>

        {isEditingPseudo ? (
          <div className="space-y-3">
            <input
              type="text"
              value={pseudoValue}
              onChange={(e) => setPseudoValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre pseudo"
            />
            {pseudoError && (
              <p className="text-red-600 text-sm">{pseudoError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSavePseudo}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Sauvegarder
              </button>
              <button
                onClick={handleCancelEditPseudo}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
            {currentPseudo}
          </p>
        )}
      </div>

      {/* Email Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Email</label>
          {!isEditingEmail && (
            <button
              onClick={handleStartEditEmail}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Modifier
            </button>
          )}
        </div>

        {isEditingEmail ? (
          <div className="space-y-3">
            <input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre email"
            />
            {emailError && <p className="text-red-600 text-sm">{emailError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSaveEmail}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Sauvegarder
              </button>
              <button
                onClick={handleCancelEditEmail}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
            {currentEmail}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
