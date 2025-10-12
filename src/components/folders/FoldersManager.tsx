import { useState, useEffect } from "react";
import { FolderItem } from "../../lib/foldersService";
import { SavedItem, getItemsByFolder } from "../../lib/savedItemsService";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import SearchBar from "../ui/SearchBar";
import CreateFolderForm from "../library/CreateFolderForm";
import FolderCard from "../library/FolderCard";
import FolderItemsList from "../library/FolderItemsList";

interface FoldersManagerProps {
  folders: FolderItem[];
  isLoading: boolean;
  onCreate: (folderName: string) => Promise<void>;
  onDelete: (folderName: string) => void;
  onAddToLottery: (itemName: string) => void;
  onAddFolder: (folderId: number) => Promise<string[]>;
}

const FoldersManager = ({
  folders,
  isLoading,
  onCreate,
  onDelete,
  onAddToLottery,
  onAddFolder,
}: FoldersManagerProps) => {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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

  // Load folder items
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

  // Load items when folder selected
  useEffect(() => {
    if (selectedFolder !== null) {
      loadFolderItems(selectedFolder);
    }
  }, [selectedFolder]);

  // Refresh items when folders change
  useEffect(() => {
    if (selectedFolder !== null) {
      loadFolderItems(selectedFolder);
    }
  }, [folders, selectedFolder]);

  // Filter folders
  const filteredFolders = folders.filter((folder) =>
    folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Listen to global folder changes
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
      setSelectedFolder(null);
    } else {
      setSelectedFolder(folderId);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
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
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-accent-800">
              📁 Dossiers
            </h3>
            <button
              onClick={() => {
                setShowCreateInput(true);
                setIsExpanded(true);
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

        {/* Collapsible content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Create form */}
          {showCreateInput && (
            <CreateFolderForm
              onCreate={handleCreateFolder}
              onCancel={() => setShowCreateInput(false)}
              isCreating={isCreating}
            />
          )}

          {/* Empty state or folders list */}
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
                  className="px-3 py-1 text-sm"
                />
              )}
            </div>
          ) : (
            <div>
              {/* Search bar */}
              {folders.length > 5 && (
                <div className="mb-4">
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Rechercher dans les dossiers..."
                  />
                </div>
              )}

              {/* Stats */}
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
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      isExpanded={selectedFolder === folder.id}
                      onClick={() => handleFolderClick(folder.id)}
                      onDelete={handleDeleteClick}
                    >
                      <FolderItemsList
                        items={folderItems}
                        isLoading={loadingItems}
                        folderId={folder.id}
                        onAddItem={onAddToLottery}
                        onAddAllItems={onAddFolder}
                      />
                    </FolderCard>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expand arrow */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              const newExpanded = !isExpanded;
              setIsExpanded(newExpanded);

              if (!newExpanded && showCreateInput) {
                setShowCreateInput(false);
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

      {/* Confirm modal */}
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
