import { useState, useCallback, useEffect } from "react";
import {
  LotteryHistoryService,
  LotteryHistoryEntry,
} from "../lib/lotteryHistoryService";
import { logSupabaseError } from "../lib/logger";

export interface LotteryItem {
  id: string;
  name: string;
  isFromSaved?: boolean;
}

export interface LotteryResult {
  id?: string; // ID en base pour les résultats sauvés
  title?: string; // Titre optionnel du tirage
  winner: LotteryItem;
  elements: LotteryItem[]; // Liste complète des éléments
  timestamp: Date;
  participantsCount: number; // Alias pour elementsCount (compatibilité)
}

export const useLottery = (isAuthenticated: boolean = false) => {
  const [items, setItems] = useState<LotteryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<LotteryResult | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<LotteryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Transformer une entrée d'historique en LotteryResult pour compatibilité
  const transformHistoryEntry = (
    entry: LotteryHistoryEntry
  ): LotteryResult => ({
    id: entry.id,
    title: entry.title,
    winner: entry.winner,
    elements: entry.elements,
    timestamp: entry.timestamp,
    participantsCount: entry.elementsCount,
  });

  // Charger l'historique depuis la base de données
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      return; // L'historique local est géré ailleurs
    }

    setIsLoadingHistory(true);
    try {
      const historyEntries = await LotteryHistoryService.getLotteryHistory();
      const transformedHistory = historyEntries.map(transformHistoryEntry);
      setHistory(transformedHistory);
    } catch (error) {
      logSupabaseError("chargement de l'historique", error);
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
      // Vérifier les doublons dans le callback
      if (
        prev.some(
          (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
        )
      ) {
        isDuplicate = true;
        errorMessage = `"${trimmedName}" est déjà dans la liste`;
        return prev;
      }

      const newItem: LotteryItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: trimmedName,
        isFromSaved,
      };

      return [...prev, newItem];
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

  const drawLottery = useCallback(
    async (title?: string) => {
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
      };

      setCurrentResult(result);

      await new Promise((resolve) => setTimeout(resolve, 3800));

      if (isAuthenticated) {
        try {
          const savedEntry = await LotteryHistoryService.saveLotteryResult(
            winner,
            items,
            title
          );

          if (savedEntry) {
            const savedResult: LotteryResult = {
              ...result,
              id: savedEntry.id,
              title: savedEntry.title,
            };

            setCurrentResult(savedResult);
            setHistory((prev) => [savedResult, ...prev.slice(0, 49)]);
          } else {
            setHistory((prev) => [result, ...prev.slice(0, 9)]);
          }
        } catch (error) {
          logSupabaseError("sauvegarde du tirage", error);

          setHistory((prev) => [result, ...prev.slice(0, 9)]);
        }
      } else {
        setHistory((prev) => [result, ...prev.slice(0, 9)]);
      }

      setIsDrawing(false);
      return result;
    },
    [items, isDrawing, isAuthenticated]
  );

  const clearItems = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearHistory = useCallback(async () => {
    const authenticated = isAuthenticated;

    if (authenticated) {
      const success = await LotteryHistoryService.clearLotteryHistory();
      if (success) {
        setHistory([]);
        setCurrentResult(null);
      }
      return success;
    } else {
      setHistory([]);
      setCurrentResult(null);
      return true;
    }
  }, [isAuthenticated]);

  const deleteHistoryEntry = useCallback(
    async (entryId: string) => {
      if (!isAuthenticated) return false;

      const success = await LotteryHistoryService.deleteLotteryEntry(entryId);
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
    // État
    items,
    currentResult,
    history,
    isDrawing,
    isLoadingHistory,
    error,

    // Actions
    addItem,
    removeItem,
    drawLottery,
    clearItems,
    clearError,
    clearHistory,
    deleteHistoryEntry,
    loadHistory,
  };
};
