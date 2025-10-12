import { useState, useEffect } from "react";
import { LotteryResult, useLottery } from "../../hooks/useLottery";
import LotteryWheel from "./LotteryWheel";
import LotteryHistory from "./LotteryHistory";
import AddElementForm from "./AddElementForm";
import LotteryTitle from "./LotteryTitle";
import ElementsList from "./ElementsList";
import DrawButton from "./DrawButton";

interface LotterySectionProps {
  onSaveItem?: (itemName: string) => Promise<boolean>;
  savedItemsNames?: Set<string>;
  savingItems?: Set<string>;
  isAuthenticated: boolean;
  onLotteryItemsChange?: (items: string[]) => void;
}

const LotterySection = ({
  onSaveItem,
  savedItemsNames = new Set(),
  savingItems = new Set(),
  isAuthenticated,
  onLotteryItemsChange,
}: LotterySectionProps) => {
  const {
    items,
    currentResult,
    history,
    isDrawing,
    error,
    addItem,
    removeItem,
    drawLottery,
    clearItems,
    clearError,
    clearHistory,
    deleteHistoryEntry,
  } = useLottery(isAuthenticated);

  const [showResult, setShowResult] = useState(false);
  const [animatingResult, setAnimatingResult] = useState<LotteryResult | null>(
    null
  );
  const [manuallyClosedResult, setManuallyClosedResult] =
    useState<LotteryResult | null>(null);
  const [lotteryTitle, setLotteryTitle] = useState<string>("");

  // Gérer l'affichage du résultat avec animation
  useEffect(() => {
    if (
      currentResult &&
      !showResult &&
      currentResult !== manuallyClosedResult
    ) {
      setAnimatingResult(currentResult);
      setShowResult(true);

      // Auto-fermer après 5 secondes
      const timeout = setTimeout(() => {
        setShowResult(false);
        setAnimatingResult(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [currentResult, showResult, manuallyClosedResult]);

  // Clear l'historique si non connecté et qu'on actualise
  useEffect(() => {
    if (!isAuthenticated) {
      const handleBeforeUnload = () => {
        clearHistory();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isAuthenticated, clearHistory]);

  // Écouter les événements d'ajout d'items depuis le gestionnaire d'items sauvegardés
  useEffect(() => {
    const handleAddItem = (event: CustomEvent<{ itemName: string }>) => {
      addItem(event.detail.itemName, true); // true = isFromSaved
    };

    window.addEventListener("addItemToLottery", handleAddItem as EventListener);
    return () =>
      window.removeEventListener(
        "addItemToLottery",
        handleAddItem as EventListener
      );
  }, [addItem]);

  // Notifier le parent des changements dans la liste des items
  useEffect(() => {
    if (onLotteryItemsChange) {
      onLotteryItemsChange(items.map((item) => item.name));
    }
  }, [items, onLotteryItemsChange]);

  const handleAddItem = (itemName: string) => {
    addItem(itemName);
  };

  const handleSaveItem = async (itemName: string) => {
    if (onSaveItem) {
      const success = await onSaveItem(itemName);
      return success;
    }
    return false;
  };

  const handleDraw = async () => {
    const result = await drawLottery(lotteryTitle);
    if (result) {
      // Nettoyer le titre après utilisation
      setLotteryTitle("");
      // L'animation sera gérée par l'useEffect
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec style gaming */}
      <div className="text-center">
        <div className="relative inline-block">
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent mb-2">
            LOTTERY MACHINE
          </h2>
        </div>
        <p className="text-accent-600 text-lg">
          {items.length === 0
            ? "Ajoutez des éléments pour commencer"
            : items.length === 1
            ? "Ajoutez au moins 1 élément de plus"
            : `${items.length} éléments prêts pour le tirage`}
        </p>
      </div>

      {/* Zone d'ajout d'éléments */}
      <AddElementForm
        onAddItem={handleAddItem}
        error={error}
        onDismissError={clearError}
      />

      {/* Liste des éléments */}
      <ElementsList
        items={items}
        isAuthenticated={isAuthenticated}
        savedItemsNames={savedItemsNames}
        savingItems={savingItems}
        onRemoveItem={removeItem}
        onSaveItem={handleSaveItem}
        onClearItems={clearItems}
      />

      {/* Champ de titre optionnel */}
      <LotteryTitle
        value={lotteryTitle}
        onChange={setLotteryTitle}
        itemsCount={items.length}
      />

      {/* Roulette/Animation de tirage */}
      <LotteryWheel
        items={items}
        isDrawing={isDrawing}
        result={animatingResult}
        isVisible={showResult}
        onClose={() => {
          setShowResult(false);
          setAnimatingResult(null);
          setManuallyClosedResult(currentResult); // Marquer ce résultat comme fermé manuellement
        }}
      />

      {/* Bouton de tirage */}
      <DrawButton
        itemsCount={items.length}
        isDrawing={isDrawing}
        onDraw={handleDraw}
      />

      {/* Historique des tirages */}
      {history.length > 0 && (
        <LotteryHistory
          history={history}
          onClear={clearHistory}
          onDeleteEntry={isAuthenticated ? deleteHistoryEntry : undefined}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default LotterySection;
