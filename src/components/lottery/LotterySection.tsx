import { useState, useEffect } from "react";
import { LotteryResult, useLottery } from "../../hooks/useLottery";
import { SavedItem } from "../../lib/savedItemsService";
import { FolderItem } from "../../lib/foldersService";
import LotteryMachineCSS from "./LotteryMachineCSS";
import LotteryHistory from "./LotteryHistory";
import AddElementForm from "./AddElementForm";
import LotteryTitle from "./LotteryTitle";
import ElementsList from "./ElementsList";
import DrawButton from "./DrawButton";
import WinnerModal from "./WinnerModal";
import InlineLibrary from "../library/InlineLibrary";

interface LotterySectionProps {
  isAuthenticated: boolean;
  onLotteryItemsChange?: (items: string[]) => void;
  // Library props (authenticated only)
  savedItems?: SavedItem[];
  recentFolder?: FolderItem | null;
  otherFolders?: FolderItem[];
  loadingItems?: boolean;
  onDeleteItem?: (itemName: string) => void;
  onCreateFolder?: (folderName: string) => Promise<void>;
  onDeleteFolder?: (folderName: string) => void;
  onToggleItemFolder?: (itemId: number, folderId: number, shouldAssign: boolean) => Promise<void>;
  onAutoSaveToRecent?: (itemNames: string[], folderId: number) => Promise<void>;
}

const LotterySection = ({
  isAuthenticated,
  onLotteryItemsChange,
  savedItems = [],
  recentFolder = null,
  otherFolders = [],
  loadingItems = false,
  onDeleteItem,
  onCreateFolder,
  onDeleteFolder,
  onToggleItemFolder,
  onAutoSaveToRecent,
}: LotterySectionProps) => {
  const {
    items,
    currentResult,
    history,
    isDrawing,
    error,
    addItem,
    removeItem,
    toggleItem,
    drawLottery,
    clearItems,
    clearError,
    clearHistory,
    deleteHistoryEntry,
  } = useLottery(isAuthenticated);

  const [showResult, setShowResult] = useState(false);
  const [animatingResult, setAnimatingResult] = useState<LotteryResult | null>(null);
  const [manuallyClosedResult, setManuallyClosedResult] = useState<LotteryResult | null>(null);
  const [lotteryTitle, setLotteryTitle] = useState<string>("");

  useEffect(() => {
    if (currentResult && !showResult && currentResult !== manuallyClosedResult) {
      const showTimeout = setTimeout(() => {
        setAnimatingResult(currentResult);
        setShowResult(true);
      }, 3500);

      const hideTimeout = setTimeout(() => {
        setShowResult(false);
        setAnimatingResult(null);
      }, 8500);

      return () => {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
      };
    }
  }, [currentResult, showResult, manuallyClosedResult]);

  useEffect(() => {
    if (!isAuthenticated) {
      const handleBeforeUnload = () => clearHistory();
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isAuthenticated, clearHistory]);

  useEffect(() => {
    const handleToggleFromEvent = (event: CustomEvent<{ itemName: string }>) => {
      toggleItem(event.detail.itemName, true);
    };
    window.addEventListener("addItemToLottery", handleToggleFromEvent as EventListener);
    return () => window.removeEventListener("addItemToLottery", handleToggleFromEvent as EventListener);
  }, [toggleItem]);

  useEffect(() => {
    if (onLotteryItemsChange) {
      onLotteryItemsChange(items.map((item) => item.name));
    }
  }, [items, onLotteryItemsChange]);

  const handleDraw = async () => {
    if (isAuthenticated && recentFolder && onAutoSaveToRecent && items.length > 0) {
      await onAutoSaveToRecent(items.map((i) => i.name), recentFolder.id);
    }
    const result = await drawLottery(lotteryTitle);
    if (result) {
      setLotteryTitle("");
    }
  };

  const currentLotteryItemNames = items.map((i) => i.name);

  return (
    <div className="space-y-6">
      {/* Add Elements + Library */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10 shadow-glass-lg space-y-4">
        <AddElementForm
          onAddItem={(name) => addItem(name)}
          error={error}
          onDismissError={clearError}
        />

        {isAuthenticated && (
          <>
            <div className="border-t border-white/8" />
            <div className="max-h-[260px] overflow-y-auto">
              <InlineLibrary
                savedItems={savedItems}
                recentFolder={recentFolder}
                otherFolders={otherFolders}
                lotteryItems={currentLotteryItemNames}
                loadingItems={loadingItems}
                onAddItemToLottery={(name) => toggleItem(name, true)}
                onDeleteItem={onDeleteItem ?? (() => {})}
                onCreateFolder={onCreateFolder ?? (async () => {})}
                onDeleteFolder={onDeleteFolder ?? (() => {})}
                onToggleItemFolder={onToggleItemFolder ?? (async () => {})}
              />
            </div>
          </>
        )}
      </div>

      {/* Elements List */}
      <div className="glass-strong rounded-2xl p-6 border border-white/10 shadow-glass-lg">
        <ElementsList
          items={items}
          onRemoveItem={removeItem}
          onClearItems={clearItems}
        />
      </div>

      {/* Optional title */}
      {items.length >= 2 && (
        <div className="glass-strong rounded-2xl p-6 border border-white/10 shadow-glass-lg">
          <LotteryTitle
            value={lotteryTitle}
            onChange={setLotteryTitle}
            itemsCount={items.length}
          />
        </div>
      )}

      {/* Machine */}
      <LotteryMachineCSS
        items={items}
        isDrawing={isDrawing}
        winner={(isDrawing || showResult) && currentResult ? currentResult.winner.name : null}
      />

      {/* Winner modal */}
      <WinnerModal
        isOpen={showResult && !!animatingResult}
        result={animatingResult}
        onClose={() => {
          setShowResult(false);
          setAnimatingResult(null);
          setManuallyClosedResult(currentResult);
        }}
      />

      {/* Draw button */}
      <DrawButton
        itemsCount={items.length}
        isDrawing={isDrawing}
        onDraw={handleDraw}
      />

      {/* History */}
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
