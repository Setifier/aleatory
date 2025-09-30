import { useState } from "react";

interface SessionSectionProps {
  onSignOut: () => void;
}

const SessionSection = ({ onSignOut }: SessionSectionProps) => {
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = async () => {
    await onSignOut();
    setShowSignOutModal(false);
  };

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

      {/* Modal de confirmation */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la déconnexion
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionSection;