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
    toggleItem, // ✅ Ajoute toggleItem
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


  useEffect(() => {
    if (
      currentResult &&
      !showResult &&
      currentResult !== manuallyClosedResult
    ) {
      setAnimatingResult(currentResult);
      setShowResult(true);


      const timeout = setTimeout(() => {
        setShowResult(false);
        setAnimatingResult(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [currentResult, showResult, manuallyClosedResult]);


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


  useEffect(() => {
    const handleToggleFromEvent = (
      event: CustomEvent<{ itemName: string }>
    ) => {
      toggleItem(event.detail.itemName, true); // true = isFromSaved
    };

    window.addEventListener(
      "addItemToLottery",
      handleToggleFromEvent as EventListener
    );
    return () =>
      window.removeEventListener(
        "addItemToLottery",
        handleToggleFromEvent as EventListener
      );
  }, [toggleItem]);

  // Notifier le parent des changements dans la liste des items
  useEffect(() => {
    if (onLotteryItemsChange) {
      onLotteryItemsChange(items.map((item) => item.name));
    }
  }, [items, onLotteryItemsChange]);

  // ✅ Pour AddElementForm → utilise addItem (avec erreur si doublon)
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

      setLotteryTitle("");

    }
  };

  return (
    <div className="space-y-6">
      {/* Add Elements Section */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10 shadow-glass-lg">
        <AddElementForm
          onAddItem={handleAddItem}
          error={error}
          onDismissError={clearError}
        />
      </div>

      {/* Elements List */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10 shadow-glass-lg">
        <ElementsList
          items={items}
          isAuthenticated={isAuthenticated}
          savedItemsNames={savedItemsNames}
          savingItems={savingItems}
          onRemoveItem={removeItem}
          onSaveItem={handleSaveItem}
          onClearItems={clearItems}
        />
      </div>

      {/* Champ de titre optionnel */}
      {items.length >= 2 && (
        <div className="glass-strong rounded-2xl p-6 border border-white/10 shadow-glass-lg">
          <LotteryTitle
            value={lotteryTitle}
            onChange={setLotteryTitle}
            itemsCount={items.length}
          />
        </div>
      )}

      {/* Roulette/Animation de tirage */}
      <LotteryWheel
        items={items}
        isDrawing={isDrawing}
        result={animatingResult}
        isVisible={showResult}
        onClose={() => {
          setShowResult(false);
          setAnimatingResult(null);
          setManuallyClosedResult(currentResult);
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
        <div className="glass-strong rounded-2xl p-6 border border-white/10 shadow-glass-lg">
          <LotteryHistory
            history={history}
            onClear={clearHistory}
            onDeleteEntry={isAuthenticated ? deleteHistoryEntry : undefined}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}
    </div>
  );
};

export default LotterySection;
