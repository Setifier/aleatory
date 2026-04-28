import { useState, useCallback, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import {
  createFolder,
  loadUserFolders,
  deleteFolder,
  getOrCreateRecentFolder,
  getOrCreateTournamentRecentFolder,
  RECENT_FOLDER_NAME,
  TOURNAMENT_RECENT_FOLDER_NAME,
  FolderItem,
} from "../lib/foldersService";

export const useFolders = () => {
  const auth = UserAuth();

  const [recentFolder, setRecentFolder] = useState<FolderItem | null>(null);
  const [tournamentRecentFolder, setTournamentRecentFolder] = useState<FolderItem | null>(null);
  const [otherFolders, setOtherFolders] = useState<FolderItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  const loadFolders = useCallback(async () => {
    if (!auth?.session) return;

    setLoadingFolders(true);
    const [{ folders }, recent, tournamentRecent] = await Promise.all([
      loadUserFolders(),
      getOrCreateRecentFolder(),
      getOrCreateTournamentRecentFolder(),
    ]);

    setRecentFolder(recent);
    setTournamentRecentFolder(tournamentRecent);
    setOtherFolders(
      folders.filter(
        (f) =>
          f.folder_name !== RECENT_FOLDER_NAME &&
          f.folder_name !== TOURNAMENT_RECENT_FOLDER_NAME
      )
    );
    setLoadingFolders(false);
  }, [auth?.session]);

  const handleCreateFolder = useCallback(
    async (folderName: string) => {
      if (!auth?.session) return;

      const result = await createFolder(folderName.trim());
      if (result.success && result.folder) {
        setOtherFolders((prev) => [result.folder!, ...prev]);
      }
    },
    [auth?.session]
  );

  const handleDeleteFolder = useCallback(
    async (folderName: string) => {
      if (!auth?.session) return;

      const result = await deleteFolder(folderName);
      if (result.success) {
        setOtherFolders((prev) =>
          prev.filter((folder) => folder.folder_name !== folderName)
        );
      }
    },
    [auth?.session]
  );

  useEffect(() => {
    if (auth?.session) {
      loadFolders();
    } else {
      setRecentFolder(null);
      setTournamentRecentFolder(null);
      setOtherFolders([]);
    }
  }, [auth?.session, loadFolders]);

  return {
    recentFolder,
    tournamentRecentFolder,
    otherFolders,
    loadingFolders,
    handleCreateFolder,
    handleDeleteFolder,
    loadFolders,
  };
};
