import { SavedItem } from "../../lib/savedItemsService";
import { FolderItem } from "../../lib/foldersService";
import ItemCard from "./ItemCard";

interface SavedItemCardProps {
  item: SavedItem;
  folders: FolderItem[];
  isInLottery: boolean;
  onAddToLottery: (itemName: string) => void;
  onOpenFolderMenu: (item: SavedItem) => void;
  onDelete: (itemName: string) => void;
}

const SavedItemCard = ({
  item,
  folders,
  isInLottery,
  onAddToLottery,
  onOpenFolderMenu,
  onDelete,
}: SavedItemCardProps) => {
  return (
    <ItemCard
      item={item}
      folders={folders}
      isInLottery={isInLottery}
      onToggle={onAddToLottery}
      onOpenFolderMenu={onOpenFolderMenu}
      onDelete={onDelete}
      compact={false}
      showFolderTags={true}
    />
  );
};

export default SavedItemCard;
