import { useState } from "react";
import DeleteAccountModal from "../auth/DeleteAccountModal";

const AdvancedActionsSection = () => {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-4 sm:mb-6">
          Actions avancées
        </h2>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4 border border-red-200 rounded-md bg-red-50">
          <div>
            <h3 className="font-medium text-red-900 text-sm sm:text-base">Supprimer le compte</h3>
            <p className="text-xs sm:text-sm text-red-700">
              Supprimer définitivement votre compte et toutes vos données
            </p>
          </div>
          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            Supprimer le compte
          </button>
        </div>
      </div>

      {/* Modal */}
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
