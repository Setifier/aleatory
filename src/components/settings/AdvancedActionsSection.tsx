import { useState } from "react";
import { UserAuth } from "../../context/AuthContext";
import DeleteAccountModal from "../auth/DeleteAccountModal";
import CancelDeletionBanner from "../auth/CancelDeletionBanner";

interface AdvancedActionsSectionProps {
  onDeleteAccountSuccess: () => void;
  onCancelDeletion: () => void;
}

const AdvancedActionsSection = ({
  onDeleteAccountSuccess,
  onCancelDeletion
}: AdvancedActionsSectionProps) => {
  const auth = UserAuth();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const handleDeleteAccountSuccess = () => {
    onDeleteAccountSuccess();
    setShowDeleteAccountModal(false);
  };

  const handleCancelDeletion = () => {
    onCancelDeletion();
  };

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-800 mb-6">Actions avancées</h2>

        {/* Account deletion banner */}
        {auth?.isAccountScheduledForDeletion &&
         auth?.accountDeletionDate &&
         auth?.accountDeletionDaysRemaining !== undefined && (
          <div className="mb-6">
            <CancelDeletionBanner
              scheduledDate={auth.accountDeletionDate}
              daysRemaining={auth.accountDeletionDaysRemaining}
              onCancelled={handleCancelDeletion}
            />
          </div>
        )}

        {/* Delete Account */}
        {!auth?.isAccountScheduledForDeletion && (
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-md bg-red-50">
            <div>
              <h3 className="font-medium text-red-900">Supprimer le compte</h3>
              <p className="text-sm text-red-700">
                Supprimer définitivement votre compte et toutes vos données
              </p>
            </div>
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Supprimer le compte
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showDeleteAccountModal && (
        <DeleteAccountModal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          onSuccess={handleDeleteAccountSuccess}
        />
      )}
    </>
  );
};

export default AdvancedActionsSection;