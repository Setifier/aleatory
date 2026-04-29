import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";

interface SessionSectionProps {
  onSignOut: () => void;
}

const SessionSection = ({ onSignOut }: SessionSectionProps) => {
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <>
      <div className="rounded-2xl p-5 sm:p-6 mb-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 className="text-lg font-black text-white uppercase tracking-wide mb-5">Session</h2>

        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <p className="font-semibold text-white text-sm">Se déconnecter</p>
            <p className="text-xs text-white/35 mt-0.5">Terminer votre session actuelle</p>
          </div>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="px-4 py-2 rounded-xl border border-white/12 text-white/55 hover:text-white hover:bg-white/6 font-medium text-sm transition-all flex-shrink-0"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showSignOutModal}
        title="Confirmer la déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        onConfirm={onSignOut}
        onCancel={() => setShowSignOutModal(false)}
        isDestructive
      />
    </>
  );
};

export default SessionSection;
