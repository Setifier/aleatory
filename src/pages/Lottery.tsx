import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useSavedItems } from "../hooks/useSavedItems";
import { useFolders } from "../hooks/useFolders";

import LotterySection from "../components/lottery/LotterySection";
import ItemsLibrary from "../components/library/ItemsLibrary";

const Lottery = () => {
  const navigate = useNavigate();
  const auth = UserAuth();

  const {
    savedItems,
    savedItemsSet,
    loadingSavedItems,
    savingItems,
    handleSaveItem,
    handleDeleteSavedItem,
    loadSavedItems,
  } = useSavedItems();

  const {
    folders,
    loadingFolders,
    handleCreateFolder,
    handleDeleteFolder,
    handleAddFolder,
    loadFolders,
  } = useFolders();

  const [currentLotteryItems, setCurrentLotteryItems] = useState<string[]>([]);

  const handleAddToLottery = (itemName: string) => {
    const event = new CustomEvent("addItemToLottery", {
      detail: { itemName },
    });
    window.dispatchEvent(event);
  };

  const handleFolderAssignmentChange = () => {
    loadSavedItems();
    loadFolders();

    const event = new CustomEvent("foldersChanged");
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-gradient-to-br from-secondary-50 via-white to-accent-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-accent-600 hover:text-accent-800 flex items-center gap-2 mb-4 transition-colors p-2"
          >
            <svg
              className="w-8 h-8 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden md:inline">Retour à l'accueil</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="relative inline-block">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent mb-2">
              LOTTERY MACHINE
            </h2>
          </div>
          <p className="text-accent-600 text-sm sm:text-base md:text-lg">
            {currentLotteryItems.length === 0
              ? "Ajoutez des éléments pour commencer"
              : currentLotteryItems.length === 1
              ? "Ajoutez au moins 1 élément de plus"
              : `${currentLotteryItems.length} éléments prêts pour le tirage`}
          </p>
        </div>

        {auth?.session && (
          <div className="max-w-4xl mx-auto mb-6">
            <ItemsLibrary
              savedItems={savedItems}
              loadingSavedItems={loadingSavedItems}
              savingItems={savingItems}
              lotteryItems={currentLotteryItems}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteSavedItem}
              onAddItemToLottery={handleAddToLottery}
              folders={folders}
              loadingFolders={loadingFolders}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
              onAddFolder={handleAddFolder}
              onRefreshItems={handleFolderAssignmentChange}
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <LotterySection
            onSaveItem={auth?.session ? handleSaveItem : undefined}
            savedItemsNames={savedItemsSet}
            savingItems={savingItems}
            isAuthenticated={!!auth?.session}
            onLotteryItemsChange={setCurrentLotteryItems}
          />
        </div>
      </div>
    </div>
  );
};

export default Lottery;
