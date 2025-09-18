import { useState, useCallback, useEffect } from "react";
import { LotteryHistoryService, LotteryHistoryEntry } from "../lib/lotteryHistoryService";

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
  const [currentResult, setCurrentResult] = useState<LotteryResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<LotteryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Transformer une entrée d'historique en LotteryResult pour compatibilité
  const transformHistoryEntry = (entry: LotteryHistoryEntry): LotteryResult => ({
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
      console.error("Erreur lors du chargement de l'historique:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  // Charger l'historique au montage si utilisateur connecté
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  // Ajouter un item au tirage
  const addItem = useCallback((name: string, isFromSaved = false) => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    // Vérifier les doublons
    if (items.some(item => item.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`"${trimmedName}" est déjà dans la liste`);
      return false;
    }

    const newItem: LotteryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: trimmedName,
      isFromSaved
    };

    setItems(prev => [...prev, newItem]);
    setError(null);
    return true;
  }, [items]);

  // Supprimer un item
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Effectuer le tirage avec titre optionnel
  const drawLottery = useCallback(async (title?: string) => {
    if (items.length < 2 || isDrawing) {
      if (items.length === 1) {
        setError("Il faut au minimum 2 éléments pour faire un tirage");
      }
      return null;
    }

    setIsDrawing(true);
    setError(null);

    // Simulation d'attente pour l'animation
    await new Promise(resolve => setTimeout(resolve, 100));

    const randomIndex = Math.floor(Math.random() * items.length);
    const winner = items[randomIndex];
    const timestamp = new Date();

    // Créer le résultat local
    const result: LotteryResult = {
      winner,
      elements: [...items], // Copie de la liste complète
      timestamp,
      participantsCount: items.length,
      title: title?.trim() || undefined,
    };

    setCurrentResult(result);

    // Sauvegarder et gérer l'historique selon le mode
    if (isAuthenticated) {
      // Mode connecté : sauvegarder en base de données
      try {
        const savedEntry = await LotteryHistoryService.saveLotteryResult(
          winner,
          items,
          title
        );

        if (savedEntry) {
          // Ajouter à l'historique avec l'ID de la base
          const savedResult: LotteryResult = {
            ...result,
            id: savedEntry.id,
            title: savedEntry.title, // Utiliser le titre généré/finalisé par le service
          };

          setCurrentResult(savedResult);
          setHistory(prev => [savedResult, ...prev.slice(0, 49)]); // Limiter à 50
        } else {
          // Si échec sauvegarde, garder quand même en local temporairement
          setHistory(prev => [result, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du tirage:", error);
        // Fallback : ajouter en local
        setHistory(prev => [result, ...prev.slice(0, 9)]);
      }
    } else {
      // Mode invité : historique local seulement (limité à 10)
      setHistory(prev => [result, ...prev.slice(0, 9)]);
    }

    setIsDrawing(false);
    return result;
  }, [items, isDrawing, isAuthenticated]);

  // Vider la liste
  const clearItems = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  // Clear l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Vider l'historique (local pour invités, base pour connectés)
  const clearHistory = useCallback(async () => {
    if (isAuthenticated) {
      // Mode connecté : vider en base de données
      const success = await LotteryHistoryService.clearLotteryHistory();
      if (success) {
        setHistory([]);
        setCurrentResult(null);
      }
      return success;
    } else {
      // Mode invité : vider l'historique local
      setHistory([]);
      setCurrentResult(null);
      return true;
    }
  }, [isAuthenticated]);

  // Supprimer une entrée spécifique (seulement pour les utilisateurs connectés)
  const deleteHistoryEntry = useCallback(async (entryId: string) => {
    if (!isAuthenticated) return false;

    const success = await LotteryHistoryService.deleteLotteryEntry(entryId);
    if (success) {
      setHistory(prev => prev.filter(entry => entry.id !== entryId));
      // Si c'était le résultat actuel, le nettoyer aussi
      if (currentResult?.id === entryId) {
        setCurrentResult(null);
      }
    }
    return success;
  }, [isAuthenticated, currentResult]);

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
    loadHistory
  };
};