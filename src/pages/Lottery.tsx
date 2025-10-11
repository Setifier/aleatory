import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useSavedItems } from "../hooks/useSavedItems";
import { useFolders } from "../hooks/useFolders";

import LotterySection from "../components/lottery/LotterySection";
import SavedItemsManager from "../components/saved/SavedItemsManager";
import FoldersManager from "../components/folders/FoldersManager";

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

          <div className="text-center">
            <h1 className="text-4xl font-bold text-accent-900 mb-2">
              🎰 Lottery Machine
            </h1>
            <p className="text-accent-600">
              Quick random draw with a single winner
            </p>
          </div>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar gauche - Visible seulement si connecté */}
          {auth?.session && (
            <div className="lg:w-80 w-full space-y-4">
              <FoldersManager
                folders={folders}
                isLoading={loadingFolders}
                onCreate={handleCreateFolder}
                onDelete={handleDeleteFolder}
                onAddToLottery={handleAddToLottery}
                onAddFolder={handleAddFolder}
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

          {/* Sidebar droite - Visible seulement si connecté */}
          {auth?.session && (
            <div className="lg:w-80 w-full">
              <SavedItemsManager
                savedItems={savedItems}
                isLoading={loadingSavedItems}
                onDeleteItem={handleDeleteSavedItem}
                onAddToLottery={handleAddToLottery}
                onSaveItem={handleSaveItem}
                lotteryItems={currentLotteryItems}
                onRefreshItems={handleFolderAssignmentChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lottery;
