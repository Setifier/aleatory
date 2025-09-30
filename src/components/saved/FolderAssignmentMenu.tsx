import { useState, useEffect, useRef } from "react";
import { FolderItem, loadUserFolders, createFolder } from "../../lib/foldersService";
import { toggleItemFolder } from "../../lib/savedItemsService";

interface FolderAssignmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  itemName: string;
  currentFolderIds?: number[]; // Array de dossiers au lieu d'un seul
  onAssignmentChange: () => void;
  position: { x: number; y: number };
}

const FolderAssignmentMenu = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  currentFolderIds = [],
  onAssignmentChange,
  position
}: FolderAssignmentMenuProps) => {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadFoldersList();
    }
  }, [isOpen]);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const loadFoldersList = async () => {
    const result = await loadUserFolders();
    if (result.success) {
      setFolders(result.folders);
    } else {
      setError(result.error || "Erreur lors du chargement des dossiers");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError("Le nom du dossier est requis");
      return;
    }

    setLoading(true);
    setError("");

    const result = await createFolder(newFolderName.trim());
    if (result.success && result.folder) {
      // Ajouter le nouveau dossier à la liste
      setFolders(prev => [result.folder!, ...prev]);

      // Assigner automatiquement l'item au nouveau dossier
      await handleFolderToggle(result.folder.id, true);

      // Reset du formulaire
      setNewFolderName("");
      setShowCreateForm(false);
    } else {
      setError(result.error || "Erreur lors de la création du dossier");
    }
    setLoading(false);
  };

  const handleFolderToggle = async (folderId: number, shouldAssign: boolean) => {
    console.log("🔄 Toggle demandé:", { itemId, itemName, folderId, shouldAssign });

    // Ajouter ce dossier au loading
    setLoadingFolders(prev => new Set([...prev, folderId]));
    setError("");
    setSuccess("");

    const result = await toggleItemFolder(itemId, folderId, shouldAssign);
    console.log("📋 Résultat toggle:", result);

    // Retirer ce dossier du loading
    setLoadingFolders(prev => {
      const newSet = new Set(prev);
      newSet.delete(folderId);
      return newSet;
    });

    if (result.success) {
      console.log("✅ Toggle réussi!");
      const folderName = folders.find(f => f.id === folderId)?.folder_name;
      const action = shouldAssign ? "ajouté à" : "retiré de";
      setSuccess(`✅ ${action}: ${folderName}`);
      onAssignmentChange(); // Notifier le parent pour rafraîchir

      // Effacer le message de succès après un délai
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } else {
      console.error("❌ Erreur toggle:", result.error);
      setError(result.error || "Erreur lors de l'assignation");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay transparent */}
      <div className="fixed inset-0 z-40" />

      {/* Menu contextuel */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-64"
        style={{
          left: Math.min(position.x, window.innerWidth - 280),
          top: Math.min(position.y, window.innerHeight - 300),
        }}
      >
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Organiser "{itemName}"
              </p>
              {currentFolderIds.length > 0 && (
                <p className="text-xs text-gray-500">
                  Dans {currentFolderIds.length} dossier{currentFolderIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-red-600 bg-red-50">
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-2 text-sm text-green-600 bg-green-50">
            {success}
          </div>
        )}

        {/* Création rapide de dossier */}
        <div className="border-b border-gray-100">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="text-blue-600">+</span>
              Créer un dossier
            </button>
          ) : (
            <div className="p-4 space-y-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nom du dossier"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  } else if (e.key === 'Escape') {
                    setShowCreateForm(false);
                    setNewFolderName("");
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  disabled={loading || !newFolderName.trim()}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "..." : "Créer"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewFolderName("");
                    setError("");
                  }}
                  disabled={loading}
                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des dossiers */}
        <div className="max-h-48 overflow-y-auto">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={currentFolderIds.includes(folder.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFolderToggle(folder.id, e.target.checked);
                }}
                disabled={loadingFolders.has(folder.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-yellow-600">📁</span>
              <span className="text-gray-700">{folder.folder_name}</span>
              {loadingFolders.has(folder.id) && (
                <span className="ml-auto text-xs text-blue-500">⏳</span>
              )}
            </div>
          ))}

          {folders.length === 0 && !loading && (
            <div className="px-4 py-2 text-sm text-gray-500 italic">
              Aucun dossier créé
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FolderAssignmentMenu;