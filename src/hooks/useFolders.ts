import { useState, useCallback, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import {
  createFolder,
  loadUserFolders,
  deleteFolder,
  FolderItem,
} from "../lib/foldersService";
import { getItemsByFolder, SavedItem } from "../lib/savedItemsService";

export const useFolders = () => {
  const auth = UserAuth();

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  const loadFolders = useCallback(async () => {
    if (!auth?.session) return;

    setLoadingFolders(true);
    const { folders } = await loadUserFolders();
    setFolders(folders);
    setLoadingFolders(false);
  }, [auth?.session]);

  const handleCreateFolder = useCallback(
    async (folderName: string) => {
      if (!auth?.session) return;

      const result = await createFolder(folderName.trim());
      if (result.success) {
        await loadFolders();
      }
    },
    [auth?.session, loadFolders]
  );

  const handleDeleteFolder = useCallback(
    async (folderName: string) => {
      if (!auth?.session) return;

      const result = await deleteFolder(folderName);
      if (result.success) {
        setFolders((prev) =>
          prev.filter((folder) => folder.folder_name !== folderName)
        );
      }
    },
    [auth?.session]
  );

  const handleAddFolder = useCallback(
    async (folderId: number): Promise<string[]> => {
      if (!auth?.session) return [];

      const result = await getItemsByFolder(folderId);
      if (result.success && result.items) {
        return result.items.map((item: SavedItem) => item.item_name);
      }
      return [];
    },
    [auth?.session]
  );

  useEffect(() => {
    if (auth?.session) {
      loadFolders();
    } else {
      setFolders([]);
    }
  }, [auth?.session, loadFolders]);

  return {
    folders,
    loadingFolders,
    handleCreateFolder,
    handleDeleteFolder,
    handleAddFolder,
    loadFolders,
  };
};
