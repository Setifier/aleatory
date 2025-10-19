import { useState } from "react";
import { SavedItem } from "../../lib/savedItemsService";
import { FolderItem } from "../../lib/foldersService";
import SearchBar from "../ui/SearchBar";
import QuickAddItemForm from "./QuickAddItemForm";
import SavedItemCard from "./SavedItemCard";
import FolderAssignmentMenu from "./FolderAssignmentMenu";
import CreateFolderForm from "./CreateFolderForm";
import FolderCard from "./FolderCard";

type Tab = "folders" | "items" | null;

interface ItemsLibraryProps {
  // Items
  savedItems: SavedItem[];
  loadingSavedItems: boolean;
  savingItems: Set<string>;
  lotteryItems: string[];
  onSaveItem: (itemName: string) => Promise<boolean>;
  onDeleteItem: (itemName: string) => void;
  onAddItemToLottery: (itemName: string) => void;

  // Folders
  folders: FolderItem[];
  loadingFolders: boolean;
  onCreateFolder: (folderName: string) => Promise<void>;
  onDeleteFolder: (folderName: string) => void;
  onAddFolder: (folderId: number) => Promise<string[]>;

  // Folder assignment
  onRefreshItems: () => void;
}

const ItemsLibrary = ({
  savedItems,
  loadingSavedItems,
  lotteryItems,
  onSaveItem,
  onDeleteItem,
  onAddItemToLottery,
  folders,
  loadingFolders,
  onCreateFolder,
  onDeleteFolder,
  onAddFolder,
  onRefreshItems,
}: ItemsLibraryProps) => {
  const [activeTab, setActiveTab] = useState<Tab>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Items states
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [selectedItemForFolder, setSelectedItemForFolder] =
    useState<SavedItem | null>(null);

  // Folders states
  const [showCreateFolderForm, setShowCreateFolderForm] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [folderItems, setFolderItems] = useState<SavedItem[]>([]);
  const [loadingFolderItems, setLoadingFolderItems] = useState(false);

  // Filter items and folders based on search
  const filteredItems = savedItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter((folder) =>
    folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if item is in lottery
  const isItemInLottery = (itemName: string) => lotteryItems.includes(itemName);

  // Handle folder creation
  const handleCreateFolder = async (folderName: string) => {
    setIsCreatingFolder(true);
    try {
      await onCreateFolder(folderName);
      setShowCreateFolderForm(false);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Handle folder click (expand/collapse)
  const handleFolderClick = async (folderId: number) => {
    if (selectedFolder === folderId) {
      setSelectedFolder(null);
      setFolderItems([]);
    } else {
      setSelectedFolder(folderId);
      setLoadingFolderItems(true);

      // Load items from this folder
      const { getItemsByFolder } = await import("../../lib/savedItemsService");
      const result = await getItemsByFolder(folderId);

      if (result.success && result.items) {
        setFolderItems(result.items);
      }
      setLoadingFolderItems(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-4 border border-secondary-200 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-primary-700 rounded-full animate-pulse"></div>
        <h3 className="text-xl font-semibold text-accent-800">Bibliothèque</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-secondary-200">
        <button
          onClick={() =>
            setActiveTab(activeTab === "folders" ? null : "folders")
          }
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200 border-b-2 ${
            activeTab === "folders"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-accent-600 hover:text-accent-800"
          }`}
        >
          <span>📁</span>
          <span>Dossiers</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
              activeTab === "folders"
                ? "bg-primary-100 text-primary-700"
                : "bg-accent-100 text-accent-700"
            }`}
          >
            {filteredFolders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "items" ? null : "items")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200 border-b-2 ${
            activeTab === "items"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-accent-600 hover:text-accent-800"
          }`}
        >
          <span>💾</span>
          <span>Éléments</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
              activeTab === "items"
                ? "bg-primary-100 text-primary-700"
                : "bg-accent-100 text-accent-700"
            }`}
          >
            {filteredItems.length}
          </span>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab && (
        <div className="min-h-[400px] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* FOLDERS TAB */}
          {activeTab === "folders" && (
            <div>
              <div className="mb-4">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="🔍 Rechercher dans les dossiers..."
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-accent-800">
                  {searchTerm
                    ? `Résultats pour "${searchTerm}"`
                    : "Tous les dossiers"}
                </h3>
                <button
                  onClick={() => setShowCreateFolderForm(!showCreateFolderForm)}
                  className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                >
                  ➕ Nouveau dossier
                </button>
              </div>

              {showCreateFolderForm && (
                <CreateFolderForm
                  onCreate={handleCreateFolder}
                  onCancel={() => setShowCreateFolderForm(false)}
                  isCreating={isCreatingFolder}
                />
              )}

              {loadingFolders ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-accent-600">Chargement...</p>
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3 opacity-50">📁</div>
                  <p className="text-accent-600 font-medium mb-1">
                    {searchTerm ? "Aucun dossier trouvé" : "Aucun dossier"}
                  </p>
                  {searchTerm && (
                    <p className="text-accent-500 text-sm">
                      Aucun résultat pour "{searchTerm}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {filteredFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      isExpanded={selectedFolder === folder.id}
                      onClick={() => handleFolderClick(folder.id)}
                      onDelete={onDeleteFolder}
                      items={folderItems}
                      isLoading={loadingFolderItems}
                      lotteryItems={lotteryItems}
                      folders={folders}
                      onAddItem={onAddItemToLottery}
                      onAddAllItems={onAddFolder}
                      onOpenFolderMenu={setSelectedItemForFolder}
                      onDeleteItem={onDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ITEMS TAB */}
          {activeTab === "items" && (
            <div>
              <div className="mb-4">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="🔍 Rechercher dans les éléments..."
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-accent-800">
                  {searchTerm
                    ? `Résultats pour "${searchTerm}"`
                    : "Tous les éléments"}
                </h3>
                <button
                  onClick={() => setShowAddItemForm(!showAddItemForm)}
                  className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                >
                  ➕ Nouvel élément
                </button>
              </div>

              {showAddItemForm && (
                <QuickAddItemForm
                  onAddItem={async (itemName) => {
                    const success = await onSaveItem(itemName);
                    if (success) {
                      onRefreshItems(); // ✅ Rafraîchir pour récupérer les vrais IDs
                    }
                    return success;
                  }}
                  onCancel={() => setShowAddItemForm(false)}
                />
              )}

              {loadingSavedItems ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-accent-600">Chargement...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3 opacity-50">💾</div>
                  <p className="text-accent-600 font-medium mb-1">
                    {searchTerm
                      ? "Aucun élément trouvé"
                      : "Aucun élément sauvegardé"}
                  </p>
                  {searchTerm && (
                    <p className="text-accent-500 text-sm">
                      Aucun résultat pour "{searchTerm}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto overflow-x-visible custom-scrollbar">
                  {filteredItems.map((item) => (
                    <SavedItemCard
                      key={item.id}
                      item={item}
                      folders={folders}
                      isInLottery={isItemInLottery(item.item_name)}
                      onAddToLottery={onAddItemToLottery}
                      onDelete={onDeleteItem}
                      onOpenFolderMenu={(item) =>
                        setSelectedItemForFolder(item)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Folder Assignment Menu */}
      {selectedItemForFolder && (
        <FolderAssignmentMenu
          isOpen={true}
          itemId={selectedItemForFolder.id}
          itemName={selectedItemForFolder.item_name}
          currentFolderIds={
            savedItems.find((item) => item.id === selectedItemForFolder.id)
              ?.folder_ids || []
          }
          onClose={() => setSelectedItemForFolder(null)}
          onAssignmentChange={onRefreshItems}
        />
      )}
    </div>
  );
};

export default ItemsLibrary;
