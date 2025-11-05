import { useState } from "react";
import { SavedItem } from "../../lib/savedItemsService";
import { FolderItem } from "../../lib/foldersService";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import ItemCard from "./ItemCard";

interface FolderCardProps {
  folder: FolderItem;
  isExpanded: boolean;
  onClick: () => void;
  onDelete: (folderName: string) => void;
  // Props pour items
  items: SavedItem[];
  isLoading: boolean;
  lotteryItems: string[];
  folders: FolderItem[];
  onAddItem: (itemName: string) => void;
  onAddAllItems: (folderId: number) => Promise<string[]>;
  onOpenFolderMenu: (item: SavedItem) => void;
  onDeleteItem: (itemName: string) => void;
}

const FolderCard = ({
  folder,
  isExpanded,
  onClick,
  onDelete,
  items,
  isLoading,
  lotteryItems,
  folders,
  onAddItem,
  onAddAllItems,
  onOpenFolderMenu,
  onDeleteItem,
}: FolderCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddAll = async () => {
    const itemNames = await onAddAllItems(folder.id);
    itemNames.forEach((name) => onAddItem(name));
  };

  const isItemInLottery = (itemName: string) => lotteryItems.includes(itemName);

  return (
    <>
      <div className="space-y-1">
        <div
          className={`group bg-white border-2 rounded-lg p-3 hover:border-yellow-300 hover:shadow-sm transition-all duration-200 cursor-pointer ${
            isExpanded
              ? "border-yellow-400 bg-yellow-50"
              : "border-secondary-200"
          }`}
          onClick={onClick}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
              <div
                className={`text-base sm:text-lg transition-transform duration-200 ${
                  isExpanded ? "rotate-12" : ""
                }`}
              >
                {isExpanded ? "📂" : "📁"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-accent-800 text-xs sm:text-sm truncate">
                  {folder.folder_name}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="text-accent-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm ml-2"
              title="Supprimer"
            >
              Effacer
            </button>
          </div>
        </div>

        {/* Items du dossier (si expand) */}
        {isExpanded && (
          <div className="ml-4 pl-4 border-l-2 border-yellow-200 space-y-1">
            {isLoading ? (
              <div className="text-center py-2">
                <div className="text-sm text-accent-500">Chargement...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-3">
                <div className="text-accent-500 text-sm">📄 Dossier vide</div>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    folders={folders}
                    isInLottery={isItemInLottery(item.item_name)}
                    onToggle={onAddItem}
                    onOpenFolderMenu={onOpenFolderMenu}
                    onDelete={onDeleteItem}
                    compact={true}
                    showFolderTags={false}
                  />
                ))}

                {/* Bouton "Tout ajouter" */}
                <div className="flex flex-col">
                  <hr className="my-4" />
                  <Button
                    onClick={handleAddAll}
                    label="Tout ajouter"
                    className="w-full mb-2 py-2 text-sm"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Supprimer le dossier"
        message={`Voulez-vous vraiment supprimer le dossier "${folder.folder_name}" ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={() => {
          onDelete(folder.folder_name);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default FolderCard;
