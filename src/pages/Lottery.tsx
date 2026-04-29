import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserAuth } from "../context/AuthContext";
import { useSavedItems } from "../hooks/useSavedItems";
import { useFolders } from "../hooks/useFolders";

import LotterySection from "../components/lottery/LotterySection";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import Button from "../components/ui/Button";

const Lottery = () => {
  const navigate = useNavigate();
  const auth = UserAuth();

  const {
    savedItems,
    loadingSavedItems,
    handleDeleteSavedItem,
    handleToggleItemFolder,
    autoSaveItemsToRecent,
  } = useSavedItems();

  const {
    recentFolder,
    otherFolders,
    handleCreateFolder,
    handleDeleteFolder,
  } = useFolders();

  const [currentLotteryItems, setCurrentLotteryItems] = useState<string[]>([]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground variant="mesh" />

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="md"
            className="group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
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
            Retour à l'accueil
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">LOTTERY MACHINE</span>
          </h1>
          <motion.p
            className="text-lg sm:text-xl text-white/80"
            key={currentLotteryItems.length}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentLotteryItems.length === 0
              ? "Ajoutez des éléments pour commencer"
              : currentLotteryItems.length === 1
              ? "Ajoutez au moins 1 élément de plus"
              : `${currentLotteryItems.length} éléments prêts pour le tirage`}
          </motion.p>
        </motion.div>

        {/* Main Lottery Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LotterySection
            isAuthenticated={!!auth?.session}
            onLotteryItemsChange={setCurrentLotteryItems}
            savedItems={savedItems}
            recentFolder={recentFolder}
            otherFolders={otherFolders}
            loadingItems={loadingSavedItems}
            onDeleteItem={handleDeleteSavedItem}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onToggleItemFolder={handleToggleItemFolder}
            onAutoSaveToRecent={autoSaveItemsToRecent}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Lottery;
