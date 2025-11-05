import { useState, useCallback, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import {
  saveItem,
  loadUserItems,
  deleteItem,
  SavedItem,
} from "../lib/savedItemsService";

export const useSavedItems = () => {
  const auth = UserAuth();

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [savedItemsSet, setSavedItemsSet] = useState<Set<string>>(new Set());
  const [loadingSavedItems, setLoadingSavedItems] = useState(false);
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());

  const loadSavedItems = useCallback(async () => {
    if (!auth?.session) return;

    setLoadingSavedItems(true);
    const { items } = await loadUserItems();
    setSavedItems(items);
    setSavedItemsSet(new Set(items.map((item) => item.item_name)));
    setLoadingSavedItems(false);
  }, [auth?.session]);

  const handleSaveItem = useCallback(
    async (itemName: string): Promise<boolean> => {
      if (!auth?.session || savingItems.has(itemName)) return false;

      setSavingItems((prev) => new Set([...prev, itemName]));

      const result = await saveItem(itemName);

      setSavingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemName);
        return newSet;
      });

      if (result.success) {
        setSavedItems((prev) => [
          ...prev,
          {
            id: Date.now(),
            user_id: auth.session!.user.id,
            item_name: itemName,
            created_at: new Date().toISOString(),
          },
        ]);
        setSavedItemsSet((prev) => new Set([...prev, itemName]));
        return true;
      }
      return false;
    },
    [auth?.session, savingItems]
  );

  const handleDeleteSavedItem = useCallback(
    async (itemName: string) => {
      if (!auth?.session) return;

      const result = await deleteItem(itemName);
      if (result.success) {
        setSavedItems((prev) =>
          prev.filter((item) => item.item_name !== itemName)
        );
        setSavedItemsSet((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemName);
          return newSet;
        });
      }
    },
    [auth?.session]
  );

  useEffect(() => {
    if (auth?.session) {
      loadSavedItems();
    } else {
      setSavedItems([]);
      setSavedItemsSet(new Set());
    }
  }, [auth?.session, loadSavedItems]);

  return {
    savedItems,
    savedItemsSet,
    loadingSavedItems,
    savingItems,
    handleSaveItem,
    handleDeleteSavedItem,
    loadSavedItems,
  };
};
