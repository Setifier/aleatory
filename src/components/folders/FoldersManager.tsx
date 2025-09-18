import { useState } from "react";
import { FolderItem } from "../../lib/foldersService";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import ConfirmModal from "../ui/ConfirmModal";

interface FoldersManagerProps {
  folders: FolderItem[];
  isLoading: boolean;
  onCreate: (folderName: string) => Promise<void>;
  onDelete: (folderName: string) => void;
}

const FoldersManager = ({
  folders,
  isLoading,
  onCreate,
  onDelete,
}: FoldersManagerProps) => {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    message: "",
    action: () => {},
  });

  const handleCreateFolder = async (folderName: string) => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      await onCreate(folderName);
      setShowCreateInput(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (folderName: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Supprimer le dossier "${folderName}" définitivement ?`,
      action: () => {
        onDelete(folderName);
        setConfirmModal({ isOpen: false, message: "", action: () => {} });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-6 border-2 border-secondary-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-xl font-semibold text-accent-800">📁 Dossiers</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-accent-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-4 border border-secondary-200 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xl font-semibold text-accent-800">📁 Dossiers</h3>
          {folders.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium items-center">
              {folders.length}
            </span>
          )}
        </div>

        {/* Contenu collapsible */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Input de création */}
          {showCreateInput && (
            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary-600">📂</span>
                <span className="font-medium text-primary-800">
                  Créer un nouveau dossier
                </span>
              </div>

              <InputField
                onAddItem={handleCreateFolder}
                placeholder="Nom du dossier..."
                buttonLabel={isCreating ? "⏳ Création..." : "✅ Créer"}
                disabled={isCreating}
              />

              <div className="mt-3 text-xs text-primary-600">
                💡 Les dossiers vous permettront d'organiser vos items par
                catégories (fonctionnalité à venir)
              </div>
            </div>
          )}

          {/* Liste des dossiers ou état vide */}
          {folders.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2 opacity-50">📁</div>
              <p className="text-accent-600 text-sm mb-1">Aucun dossier</p>
              <p className="text-accent-500 text-xs mb-3">
                Organisez vos items par catégories
              </p>
              {!showCreateInput && (
                <Button
                  onClick={() => setShowCreateInput(true)}
                  label="➕ Nouveau dossier"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 text-sm"
                />
              )}
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="group bg-white border border-secondary-200 rounded-lg p-3 hover:border-yellow-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-lg">📂</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-accent-800 text-sm truncate">
                          {folder.folder_name}
                        </div>
                      </div>
                      <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                        🚧
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteClick(folder.folder_name)}
                      className="text-accent-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm ml-2"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Informations en bas */}
          {folders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-blue-500 text-sm">ℹ️</div>
                  <div className="text-blue-700 text-sm">
                    <strong>Fonctionnalité en développement :</strong> Les
                    dossiers serviront bientôt à organiser vos items sauvegardés
                    par catégories (travail, loisirs, etc.).
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-accent-600 mt-2">
                {folders.length} dossier{folders.length > 1 ? "s" : ""} créé
                {folders.length > 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {/* Flèche d'expansion en bas au centre */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-accent-400 hover:text-accent-600 transition-colors pt-2"
          >
            <div
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() =>
          setConfirmModal({ isOpen: false, message: "", action: () => {} })
        }
        isDestructive={true}
      />
    </>
  );
};

export default FoldersManager;
