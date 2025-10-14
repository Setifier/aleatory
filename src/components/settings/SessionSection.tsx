import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";

interface SessionSectionProps {
  onSignOut: () => void;
}

const SessionSection = ({ onSignOut }: SessionSectionProps) => {
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Session</h2>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
          <div>
            <h3 className="font-medium text-gray-900">Se déconnecter</h3>
            <p className="text-sm text-gray-600">
              Vous déconnecter de votre session actuelle
            </p>
          </div>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {/* ✅ ConfirmModal */}
      <ConfirmModal
        isOpen={showSignOutModal}
        title="Confirmer la déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        onConfirm={onSignOut}
        onCancel={() => setShowSignOutModal(false)}
        isDestructive={true}
      />
    </>
  );
};

export default SessionSection;
