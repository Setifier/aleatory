import { useState, useEffect } from "react";
import { FolderItem } from "../../lib/foldersService";
import { SavedItem, getItemsByFolder } from "../../lib/savedItemsService";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import SearchBar from "../ui/SearchBar";

interface FoldersManagerProps {
  folders: FolderItem[];
  isLoading: boolean;
  onCreate: (folderName: string) => Promise<void>;
  onDelete: (folderName: string) => void;
  onAddToLottery: (itemName: string) => void;
}

const FoldersManager = ({
  folders,
  isLoading,
  onCreate,
  onDelete,
  onAddToLottery,
}: FoldersManagerProps) => {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [folderItems, setFolderItems] = useState<SavedItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    message: "",
    action: () => {},
  });

  // Charger les items d'un dossier
  const loadFolderItems = async (folderId: number | null) => {
    setLoadingItems(true);
    const result = await getItemsByFolder(folderId);
    if (result.success && result.items) {
      setFolderItems(result.items);
    } else {
      setFolderItems([]);
    }
    setLoadingItems(false);
  };

  // Charger les items quand un dossier est sélectionné
  useEffect(() => {
    if (selectedFolder !== null) {
      loadFolderItems(selectedFolder);
    }
  }, [selectedFolder]);

  // Rafraîchir les items du dossier ouvert quand les props changent
  useEffect(() => {
    if (selectedFolder !== null) {
      loadFolderItems(selectedFolder);
    }
  }, [folders]); // Recharger quand la liste des dossiers change

  // Filtrer les dossiers selon la recherche
  const filteredFolders = folders.filter((folder) =>
    folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Écouter les changements de dossiers globaux
  useEffect(() => {
    const handleFoldersChanged = () => {
      if (selectedFolder !== null) {
        loadFolderItems(selectedFolder);
      }
    };

    window.addEventListener("foldersChanged", handleFoldersChanged);
    return () =>
      window.removeEventListener("foldersChanged", handleFoldersChanged);
  }, [selectedFolder]);

  const handleFolderClick = (folderId: number) => {
    if (selectedFolder === folderId) {
      setSelectedFolder(null); // Fermer si déjà ouvert
    } else {
      setSelectedFolder(folderId);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      await onCreate(folderName);
      setShowCreateInput(false);
      setNewFolderName("");
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
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-accent-800">
              📁 Dossiers
            </h3>
            <button
              onClick={() => {
                setShowCreateInput(true);
                setIsExpanded(true); // Forcer l'expansion
              }}
              className="text-primary-500 hover:text-primary-700 transition-colors p-1 rounded hover:bg-primary-50"
              title="Créer un dossier"
            >
              ➕
            </button>
          </div>
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
                  if (e.key === "Enter" && newFolderName.trim()) {
                    handleCreateFolder(newFolderName.trim());
                  } else if (e.key === "Escape") {
                    setShowCreateInput(false);
                    setNewFolderName("");
                  }
                }}
              />

              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => handleCreateFolder(newFolderName.trim())}
                  disabled={isCreating || !newFolderName.trim()}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "⏳ Création..." : "✅ Créer"}
                </button>

                <button
                  onClick={() => {
                    setShowCreateInput(false);
                    setNewFolderName("");
                  }}
                  disabled={isCreating}
                  className="w-full py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
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
            <div>
              {/* Barre de recherche */}
              {folders.length > 5 && (
                <div className="mb-4">
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Rechercher dans les dossiers..."
                  />
                </div>
              )}

              {/* Statistiques */}
              {searchTerm && (
                <div className="mb-4 text-sm text-accent-600">
                  {filteredFolders.length} résultat
                  {filteredFolders.length > 1 ? "s" : ""} sur {folders.length}
                </div>
              )}

              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {filteredFolders.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-accent-500 text-xs">
                      Aucun résultat pour "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  filteredFolders.map((folder) => (
                    <div key={folder.id} className="space-y-1">
                      <div
                        className={`group bg-white border-2 rounded-lg p-3 hover:border-yellow-300 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                          selectedFolder === folder.id
                            ? "border-yellow-400 bg-yellow-50"
                            : "border-secondary-200"
                        }`}
                        onClick={() => handleFolderClick(folder.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className={`text-lg transition-transform duration-200 ${
                                selectedFolder === folder.id ? "rotate-12" : ""
                              }`}
                            >
                              {selectedFolder === folder.id ? "📂" : "📁"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-accent-800 text-sm truncate">
                                {folder.folder_name}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(folder.folder_name);
                            }}
                            className="text-accent-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm ml-2"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Items du dossier */}
                      {selectedFolder === folder.id && (
                        <div className="ml-4 pl-4 border-l-2 border-yellow-200 space-y-1">
                          {loadingItems ? (
                            <div className="text-center py-2">
                              <div className="text-sm text-accent-500">
                                Chargement...
                              </div>
                            </div>
                          ) : folderItems.length === 0 ? (
                            <div className="text-center py-3">
                              <div className="text-accent-500 text-sm">
                                📄 Dossier vide
                              </div>
                            </div>
                          ) : (
                            folderItems.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-accent-700 truncate flex-1">
                                    📄 {item.item_name}
                                  </div>
                                  <button
                                    onClick={() =>
                                      onAddToLottery(item.item_name)
                                    }
                                    className="text-primary-500 hover:text-primary-700 text-xs px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                                    title="Ajouter au tirage"
                                  >
                                    ➕
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Flèche d'expansion en bas au centre */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              const newExpanded = !isExpanded;
              setIsExpanded(newExpanded);

              // Si on ferme la section, fermer aussi le formulaire de création
              if (!newExpanded && showCreateInput) {
                setShowCreateInput(false);
                setNewFolderName("");
              }
            }}
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
