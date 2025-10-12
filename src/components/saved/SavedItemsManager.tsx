import { useState } from "react";
import { SavedItem } from "../../lib/savedItemsService";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import SearchBar from "../ui/SearchBar";
import FolderAssignmentMenu from "../library/FolderAssignmentMenu";
import QuickAddItemForm from "../library/QuickAddItemForm";

interface SavedItemsManagerProps {
  savedItems: SavedItem[];
  isLoading: boolean;
  onDeleteItem: (itemName: string) => void;
  onAddToLottery: (itemName: string) => void;
  onSaveItem?: (itemName: string) => Promise<boolean>; // Fonction pour sauvegarder
  lotteryItems: string[]; // Pour savoir quels items sont déjà dans le tirage
  onRefreshItems: () => void; // Pour rafraîchir après assignation de dossier
}

const SavedItemsManager = ({
  savedItems,
  isLoading,
  onDeleteItem,
  onAddToLottery,
  onSaveItem,
  lotteryItems,
  onRefreshItems,
}: SavedItemsManagerProps) => {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    message: "",
    action: () => {},
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [folderMenu, setFolderMenu] = useState<{
    isOpen: boolean;
    itemId: number;
    itemName: string;
    currentFolderId?: number | null;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    itemId: 0,
    itemName: "",
    currentFolderId: null,
    position: { x: 0, y: 0 },
  });

  // Filtrer les items selon la recherche
  const filteredItems = savedItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (itemName: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Supprimer définitivement "${itemName}" ?`,
      action: () => {
        onDeleteItem(itemName);
        setConfirmModal({ isOpen: false, message: "", action: () => {} });
      },
    });
  };

  const handleAddToLottery = (itemName: string) => {
    onAddToLottery(itemName);
  };

  const handleOpenFolderMenu = (event: React.MouseEvent, item: SavedItem) => {
    event.preventDefault(); // Empêcher le clic droit par défaut
    event.stopPropagation();
    setFolderMenu({
      isOpen: true,
      itemId: item.id,
      itemName: item.item_name,
      currentFolderId: item.folder_id,
      position: {
        x: event.clientX,
        y: event.clientY,
      },
    });
  };

  const closeFolderMenu = () => {
    setFolderMenu({
      isOpen: false,
      itemId: 0,
      itemName: "",
      currentFolderId: null,
      position: { x: 0, y: 0 },
    });
  };

  const handleFolderAssignmentChange = () => {
    // Rafraîchir la liste complète après assignation
    onRefreshItems();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-4 border border-secondary-200 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-accent-800">
            Éléments sauvegardés
          </h3>
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
              💾 Éléments sauvegardés
            </h3>
            {onSaveItem && (
              <button
                onClick={() => {
                  setShowQuickAdd(true);
                  setIsExpanded(true); // Forcer l'expansion
                }}
                className="text-primary-500 hover:text-primary-700 transition-colors p-1 rounded hover:bg-primary-50"
                title="Ajouter un élément"
              >
                ➕
              </button>
            )}
          </div>
          {savedItems.length > 0 && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium items-center">
              {savedItems.length}
            </span>
          )}
        </div>

        {/* Contenu collapsible */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Formulaire d'ajout rapide */}
          {showQuickAdd && onSaveItem && (
            <QuickAddItemForm
              onAddItem={onSaveItem}
              onCancel={() => setShowQuickAdd(false)}
            />
          )}

          {savedItems.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2 opacity-50">💾</div>
              <p className="text-accent-600 text-sm mb-1">
                Aucun élément sauvegardé
              </p>
              <p className="text-accent-500 text-xs">
                {onSaveItem
                  ? "Cliquez sur ➕ pour ajouter un élément"
                  : "Sauvegardez depuis le tirage"}
              </p>
            </div>
          ) : (
            <>
              {/* Barre de recherche */}
              {savedItems.length > 5 && (
                <div className="mb-4">
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Rechercher dans la liste..."
                  />
                </div>
              )}

              {/* Statistiques */}
              {searchTerm && (
                <div className="mb-4 text-sm text-accent-600">
                  {filteredItems.length} résultat
                  {filteredItems.length > 1 ? "s" : ""} sur {savedItems.length}
                </div>
              )}

              {/* Liste des items */}
              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-accent-500 text-xs">
                      Aucun résultat pour "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isInLottery = lotteryItems.includes(item.item_name);

                    return (
                      <div
                        key={item.id}
                        className="group bg-white border border-secondary-200 rounded-lg p-3 hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-accent-800 text-sm truncate">
                              {item.item_name}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-3">
                            {/* Status dans le tirage */}
                            {isInLottery ? (
                              <div
                                className="text-green-500 text-sm"
                                title="Déjà dans le tirage"
                              >
                                ✓
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleAddToLottery(item.item_name)
                                }
                                className="text-primary-500 hover:text-primary-700 transition-colors text-sm px-1 py-1 rounded hover:bg-primary-50"
                                title="Ajouter au tirage"
                              >
                                ➕
                              </button>
                            )}

                            {/* Bouton dossier */}
                            <button
                              onClick={(e) => handleOpenFolderMenu(e, item)}
                              className="text-yellow-600 hover:text-yellow-700 transition-colors opacity-0 group-hover:opacity-100 text-sm px-1 py-1 rounded hover:bg-yellow-50"
                              title="Organiser dans un dossier"
                            >
                              📁
                            </button>

                            {/* Bouton supprimer */}
                            <button
                              onClick={() => handleDeleteClick(item.item_name)}
                              className="text-accent-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm"
                              title="Supprimer définitivement"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Actions en bas */}
              {savedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <div className="flex justify-center items-center text-sm text-accent-600 mb-2">
                    {/* Bouton "Tout ajouter au tirage" */}
                    {filteredItems.some(
                      (item) => !lotteryItems.includes(item.item_name)
                    ) && (
                      <Button
                        onClick={() => {
                          filteredItems
                            .filter(
                              (item) => !lotteryItems.includes(item.item_name)
                            )
                            .forEach((item) =>
                              handleAddToLottery(item.item_name)
                            );
                        }}
                        label="Tout ajouter"
                        className="w-full text-sm py-2"
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Flèche d'expansion en bas au centre */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              const newExpanded = !isExpanded;
              setIsExpanded(newExpanded);

              // Si on ferme la section, fermer aussi le formulaire de création
              if (!newExpanded && showQuickAdd) {
                setShowQuickAdd(false);
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

      {/* Menu contextuel pour dossiers */}
      <FolderAssignmentMenu
        isOpen={folderMenu.isOpen}
        onClose={closeFolderMenu}
        itemId={folderMenu.itemId}
        itemName={folderMenu.itemName}
        currentFolderIds={
          savedItems.find((item) => item.id === folderMenu.itemId)
            ?.folder_ids || []
        }
        onAssignmentChange={handleFolderAssignmentChange}
        position={folderMenu.position}
      />
    </>
  );
};

export default SavedItemsManager;
