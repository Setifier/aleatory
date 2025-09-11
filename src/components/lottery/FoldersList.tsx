import { memo, useState, useEffect, useCallback } from "react";
import {
  loadUserFolders,
  createFolder,
  deleteFolder,
  FolderItem,
} from "../../lib/foldersService";
import { UserAuth } from "../../context/AuthContext";
import InputField from "../ui/InputField";

interface FoldersListProps {
  onFolderDeleted?: (folderName: string) => void; // Callback pour notifier la suppression
  onFolderSelected?: (folderName: string) => void; // Callback pour sélectionner un dossier
}

const FoldersList = memo(
  ({ onFolderDeleted, onFolderSelected }: FoldersListProps) => {
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const auth = UserAuth();

    // Charger les dossiers depuis la base de données
    const loadFolders = useCallback(async () => {
      if (!auth?.session) {
        setFolders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await loadUserFolders();

        if (result.error) {
          setError(result.error);
          setFolders([]);
        } else {
          setFolders(result.folders);
        }
      } catch (err) {
        setError("Erreur lors du chargement des dossiers");
        setFolders([]);
      } finally {
        setLoading(false);
      }
    }, [auth?.session]);

    // Charger les dossiers au montage et quand l'authentification change
    useEffect(() => {
      loadFolders();
    }, [loadFolders]);

    // Créer un nouveau dossier
    const handleCreateFolder = useCallback(
      async (folderName: string) => {
        if (!auth?.session) return;

        try {
          setCreating(true);
          setError(null);
          const result = await createFolder(folderName);

          if (result.success && result.folder) {
            // Ajouter le nouveau dossier à la liste locale
            setFolders((prev) => [result.folder!, ...prev]);
            setShowCreateForm(false);
            console.log(`✅ Dossier "${folderName}" créé avec succès`);
          } else {
            setError(result.error || "Erreur lors de la création du dossier");
          }
        } catch (error) {
          console.error(`❌ Erreur inattendue pour "${folderName}":`, error);
          setError("Erreur inattendue lors de la création");
        } finally {
          setCreating(false);
        }
      },
      [auth?.session]
    );

    // Supprimer un dossier
    const handleDeleteFolder = useCallback(
      async (folderName: string) => {
        if (!auth?.session) return;

        try {
          const result = await deleteFolder(folderName);

          if (result.success) {
            // Retirer le dossier de la liste locale
            setFolders((prev) =>
              prev.filter((folder) => folder.folder_name !== folderName)
            );
            // Notifier le parent si nécessaire
            onFolderDeleted?.(folderName);
            console.log(`✅ Dossier "${folderName}" supprimé avec succès`);
          } else {
            console.error(
              `❌ Erreur suppression du dossier "${folderName}":`,
              result.error
            );
            setError(
              `Erreur lors de la suppression du dossier "${folderName}"`
            );
          }
        } catch (error) {
          console.error(`❌ Erreur inattendue pour "${folderName}":`, error);
          setError("Erreur inattendue lors de la suppression");
        }
      },
      [auth?.session, onFolderDeleted]
    );

    // Sélectionner un dossier
    const handleSelectFolder = useCallback(
      (folderName: string) => {
        onFolderSelected?.(folderName);
      },
      [onFolderSelected]
    );

    // Rafraîchir la liste
    const handleRefresh = useCallback(() => {
      loadFolders();
    }, [loadFolders]);

    // Annuler la création
    const handleCancelCreate = useCallback(() => {
      setShowCreateForm(false);
      setError(null);
    }, []);

    return (
      <div>
        <div className="pr-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-accent-800">
              📁 Dossiers :
            </h3>
            <div className="flex gap-2">
              {auth?.session && (
                <>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="text-green-600 hover:text-green-800 text-sm"
                    title={showCreateForm ? "Annuler" : "Créer un dossier"}
                  >
                    {showCreateForm ? "❌" : "➕"}
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                    title="Rafraîchir la liste"
                  >
                    🔄
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Formulaire de création de dossier */}
          {showCreateForm && auth?.session && (
            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded">
              <h4 className="text-sm font-medium text-primary-800 mb-2">
                Créer un nouveau dossier :
              </h4>
              <InputField
                onAddItem={handleCreateFolder}
                placeholder="Nom du dossier..."
                buttonLabel={creating ? "..." : "Créer"}
                disabled={creating}
                errorMessage={error}
                onDismissError={() => setError(null)}
              />
              <button
                onClick={handleCancelCreate}
                className="mt-2 text-xs text-secondary-600 hover:text-secondary-800"
              >
                Annuler
              </button>
            </div>
          )}

          {loading ? (
            <div className="bg-secondary-50 border border-secondary-200 p-4 rounded shadow text-center text-secondary-600">
              Chargement des dossiers...
            </div>
          ) : error && !showCreateForm ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded shadow text-red-600">
              {error}
            </div>
          ) : folders.length === 0 ? (
            <div className="bg-secondary-50 border border-secondary-200 p-4 rounded shadow text-center text-secondary-500">
              {auth?.session
                ? "Aucun dossier créé"
                : "Connectez-vous pour créer des dossiers"}
            </div>
          ) : (
            <ul className="bg-secondary-50 border border-secondary-200 p-4 rounded shadow">
              {folders.map((folder) => (
                <li
                  key={`folder-${folder.id}`}
                  className="group cursor-pointer hover:bg-secondary-100 transition-all duration-200 rounded p-2 border border-transparent hover:border-secondary-300"
                >
                  <div className="flex justify-between items-center">
                    {/* Zone cliquable pour sélectionner le dossier */}
                    <button
                      onClick={() => handleSelectFolder(folder.folder_name)}
                      className="flex-1 text-left text-secondary-800 hover:text-primary-600 transition-colors duration-200 group-hover:font-medium"
                      title={`Cliquer pour sélectionner le dossier "${folder.folder_name}"`}
                    >
                      <span className="flex items-center">
                        <span className="mr-2 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          📂
                        </span>
                        <span className="mr-2">📁</span>
                        {folder.folder_name}
                      </span>
                    </button>

                    {/* Bouton de suppression */}
                    {auth?.session && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empêcher le déclenchement du clic parent
                          handleDeleteFolder(folder.folder_name);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors duration-200 ml-2"
                        title="Supprimer ce dossier"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
);

FoldersList.displayName = "FoldersList";

export default FoldersList;
