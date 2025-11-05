import { useEffect } from "react";
import { LotteryItem } from "../../hooks/useLottery";

interface ElementsListModalProps {
  isOpen: boolean;
  elements: LotteryItem[];
  winner: LotteryItem;
  title?: string;
  onClose: () => void;
}

const ElementsListModal = ({
  isOpen,
  elements,
  winner,
  title,
  onClose,
}: ElementsListModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (!elements || elements.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full border border-secondary-200 shadow-2xl">
          <div className="text-center">
            <h3 className="text-lg font-bold text-accent-800 mb-3">
              Liste non disponible
            </h3>
            <p className="text-accent-600 mb-4">
              La liste des éléments n'est pas disponible pour ce tirage.
            </p>
            <button
              onClick={onClose}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden border border-secondary-200 shadow-2xl">

        <div className="mb-4">
          <h3 className="text-xl font-bold text-accent-800 mb-1">
            {title || "Liste des éléments"}
          </h3>
          <p className="text-sm text-accent-500">
            {elements.length} élément{elements.length > 1 ? 's' : ''} au total
          </p>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {elements.map((element, index) => {
            const isWinner = element.name === winner.name;

            return (
              <div
                key={`${element.id}-${index}`}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-all duration-200
                  ${isWinner
                    ? "bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300 shadow-sm"
                    : "bg-secondary-50 border border-secondary-200 hover:bg-secondary-100"
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isWinner
                        ? "bg-green-600 text-white"
                        : "bg-accent-300 text-accent-700"
                      }
                    `}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`
                      font-medium truncate
                      ${isWinner ? "text-green-800" : "text-accent-800"}
                    `}
                  >
                    {element.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  {isWinner && (
                    <div className="flex items-center gap-1">
                      <span className="text-lg">🏆</span>
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        GAGNANT
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-secondary-200">
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementsListModal;