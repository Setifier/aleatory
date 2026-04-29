import { LotteryItem } from "../../hooks/useLottery";

interface ElementsListProps {
  items: LotteryItem[];
  onRemoveItem: (itemId: string) => void;
  onClearItems: () => void;
}

const ElementsList = ({
  items,
  onRemoveItem,
  onClearItems,
}: ElementsListProps) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 rounded-xl p-4 sm:p-6 text-white shadow-xl border border-accent-700">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold">Éléments ({items.length})</h3>
        </div>

        <button
          onClick={onClearItems}
          className="text-accent-300 hover:text-red-400 transition-colors text-base sm:text-sm px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-xl sm:rounded-lg border border-accent-600 hover:border-red-400"
          title="Vider la liste"
        >
          <span className="sm:hidden">🗑️</span>
          <span className="hidden sm:inline">🗑️ Vider la liste</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-accent-700/50 backdrop-blur-sm border border-accent-600 rounded-lg p-2.5 sm:p-4 hover:bg-accent-600/50 transition-all duration-300"
          >
            <div className="absolute -top-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {index + 1}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white font-medium flex-1 mr-2 sm:mr-3 text-sm sm:text-base break-words">
                {item.name}
              </span>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-accent-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Retirer"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElementsList;
