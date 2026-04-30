import { useState, useCallback, useEffect } from "react";
import {
  getLotteryHistory,
  saveLotteryResult,
  clearLotteryHistory,
  deleteLotteryEntry,
  LotteryHistoryEntry,
} from "../lib/lotteryHistoryService";
import { DRAW_RESULT_DELAY } from "../constants/timing";

const MAX_HISTORY_AUTHENTICATED = 50;
const MAX_HISTORY_LOCAL = 10;

export interface LotteryItem {
  id: string;
  name: string;
  isFromSaved?: boolean;
}

export interface LotteryResult {
  id?: string;
  title?: string;
  winner: LotteryItem;
  elements: LotteryItem[];
  timestamp: Date;
  participantsCount: number;
  drawMode?: string;
}

export const useLottery = (isAuthenticated: boolean = false) => {
  const [items, setItems] = useState<LotteryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<LotteryResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<LotteryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const transformHistoryEntry = (entry: LotteryHistoryEntry): LotteryResult => ({
    id: entry.id,
    title: entry.title,
    winner: entry.winner,
    elements: entry.elements,
    timestamp: entry.timestamp,
    participantsCount: entry.elementsCount,
    drawMode: entry.drawMode,
  });

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingHistory(true);
    try {
      const entries = await getLotteryHistory();
      setHistory(entries.map(transformHistoryEntry));
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  const addItem = useCallback((name: string, isFromSaved = false) => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    let isDuplicate = false;
    let errorMessage = "";

    setItems((prev) => {
      if (prev.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase())) {
        isDuplicate = true;
        errorMessage = `"${trimmedName}" est déjà dans la liste`;
        return prev;
      }

      return [...prev, { id: crypto.randomUUID(), name: trimmedName, isFromSaved }];
    });

    if (isDuplicate) {
      setError(errorMessage);
      return false;
    }

    setError(null);
    return true;
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const toggleItem = useCallback((name: string, isFromSaved = false) => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    setItems((prev) => {
      const existing = prev.find(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existing) {
        return prev.filter((item) => item.id !== existing.id);
      }

      return [...prev, { id: crypto.randomUUID(), name: trimmedName, isFromSaved }];
    });

    setError(null);
    return true;
  }, []);

  const drawLottery = useCallback(
    async (title?: string, mode?: string) => {
      if (items.length < 2 || isDrawing) {
        if (items.length === 1) {
          setError("Il faut au minimum 2 éléments pour faire un tirage");
        }
        return null;
      }

      setIsDrawing(true);
      setError(null);

      const randomIndex = Math.floor(Math.random() * items.length);
      const winner = items[randomIndex];
      const timestamp = new Date();

      const result: LotteryResult = {
        winner,
        elements: [...items],
        timestamp,
        participantsCount: items.length,
        title: title?.trim() || undefined,
        drawMode: mode,
      };

      setCurrentResult(result);

      await new Promise((resolve) => setTimeout(resolve, DRAW_RESULT_DELAY));

      if (isAuthenticated) {
        const savedEntry = await saveLotteryResult(winner, items, title, mode);

        if (savedEntry) {
          const savedResult: LotteryResult = {
            ...result,
            id: savedEntry.id,
            title: savedEntry.title,
            drawMode: savedEntry.drawMode,
          };
          setCurrentResult(savedResult);
          setHistory((prev) => [savedResult, ...prev.slice(0, MAX_HISTORY_AUTHENTICATED - 1)]);
        } else {
          setHistory((prev) => [result, ...prev.slice(0, MAX_HISTORY_LOCAL - 1)]);
        }
      } else {
        setHistory((prev) => [result, ...prev.slice(0, MAX_HISTORY_LOCAL - 1)]);
      }

      setIsDrawing(false);
      return result;
    },
    [items, isDrawing, isAuthenticated]
  );

  // Save a result with a pre-determined winner (elimination / classement)
  // rankedNames: participant names in rank order (rank 1 first) — used to
  // preserve the draw ranking in the stored participants_list
  const saveManualResult = useCallback(
    async (winnerName: string, title?: string, mode?: string, rankedNames?: string[]) => {
      const winner =
        items.find((i) => i.name === winnerName) ??
        ({ id: crypto.randomUUID(), name: winnerName } as LotteryItem);
      const timestamp = new Date();

      // Build ordered elements: use ranked order if provided, else original list
      const orderedItems: LotteryItem[] = rankedNames
        ? rankedNames.map(
            (name) =>
              items.find((i) => i.name === name) ??
              ({ id: crypto.randomUUID(), name } as LotteryItem)
          )
        : [...items];

      const result: LotteryResult = {
        winner,
        elements: orderedItems,
        timestamp,
        participantsCount: orderedItems.length,
        title: title?.trim() || undefined,
        drawMode: mode,
      };

      if (isAuthenticated) {
        const savedEntry = await saveLotteryResult(winner, orderedItems, title, mode);
        if (savedEntry) {
          const savedResult: LotteryResult = {
            ...result,
            id: savedEntry.id,
            title: savedEntry.title,
            drawMode: savedEntry.drawMode,
          };
          setHistory((prev) => [savedResult, ...prev.slice(0, MAX_HISTORY_AUTHENTICATED - 1)]);
          return savedResult;
        }
      }
      setHistory((prev) => [result, ...prev.slice(0, MAX_HISTORY_LOCAL - 1)]);
      return result;
    },
    [items, isAuthenticated]
  );

  const clearItems = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  const resetItems = useCallback((newItems: LotteryItem[]) => {
    setItems(newItems.map((item) => ({ id: crypto.randomUUID(), name: item.name })));
    setCurrentResult(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearHistory = useCallback(async () => {
    if (isAuthenticated) {
      const success = await clearLotteryHistory();
      if (success) {
        setHistory([]);
        setCurrentResult(null);
      }
      return success;
    }

    setHistory([]);
    setCurrentResult(null);
    return true;
  }, [isAuthenticated]);

  const deleteHistoryEntry = useCallback(
    async (entryId: string) => {
      if (!isAuthenticated) return false;

      const success = await deleteLotteryEntry(entryId);
      if (success) {
        setHistory((prev) => prev.filter((entry) => entry.id !== entryId));
        if (currentResult?.id === entryId) {
          setCurrentResult(null);
        }
      }
      return success;
    },
    [isAuthenticated, currentResult]
  );

  return {
    items,
    currentResult,
    history,
    isDrawing,
    isLoadingHistory,
    error,
    addItem,
    removeItem,
    toggleItem,
    drawLottery,
    saveManualResult,
    clearItems,
    resetItems,
    clearError,
    clearHistory,
    deleteHistoryEntry,
    loadHistory,
  };
};
