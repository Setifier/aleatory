import { FolderItem } from "../../lib/foldersService";

interface FolderCardProps {
  folder: FolderItem;
  isExpanded: boolean;
  onClick: () => void;
  onDelete: (folderName: string) => void;
  children?: React.ReactNode; // Pour afficher FolderItemsList
}

const FolderCard = ({
  folder,
  isExpanded,
  onClick,
  onDelete,
  children,
}: FolderCardProps) => {
  return (
    <div className="space-y-1">
      <div
        className={`group bg-white border-2 rounded-lg p-3 hover:border-yellow-300 hover:shadow-sm transition-all duration-200 cursor-pointer ${
          isExpanded ? "border-yellow-400 bg-yellow-50" : "border-secondary-200"
        }`}
        onClick={onClick}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-1">
            <div
              className={`text-lg transition-transform duration-200 ${
                isExpanded ? "rotate-12" : ""
              }`}
            >
              {isExpanded ? "📂" : "📁"}
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
              onDelete(folder.folder_name);
            }}
            className="text-accent-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm ml-2"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Items du dossier (si expand) */}
      {isExpanded && children}
    </div>
  );
};

export default FolderCard;
