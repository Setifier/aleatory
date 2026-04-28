import { useState } from "react";
import MfaManager from "../auth/MfaManager";
import ChangePasswordForm from "../auth/ChangePasswordForm";

const SecuritySection = () => {
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  return (
    <div className="rounded-2xl p-5 sm:p-6 mb-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h2 className="text-lg font-black text-white uppercase tracking-wide mb-5">Sécurité</h2>

      {/* 2FA */}
      <div className="mb-5 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Authentification à deux facteurs (2FA)
        </h3>
        <MfaManager />
      </div>

      {/* Password */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Mot de passe
        </h3>
        {showChangePasswordForm ? (
          <ChangePasswordForm onCancel={() => setShowChangePasswordForm(false)} />
        ) : (
          <button
            onClick={() => setShowChangePasswordForm(true)}
            className="px-4 py-2.5 rounded-xl border border-white/12 text-white/55 hover:text-white hover:bg-white/6 font-medium text-sm transition-all"
          >
            Changer le mot de passe
          </button>
        )}
      </div>
    </div>
  );
};

export default SecuritySection;
