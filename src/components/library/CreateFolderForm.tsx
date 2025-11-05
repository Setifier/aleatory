import { useState } from "react";
import Button from "../ui/Button";

interface CreateFolderFormProps {
  onCreate: (folderName: string) => Promise<void>;
  onCancel: () => void;
  isCreating: boolean;
}

const CreateFolderForm = ({
  onCreate,
  onCancel,
  isCreating,
}: CreateFolderFormProps) => {
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreate = async () => {
    if (!newFolderName.trim() || isCreating) return;
    await onCreate(newFolderName.trim());
    setNewFolderName("");
  };

  return (
    <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary-600">📂</span>
        <span className="font-medium text-primary-800 text-sm">
          Nouveau dossier
        </span>
      </div>

      <input
        type="text"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="Nom du dossier..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm"
        disabled={isCreating}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreate();
          if (e.key === "Escape") onCancel();
        }}
      />

      <div className="mt-3 flex flex-col gap-2">
        <Button
          onClick={handleCreate}
          disabled={isCreating || !newFolderName.trim()}
          className="w-full py-1.5 sm:py-2 text-sm"
          label={isCreating ? "⏳ Création..." : "Créer"}
        ></Button>

        <button
          onClick={onCancel}
          disabled={isCreating}
          className="w-full py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default CreateFolderForm;
