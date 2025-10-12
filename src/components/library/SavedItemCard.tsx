import { SavedItem } from "../../lib/savedItemsService";
import DropdownMenu from "../ui/DropdownMenu";

interface SavedItemCardProps {
  item: SavedItem;
  isInLottery: boolean;
  onAddToLottery: (itemName: string) => void;
  onOpenFolderMenu: (item: SavedItem) => void;
  onDelete: (itemName: string) => void;
}

const SavedItemCard = ({
  item,
  isInLottery,
  onAddToLottery,
  onOpenFolderMenu,
  onDelete,
}: SavedItemCardProps) => {
  const handleCardClick = () => {
    onAddToLottery(item.item_name);
  };

  const dropdownItems = [
    {
      label: "Trier",
      icon: "📁",
      onClick: () => onOpenFolderMenu(item),
    },
    {
      label: "Supprimer",
      icon: "🗑️",
      onClick: () => onDelete(item.item_name),
      variant: "danger" as const,
    },
  ];

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative rounded-lg p-3 border-2 transition-all duration-200 cursor-pointer
        ${
          isInLottery
            ? "bg-green-50 border-green-400 shadow-md"
            : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm"
        }
      `}
    >
      {/* Checkmark si dans le tirage */}
      {isInLottery && (
        <div className="absolute top-2 left-2 text-green-600 text-lg">✓</div>
      )}

      <div className="flex justify-between items-start gap-2">
        {/* Nom de l'item */}
        <div className="flex-1 min-w-0 pl-6">
          <div
            className={`font-medium text-sm truncate ${
              isInLottery ? "text-green-800" : "text-accent-800"
            }`}
          >
            {item.item_name}
          </div>

          {/* Tags folders */}
          {item.folder_ids && item.folder_ids.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.folder_ids.slice(0, 2).map((folderId) => (
                <span
                  key={folderId}
                  className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full"
                >
                  📁
                </span>
              ))}
              {item.folder_ids.length > 2 && (
                <span className="text-xs text-accent-500">
                  +{item.folder_ids.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dropdown menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu items={dropdownItems} />
        </div>
      </div>
    </div>
  );
};

export default SavedItemCard;
