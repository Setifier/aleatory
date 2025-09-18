import { useState } from "react";

interface DisableMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DisableMfaModal = ({ isOpen, onClose, onConfirm, isLoading = false }: DisableMfaModalProps) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (hasConfirmed) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setHasConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Désactiver l'authentification à deux facteurs
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            <strong>Attention :</strong> Cette action supprimera définitivement votre configuration d'authentification à deux facteurs.
          </p>
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-red-800 mb-2">Ce qui sera perdu :</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Votre code QR actuel</li>
              <li>• La configuration dans vos applications d'authentification</li>
              <li>• La protection renforcée de votre compte</li>
            </ul>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            Pour réactiver la 2FA plus tard, vous devrez reconfigurer entièrement votre authentificateur.
          </p>
        </div>

        <div className="mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">
              Je comprends que ma configuration d'authentification à deux facteurs sera définitivement supprimée et que je devrai la reconfigurer si je souhaite la réactiver.
            </span>
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleConfirm}
            disabled={!hasConfirmed || isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Désactivation..." : "Désactiver définitivement"}
          </button>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisableMfaModal;