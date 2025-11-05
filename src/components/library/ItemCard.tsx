import { useState } from "react";
import { SavedItem } from "../../lib/savedItemsService";
import { FolderItem } from "../../lib/foldersService";
import DropdownMenu from "../ui/DropdownMenu";
import ConfirmModal from "../ui/ConfirmModal";

interface ItemCardProps {
  item: SavedItem;
  folders: FolderItem[];
  isInLottery: boolean;
  onToggle: (itemName: string) => void;
  onOpenFolderMenu: (item: SavedItem) => void;
  onDelete: (itemName: string) => void;
  compact?: boolean;
  showFolderTags?: boolean;
}

const ItemCard = ({
  item,
  folders,
  isInLottery,
  onToggle,
  onOpenFolderMenu,
  onDelete,
  compact = false,
  showFolderTags = true,
}: ItemCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dropdownItems = [
    {
      label: "Trier",
      icon: "📁",
      onClick: () => onOpenFolderMenu(item),
    },
    {
      label: "Supprimer",
      icon: "🗑️",
      onClick: () => setShowDeleteConfirm(true),
      variant: "danger" as const,
    },
  ];

  const folderNames =
    item.folder_ids
      ?.map((id) => folders.find((f) => f.id === id)?.folder_name)
      .filter(Boolean) || [];

  return (
    <>
      <div
        onClick={() => onToggle(item.item_name)}
        className={`
          group rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${compact ? "p-2" : "p-3"}
          ${
            isInLottery
              ? "bg-primary-200 border-primary-500 shadow-md"
              : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm"
          }
        `}
      >
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0 ">
            <div
              className={`font-medium truncate ml-2 ${
                compact ? "text-sm sm:text-base" : "text-base sm:text-lg"
              }`}
            >
              {item.item_name}
            </div>

            {showFolderTags && folderNames.length > 0 && (
              <div className="mt-1 ml-2 text-xs text-secondary-500">
                {folderNames.join(", ")}
              </div>
            )}
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu items={dropdownItems} />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Supprimer l'élément"
        message={`Voulez-vous vraiment supprimer "${item.item_name}" ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={() => {
          onDelete(item.item_name);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default ItemCard;
