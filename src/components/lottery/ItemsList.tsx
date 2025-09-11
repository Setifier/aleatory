import { memo, useCallback, useState, useEffect } from "react";
import { checkItemExists, saveItem } from "../../lib/savedItemsService";

interface ItemListProps {
  items: string[];
  onRemoveItem: (index: number) => void;
  onSaveItem: (item: string) => void;
  onItemRemoved?: (itemName: string) => void; // Callback quand un item est supprimé de la liste
}

interface ItemSaveState {
  [key: string]: "saving" | "saved" | "error" | "idle";
}

const ItemList = memo(
  ({ items, onRemoveItem, onSaveItem, onItemRemoved }: ItemListProps) => {
    const [saveStates, setSaveStates] = useState<ItemSaveState>({});

    // Vérifier l'état de sauvegarde de chaque item au chargement et quand items change
    useEffect(() => {
      const checkExistingItems = async () => {
        console.log("🔍 Vérification des items en base de données...");
        const newSaveStates: ItemSaveState = {};

        for (const item of items) {
          try {
            const { exists, error } = await checkItemExists(item);
            if (error) {
              console.error(`❌ Erreur vérification pour "${item}":`, error);
              newSaveStates[item] = "idle";
            } else {
              newSaveStates[item] = exists ? "saved" : "idle";
              console.log(
                `📊 "${item}": ${exists ? "✅ Déjà en base" : "💾 Pas en base"}`
              );
            }
          } catch (error) {
            console.error(`❌ Erreur inattendue pour "${item}":`, error);
            newSaveStates[item] = "idle";
          }
        }

        setSaveStates(newSaveStates);
        console.log("🎯 États de sauvegarde mis à jour:", newSaveStates);
      };

      if (items.length > 0) {
        checkExistingItems();
      }
    }, [items]);

    const handleSaveItem = useCallback(
      async (item: string) => {
        // Ne pas permettre la sauvegarde si déjà sauvegardé
        if (saveStates[item] === "saved") {
          console.log(`ℹ️ "${item}" est déjà sauvegardé, pas d'action`);
          return;
        }

        console.log(`💾 Tentative de sauvegarde de "${item}"...`);

        // Marquer comme en cours de sauvegarde
        setSaveStates((prev) => ({ ...prev, [item]: "saving" }));

        try {
          const result = await saveItem(item);

          if (result.success) {
            setSaveStates((prev) => ({ ...prev, [item]: "saved" }));
            console.log(`✅ "${item}" sauvegardé avec succès en base`);
            onSaveItem(item); // Notifier le parent
          } else {
            setSaveStates((prev) => ({ ...prev, [item]: "error" }));
            console.error(`❌ Erreur sauvegarde de "${item}":`, result.error);
          }
        } catch (error) {
          setSaveStates((prev) => ({ ...prev, [item]: "error" }));
          console.error(`❌ Erreur inattendue pour "${item}":`, error);
        }
      },
      [saveStates, onSaveItem]
    );

    // Créer une fonction pour remettre l'état de sauvegarde à "idle"
    const resetItemSaveState = useCallback((itemName: string) => {
      setSaveStates((prev) => ({ ...prev, [itemName]: "idle" }));
      console.log(
        `🔄 État de sauvegarde de "${itemName}" remis à "idle" (disquette)`
      );
    }, []);

    // Exposer cette fonction via une ref pour que RandomPicker puisse l'appeler
    useEffect(() => {
      if (onItemRemoved) {
        // Créer une fonction globale simple qui appelle resetItemSaveState
        (window as any).resetItemSaveState = resetItemSaveState;

        return () => {
          delete (window as any).resetItemSaveState;
        };
      }
    }, [onItemRemoved, resetItemSaveState]);

    return (
      <ul>
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex justify-between items-center bg-secondary-50 border border-secondary-200 p-2 mb-2 rounded"
          >
            <span>{item}</span>
            <div className="flex gap-1">
              {/* Bouton de sauvegarde avec états visuels */}
              {saveStates[item] === "saved" ? (
                // ✅ Item déjà sauvegardé - Coche verte non-cliquable
                <div
                  className="text-green-500 p-1 cursor-default"
                  title="Sauvegardé"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : saveStates[item] === "saving" ? (
                // 🔄 En cours de sauvegarde - Spinner
                <div
                  className="text-blue-500 p-1 animate-spin"
                  title="Sauvegarde en cours..."
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              ) : saveStates[item] === "error" ? (
                // ❌ Erreur de sauvegarde - Icône d'erreur cliquable pour réessayer
                <button
                  onClick={() => handleSaveItem(item)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Erreur de sauvegarde - Cliquer pour réessayer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                // 💾 Item non sauvegardé - Disquette cliquable
                <button
                  onClick={() => handleSaveItem(item)}
                  className="text-primary-500 hover:text-primary-700 p-1"
                  title="Sauvegarder en base de données"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17 3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10zm-5 14v-4h2v4m-6-8h8v2H6V9z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onRemoveItem(index)}
                className="text-accent-600 hover:text-accent-800 p-1"
                title="Supprimer"
              >
                X
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }
);

ItemList.displayName = "ItemList";

export default ItemList;
