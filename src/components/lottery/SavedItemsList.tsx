import { memo, useState, useEffect, useCallback } from "react";
import { loadUserItems, deleteItem } from "../../lib/savedItemsService";
import { UserAuth } from "../../context/AuthContext";

interface SavedItemsListProps {
  onItemDeleted?: (itemName: string) => void; // Callback pour notifier la suppression
  onItemAdded?: (itemName: string) => void; // Callback pour ajouter un item au tirage
}

const SavedItemsList = memo(
  ({ onItemDeleted, onItemAdded }: SavedItemsListProps) => {
    const [savedItems, setSavedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const auth = UserAuth();

    // Charger les items sauvegardés depuis la base de données
    const loadItems = useCallback(async () => {
      if (!auth?.session) {
        setSavedItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await loadUserItems();

        if (result.error) {
          setError(result.error);
          setSavedItems([]);
        } else {
          setSavedItems(result.items.map((item) => item.item_name));
        }
      } catch (err) {
        setError("Erreur lors du chargement des items");
        setSavedItems([]);
      } finally {
        setLoading(false);
      }
    }, [auth?.session]);

    // Charger les items au montage et quand l'authentification change
    useEffect(() => {
      loadItems();
    }, [loadItems]);

    // Supprimer un item
    const handleDeleteItem = useCallback(
      async (itemName: string) => {
        if (!auth?.session) return;

        try {
          const result = await deleteItem(itemName);

          if (result.success) {
            // Retirer l'item de la liste locale
            setSavedItems((prev) => prev.filter((item) => item !== itemName));
            // Notifier le parent (pour mettre à jour ItemsList si nécessaire)
            onItemDeleted?.(itemName);

            // Remettre l'état de sauvegarde à "idle" dans ItemsList
            if ((window as any).resetItemSaveState) {
              (window as any).resetItemSaveState(itemName);
            }

            console.log(`✅ "${itemName}" supprimé avec succès`);
          } else {
            console.error(
              `❌ Erreur suppression de "${itemName}":`,
              result.error
            );
            setError(`Erreur lors de la suppression de "${itemName}"`);
          }
        } catch (error) {
          console.error(`❌ Erreur inattendue pour "${itemName}":`, error);
          setError("Erreur inattendue lors de la suppression");
        }
      },
      [auth?.session, onItemDeleted]
    );

    // Ajouter un item au tirage
    const handleAddToDraw = useCallback(
      (itemName: string) => {
        onItemAdded?.(itemName);
      },
      [onItemAdded]
    );

    // Rafraîchir la liste
    const handleRefresh = useCallback(() => {
      loadItems();
    }, [loadItems]);

    return (
      <div>
        <div className="pr-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-accent-800">
              Items sauvegardés :
            </h3>
            {auth?.session && (
              <button
                onClick={handleRefresh}
                className="text-primary-600 hover:text-primary-800 text-sm"
                title="Rafraîchir la liste"
              >
                🔄
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-secondary-50 border border-secondary-200 p-4 rounded shadow text-center text-secondary-600">
              Chargement...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded shadow text-red-600">
              {error}
            </div>
          ) : savedItems.length === 0 ? (
            <div className="bg-secondary-50 border border-secondary-200 p-4 rounded shadow text-center text-secondary-500">
              {auth?.session
                ? "Aucun item sauvegardé"
                : "Connectez-vous pour sauvegarder des items"}
            </div>
          ) : (
            <ul className="bg-secondary-50 border border-secondary-200 p-4 rounded shadow">
              {savedItems.map((item, idx) => (
                <li
                  key={`saved-${item}-${idx}`}
                  className="group cursor-pointer hover:bg-secondary-100 transition-all duration-200 rounded p-2 border border-transparent hover:border-secondary-300"
                >
                  <div className="flex justify-between items-center">
                    {/* Zone cliquable pour ajouter au tirage */}
                    <button
                      onClick={() => handleAddToDraw(item)}
                      className="flex-1 text-left text-secondary-800 hover:text-primary-600 transition-colors duration-200 group-hover:font-medium"
                      title={`Cliquer pour ajouter "${item}" au tirage`}
                    >
                      <span className="flex items-center">
                        <span className="mr-2 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          ➕
                        </span>
                        {item}
                      </span>
                    </button>

                    {/* Bouton de suppression */}
                    {auth?.session && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empêcher le déclenchement du clic parent
                          handleDeleteItem(item);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors duration-200 ml-2"
                        title="Supprimer cet item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
);

SavedItemsList.displayName = "SavedItemsList";

export default SavedItemsList;
