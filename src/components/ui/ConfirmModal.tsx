import SimpleModal from "./SimpleModal";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean; // Pour les actions de suppression
}

const ConfirmModal = ({
  isOpen,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmModalProps) => {
  return (
    <SimpleModal isOpen={isOpen} onClose={onCancel}>
      <div className="p-6">
        {/* Titre */}
        <h2 className="text-xl font-bold text-accent-900 mb-4 text-center">{title}</h2>
        
        <div className="text-center">          
          {/* Message */}
          <p className="text-accent-700 mb-6 text-lg">{message}</p>
          
          {/* Boutons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onCancel}
              label={cancelLabel}
              className="bg-gray-300 hover:bg-gray-400 text-accent-800"
            />
            <Button
              onClick={onConfirm}
              label={confirmLabel}
              className={
                isDestructive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }
            />
          </div>
        </div>
      </div>
    </SimpleModal>
  );
};

export default ConfirmModal;