import { useState } from "react";
import DeleteAccountModal from "../auth/DeleteAccountModal";

const AdvancedActionsSection = () => {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  return (
    <>
      <div className="rounded-2xl p-5 sm:p-6"
        style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <h2 className="text-lg font-black text-white uppercase tracking-wide mb-5">Actions avancées</h2>

        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <div>
            <p className="font-semibold text-white/90 text-sm">Supprimer le compte</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(252,165,165,0.55)" }}>
              Suppression définitive de votre compte et toutes vos données
            </p>
          </div>
          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="px-4 py-2 rounded-xl font-bold text-sm transition-all flex-shrink-0"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "rgba(252,165,165,0.85)",
            }}
          >
            Supprimer
          </button>
        </div>
      </div>

      {showDeleteAccountModal && (
        <DeleteAccountModal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
        />
      )}
    </>
  );
};

export default AdvancedActionsSection;
