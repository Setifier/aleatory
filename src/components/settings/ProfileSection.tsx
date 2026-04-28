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
  const [pseudoValue, setPseudoValue]         = useState("");
  const [pseudoError, setPseudoError]         = useState("");
  const [isEditingEmail, setIsEditingEmail]   = useState(false);
  const [emailValue, setEmailValue]           = useState("");
  const [emailError, setEmailError]           = useState("");

  const handleStartEditPseudo = () => {
    setPseudoValue(auth?.session?.user?.user_metadata?.pseudo || "");
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
    if (!validation.isValid) { setPseudoError(validation.error || "Pseudo invalide"); return; }
    const current = auth?.session?.user?.user_metadata?.pseudo || "";
    if (validation.formatted === current) { setPseudoError("Le nouveau pseudo doit être différent"); return; }
    try {
      const { error } = await supabase.auth.updateUser({ data: { pseudo: validation.formatted } });
      if (error) { setPseudoError("Erreur lors de la mise à jour"); return; }
      setIsEditingPseudo(false);
      setPseudoValue("");
      setPseudoError("");
    } catch { setPseudoError("Une erreur est survenue"); }
  };

  const handleStartEditEmail = () => {
    setEmailValue(auth?.session?.user?.email || "");
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
    if (!validation.isValid) { setEmailError(validation.error || "Email invalide"); return; }
    const current = auth?.session?.user?.email || "";
    if (validation.formatted === current) { setEmailError("Le nouvel email doit être différent"); return; }
    try {
      const { error } = await supabase.auth.updateUser({ email: validation.formatted });
      if (error) { setEmailError("Erreur lors de la mise à jour"); return; }
      setIsEditingEmail(false);
      setEmailValue("");
      setEmailError("");
      onEmailChangeRequested({
        oldEmail: current,
        newEmail: validation.formatted,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    } catch { setEmailError("Une erreur est survenue"); }
  };

  const currentPseudo = auth?.session?.user?.user_metadata?.pseudo || "Non défini";
  const currentEmail  = auth?.session?.user?.email || "Non défini";

  return (
    <div className="rounded-2xl p-5 sm:p-6 mb-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h2 className="text-lg font-black text-white uppercase tracking-wide mb-5">Profil</h2>

      {/* Pseudo */}
      <div className="mb-5 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Pseudo</label>
          {!isEditingPseudo && (
            <button onClick={handleStartEditPseudo}
              className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
              Modifier
            </button>
          )}
        </div>
        {isEditingPseudo ? (
          <div className="space-y-3">
            <input
              type="text"
              value={pseudoValue}
              onChange={e => setPseudoValue(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-transparent border border-white/15 focus:border-primary-500/60 outline-none transition-colors placeholder-white/20"
              placeholder="Votre pseudo"
            />
            {pseudoError && <p className="text-red-400 text-xs">{pseudoError}</p>}
            <div className="flex gap-2">
              <button onClick={handleSavePseudo}
                className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all">
                Sauvegarder
              </button>
              <button onClick={handleCancelEditPseudo}
                className="px-4 py-2 rounded-xl border border-white/12 text-white/50 hover:text-white hover:bg-white/6 font-medium text-sm transition-all">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="px-3 py-2.5 rounded-xl text-sm text-white/75"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {currentPseudo}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Email</label>
          {!isEditingEmail && (
            <button onClick={handleStartEditEmail}
              className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
              Modifier
            </button>
          )}
        </div>
        {isEditingEmail ? (
          <div className="space-y-3">
            <input
              type="email"
              value={emailValue}
              onChange={e => setEmailValue(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-transparent border border-white/15 focus:border-primary-500/60 outline-none transition-colors placeholder-white/20"
              placeholder="Votre email"
            />
            {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
            <div className="flex gap-2">
              <button onClick={handleSaveEmail}
                className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all">
                Sauvegarder
              </button>
              <button onClick={handleCancelEditEmail}
                className="px-4 py-2 rounded-xl border border-white/12 text-white/50 hover:text-white hover:bg-white/6 font-medium text-sm transition-all">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="px-3 py-2.5 rounded-xl text-sm text-white/75"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {currentEmail}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
