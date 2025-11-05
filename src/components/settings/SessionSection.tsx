import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";

interface SessionSectionProps {
  onSignOut: () => void;
}

const SessionSection = ({ onSignOut }: SessionSectionProps) => {
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Session
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div>
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
              Se déconnecter
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Vous déconnecter de votre session actuelle
            </p>
          </div>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm sm:text-base whitespace-nowrap"
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
        isDestructive={true}
      />
    </>
  );
};

export default SessionSection;
