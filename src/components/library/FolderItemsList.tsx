import { SavedItem } from "../../lib/savedItemsService";
import Button from "../ui/Button";

interface FolderItemsListProps {
  items: SavedItem[];
  isLoading: boolean;
  folderId: number;
  onAddItem: (itemName: string) => void;
  onAddAllItems: (folderId: number) => Promise<string[]>;
}

const FolderItemsList = ({
  items,
  isLoading,
  folderId,
  onAddItem,
  onAddAllItems,
}: FolderItemsListProps) => {
  const handleAddAll = async () => {
    const itemNames = await onAddAllItems(folderId);
    itemNames.forEach((name) => onAddItem(name));
  };

  if (isLoading) {
    return (
      <div className="ml-4 pl-4 border-l-2 border-yellow-200">
        <div className="text-center py-2">
          <div className="text-sm text-accent-500">Chargement...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ml-4 pl-4 border-l-2 border-yellow-200">
        <div className="text-center py-3">
          <div className="text-accent-500 text-sm">📄 Dossier vide</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-4 pl-4 border-l-2 border-yellow-200 space-y-1">
      {/* Liste des items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="text-sm text-accent-700 truncate flex-1">
              📄 {item.item_name}
            </div>
            <button
              onClick={() => onAddItem(item.item_name)}
              className="text-primary-500 hover:text-primary-700 text-xs px-2 py-1 rounded hover:bg-primary-50 transition-colors"
              title="Ajouter au tirage"
            >
              ➕
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default FolderItemsList;
