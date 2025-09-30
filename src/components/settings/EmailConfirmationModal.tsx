interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingEmailChange: {
    oldEmail: string;
    newEmail: string;
    expiresAt: number;
  };
}

const EmailConfirmationModal = ({
  isOpen,
  onClose,
  pendingEmailChange
}: EmailConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📧 Changement d'email initié
        </h3>

        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-800 mb-2">Étape 1 :</p>
            <p>Vérifiez <strong>{pendingEmailChange.newEmail}</strong></p>
            <p>→ Cliquez sur le lien de confirmation</p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="font-medium text-orange-800 mb-2">Étape 2 :</p>
            <p>Vérifiez <strong>{pendingEmailChange.oldEmail}</strong></p>
            <p>→ Cliquez sur le lien de confirmation</p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="font-medium text-yellow-800">⚠️ Important :</p>
            <p>
              Vous serez déconnecté après validation des 2 emails.
              Reconnectez-vous avec votre nouvelle adresse.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;