import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import {
  saveItem,
  loadUserItems,
  deleteItem,
  SavedItem,
} from "../lib/savedItemsService";
import {
  createFolder,
  loadUserFolders,
  deleteFolder,
  FolderItem,
} from "../lib/foldersService";
import LotterySection from "../components/lottery/LotterySection";
import SavedItemsManager from "../components/saved/SavedItemsManager";
import FoldersManager from "../components/folders/FoldersManager";

const Home = () => {
  const auth = UserAuth();

  // État des items sauvegardés
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [savedItemsSet, setSavedItemsSet] = useState<Set<string>>(new Set()); // Optimisation pour vérifications rapides
  const [loadingSavedItems, setLoadingSavedItems] = useState(false);
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set()); // Items en cours de sauvegarde

  // État des dossiers
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // State pour communiquer entre les composants - items actuellement dans le tirage
  const [currentLotteryItems, setCurrentLotteryItems] = useState<string[]>([]);

  // Charger les items sauvegardés
  const loadSavedItems = useCallback(async () => {
    if (!auth?.session) return;

    setLoadingSavedItems(true);
    const { items } = await loadUserItems();
    setSavedItems(items);
    setSavedItemsSet(new Set(items.map((item) => item.item_name))); // Optimisation
    setLoadingSavedItems(false);
  }, [auth?.session]);

  // Charger les dossiers
  const loadFolders = useCallback(async () => {
    if (!auth?.session) return;

    setLoadingFolders(true);
    const { folders } = await loadUserFolders();
    setFolders(folders);
    setLoadingFolders(false);
  }, [auth?.session]);

  // Charger les données au montage
  useEffect(() => {
    if (auth?.session) {
      loadSavedItems();
      loadFolders();
    } else {
      // Reset data when user logs out
      setSavedItems([]);
      setSavedItemsSet(new Set());
      setFolders([]);
    }
  }, [auth?.session, loadSavedItems, loadFolders]);

  // Sauvegarder un item
  const handleSaveItem = async (itemName: string): Promise<boolean> => {
    if (!auth?.session || savingItems.has(itemName)) return false;

    // Marquer comme en cours de sauvegarde
    setSavingItems((prev) => new Set([...prev, itemName]));

    const result = await saveItem(itemName);

    // Retirer du Set de sauvegarde
    setSavingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemName);
      return newSet;
    });

    if (result.success) {
      // Mettre à jour les états locaux sans recharger
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
    } else {
      // TODO: Afficher erreur générique DB
      // Error logged for debugging
      return false;
    }
  };

  // Supprimer un item sauvegardé
  const handleDeleteSavedItem = async (itemName: string) => {
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
    } else {
      // TODO: Afficher erreur générique DB
      // Error logged for debugging
    }
  };

  // Créer un dossier
  const handleCreateFolder = async (folderName: string) => {
    if (!auth?.session) return;

    const result = await createFolder(folderName.trim());
    if (result.success) {
      await loadFolders();
    }
  };

  // Supprimer un dossier
  const handleDeleteFolder = async (folderName: string) => {
    if (!auth?.session) return;

    const result = await deleteFolder(folderName);
    if (result.success) {
      setFolders((prev) =>
        prev.filter((folder) => folder.folder_name !== folderName)
      );
    } else {
      // TODO: Afficher erreur générique DB
      // Error logged for debugging
    }
  };

  // Fonction pour ajouter un item au tirage depuis SavedItemsManager
  const handleAddToLottery = (itemName: string) => {
    // Cette fonction sera appelée par le gestionnaire d'items sauvegardés
    // On utilise un event personnalisé pour communiquer avec LotterySection
    const event = new CustomEvent("addItemToLottery", {
      detail: { itemName },
    });
    window.dispatchEvent(event);
  };

  // Fonction pour notifier les changements de dossiers
  const handleFolderAssignmentChange = () => {
    // Recharger les données des deux côtés
    loadSavedItems();
    loadFolders();

    // Notifier les dossiers ouverts qu'ils doivent se rafraîchir
    const event = new CustomEvent("foldersChanged");
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-gradient-to-br from-secondary-50 via-white to-accent-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header moderne */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <img
              src="/assets/logo_aleatory.webp"
              alt="Aleatory"
              className="h-48 mx-auto mb-4 drop-shadow-lg"
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-full blur-xl -z-10"></div>
          </div>

          {/* Indicateur de connexion moderne */}
          {!auth?.session && (
            <div className="bg-gradient-to-r from-secondary-100 to-accent-100 border-2 border-accent-300 px-6 py-3 rounded-xl inline-block shadow-lg">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-semibold text-accent-800 mb-1">
                    Mode Invité
                  </div>
                  <Link
                    to="/signin"
                    className="text-primary-600 hover:text-primary-700 font-medium underline decoration-2 underline-offset-2"
                  >
                    Connectez-vous
                  </Link>
                  <span className="text-accent-600">
                    {" "}
                    pour sauvegarder vos données
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar gauche - Visible seulement si connecté */}
          {auth?.session && (
            <div className="lg:w-80 w-full space-y-4">
              {/* Gestionnaire de dossiers compact */}
              <FoldersManager
                folders={folders}
                isLoading={loadingFolders}
                onCreate={handleCreateFolder}
                onDelete={handleDeleteFolder}
                onAddToLottery={handleAddToLottery}
              />
            </div>
          )}

          {/* Section principale - Tirage au sort (centrée) */}
          <div className="flex-1 max-w-4xl mx-auto w-full">
            <LotterySection
              onSaveItem={auth?.session ? handleSaveItem : undefined}
              savedItemsNames={savedItemsSet}
              savingItems={savingItems}
              isAuthenticated={!!auth?.session}
              onLotteryItemsChange={setCurrentLotteryItems}
            />
          </div>

          {/* Sidebar droite - Visible seulement si connecté */}
          {auth?.session && (
            <div className="lg:w-80 w-full">
              {/* Gestionnaire d'items sauvegardés compact */}
              <SavedItemsManager
                savedItems={savedItems}
                isLoading={loadingSavedItems}
                onDeleteItem={handleDeleteSavedItem}
                onAddToLottery={handleAddToLottery}
                onSaveItem={handleSaveItem}
                lotteryItems={currentLotteryItems}
                onRefreshItems={handleFolderAssignmentChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
