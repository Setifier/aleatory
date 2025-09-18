import { useState } from "react";
import { SavedItem } from "../../lib/savedItemsService";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";

interface SavedItemsManagerProps {
  savedItems: SavedItem[];
  isLoading: boolean;
  onDeleteItem: (itemName: string) => void;
  onAddToLottery: (itemName: string) => void;
  lotteryItems: string[]; // Pour savoir quels items sont déjà dans le tirage
}

const SavedItemsManager = ({
  savedItems,
  isLoading,
  onDeleteItem,
  onAddToLottery,
  lotteryItems,
}: SavedItemsManagerProps) => {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    message: "",
    action: () => {},
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrer les items selon la recherche
  const filteredItems = savedItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (itemName: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Supprimer définitivement "${itemName}" ?`,
      action: () => {
        onDeleteItem(itemName);
        setConfirmModal({ isOpen: false, message: "", action: () => {} });
      },
    });
  };

  const handleAddToLottery = (itemName: string) => {
    onAddToLottery(itemName);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-4 border border-secondary-200 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-accent-800">
            Éléments sauvegardés
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-accent-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-4 border border-secondary-200 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xl font-semibold text-accent-800">
            💾 Éléments sauvegardés
          </h3>
          {savedItems.length > 0 && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium items-center">
              {savedItems.length}
            </span>
          )}
        </div>

        {/* Contenu collapsible */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {savedItems.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2 opacity-50">💾</div>
              <p className="text-accent-600 text-sm mb-1">
                Aucun élément sauvegardé
              </p>
              <p className="text-accent-500 text-xs">
                Sauvegardez depuis le tirage
              </p>
            </div>
          ) : (
            <>
              {/* Barre de recherche */}
              {savedItems.length > 5 && (
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher dans la liste..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    />

                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-400 hover:text-accent-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Statistiques */}
              {searchTerm && (
                <div className="mb-4 text-sm text-accent-600">
                  {filteredItems.length} résultat
                  {filteredItems.length > 1 ? "s" : ""} sur {savedItems.length}
                </div>
              )}

              {/* Liste des items */}
              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-accent-500 text-xs">
                      Aucun résultat pour "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isInLottery = lotteryItems.includes(item.item_name);

                    return (
                      <div
                        key={item.id}
                        className="group bg-white border border-secondary-200 rounded-lg p-3 hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-accent-800 text-sm truncate">
                              {item.item_name}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-3">
                            {/* Status dans le tirage */}
                            {isInLottery ? (
                              <div
                                className="text-green-500 text-sm"
                                title="Déjà dans le tirage"
                              >
                                ✓
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleAddToLottery(item.item_name)
                                }
                                className="text-primary-500 hover:text-primary-700 transition-colors text-sm px-1 py-1 rounded hover:bg-primary-50"
                                title="Ajouter au tirage"
                              >
                                ➕
                              </button>
                            )}

                            {/* Bouton supprimer */}
                            <button
                              onClick={() => handleDeleteClick(item.item_name)}
                              className="text-accent-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm"
                              title="Supprimer définitivement"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Actions en bas */}
              {savedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <div className="flex justify-center items-center text-sm text-accent-600 mb-2">
                    {/* Bouton "Tout ajouter au tirage" */}
                    {filteredItems.some(
                      (item) => !lotteryItems.includes(item.item_name)
                    ) && (
                      <Button
                        onClick={() => {
                          filteredItems
                            .filter(
                              (item) => !lotteryItems.includes(item.item_name)
                            )
                            .forEach((item) =>
                              handleAddToLottery(item.item_name)
                            );
                        }}
                        label="Tout ajouter"
                        className="bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm px-4 py-2"
                      />
                    )}
                  </div>
                  <div className="text-center text-sm text-accent-600">
                    {savedItems.length} élément
                    {savedItems.length > 1 ? "s" : ""} sauvegardé
                    {savedItems.length > 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Flèche d'expansion en bas au centre */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-accent-400 hover:text-accent-600 transition-colors pt-2"
          >
            <div
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() =>
          setConfirmModal({ isOpen: false, message: "", action: () => {} })
        }
        isDestructive={true}
      />
    </>
  );
};

export default SavedItemsManager;
