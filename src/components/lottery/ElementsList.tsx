import { LotteryItem } from "../../hooks/useLottery";

interface ElementsListProps {
  items: LotteryItem[];
  isAuthenticated: boolean;
  savedItemsNames: Set<string>;
  savingItems: Set<string>;
  onRemoveItem: (itemId: string) => void;
  onSaveItem: (itemName: string) => Promise<boolean>;
  onClearItems: () => void;
}

const ElementsList = ({
  items,
  isAuthenticated,
  savedItemsNames,
  savingItems,
  onRemoveItem,
  onSaveItem,
  onClearItems,
}: ElementsListProps) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 rounded-xl p-6 text-white shadow-xl border border-accent-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-semibold">Éléments ({items.length})</h3>
        </div>

        <button
          onClick={onClearItems}
          className="text-accent-300 hover:text-red-400 transition-colors text-sm px-3 py-1 rounded-lg border border-accent-600 hover:border-red-400"
        >
          🗑️ Vider la liste
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-accent-700/50 backdrop-blur-sm border border-accent-600 rounded-lg p-4 hover:bg-accent-600/50 transition-all duration-300"
          >
            {/* Badge numéro */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {index + 1}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white font-medium flex-1 mr-3 flex items-center gap-2">
                {item.name}
              </span>

              <div className="flex items-center gap-2">
                {/* Bouton de sauvegarde si authentifié */}
                {isAuthenticated && (
                  <>
                    {savingItems.has(item.name) ? (
                      <div
                        className="text-blue-300 animate-spin"
                        title="Sauvegarde..."
                      >
                        ⏳
                      </div>
                    ) : savedItemsNames.has(item.name) ? (
                      <div className="text-green-300" title="Déjà sauvegardé">
                        ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => onSaveItem(item.name)}
                        className="text-accent-300 hover:text-green-300 transition-colors"
                        title="Sauvegarder"
                      >
                        💾
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-accent-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Retirer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElementsList;
