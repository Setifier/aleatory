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

  // Hooks pour saved items et folders
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

  // State pour communiquer entre composants - items dans le tirage
  const [currentLotteryItems, setCurrentLotteryItems] = useState<string[]>([]);

  // Fonction pour ajouter un item au tirage depuis SavedItemsManager/FoldersManager
  const handleAddToLottery = (itemName: string) => {
    const event = new CustomEvent("addItemToLottery", {
      detail: { itemName },
    });
    window.dispatchEvent(event);
  };

  // Fonction pour synchroniser folders/items après assignation
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
            className="text-accent-600 hover:text-accent-800 flex items-center gap-2 mb-4 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ItemsLibrary - Visible seulement si connecté */}
          {auth?.session && (
            <div className="lg:w-96 w-full">
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

          {/* Section principale - Tirage au sort */}
          <div className="flex-1 max-w-4xl mx-auto w-full">
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
    </div>
  );
};

export default Lottery;
