import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { saveItem, loadUserItems, deleteItem, SavedItem } from "../lib/savedItemsService";
import { createFolder, loadUserFolders, deleteFolder, FolderItem } from "../lib/foldersService";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";

const Home = () => {
  const auth = UserAuth();
  
  // État du tirage au sort
  const [lotteryItems, setLotteryItems] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [lotteryError, setLotteryError] = useState<string | null>(null);
  
  // État des items sauvegardés
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [savedItemsSet, setSavedItemsSet] = useState<Set<string>>(new Set()); // Optimisation pour vérifications rapides
  const [loadingSavedItems, setLoadingSavedItems] = useState(false);
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set()); // Items en cours de sauvegarde
  
  // État des dossiers
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderInput, setShowFolderInput] = useState(false);
  
  // États pour les modales de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    message: "",
    action: () => {},
  });

  // Charger les items sauvegardés
  const loadSavedItems = useCallback(async () => {
    if (!auth?.session) return;
    
    setLoadingSavedItems(true);
    const { items } = await loadUserItems();
    setSavedItems(items);
    setSavedItemsSet(new Set(items.map(item => item.item_name))); // Optimisation
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
    }
  }, [auth?.session, loadSavedItems, loadFolders]);


  // Supprimer un item du tirage
  const removeItemFromLottery = (index: number) => {
    setLotteryItems(lotteryItems.filter((_, i) => i !== index));
  };

  // Effectuer le tirage
  const drawLottery = () => {
    if (lotteryItems.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * lotteryItems.length);
    const winner = lotteryItems[randomIndex];
    setResult(winner);
    setIsResultModalOpen(true);
  };

  // Sauvegarder un item
  const handleSaveItem = async (itemName: string) => {
    if (!auth?.session || savingItems.has(itemName)) return;
    
    // Marquer comme en cours de sauvegarde
    setSavingItems(prev => new Set([...prev, itemName]));
    
    const result = await saveItem(itemName);
    
    // Retirer du Set de sauvegarde
    setSavingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemName);
      return newSet;
    });
    
    if (result.success) {
      // Mettre à jour les états locaux sans recharger
      setSavedItems(prev => [...prev, { 
        id: Date.now(), 
        user_id: auth.session!.user.id, 
        item_name: itemName,
        created_at: new Date().toISOString()
      }]);
      setSavedItemsSet(prev => new Set([...prev, itemName]));
    } else {
      // TODO: Afficher erreur générique DB
      console.error("Erreur sauvegarde:", result.error);
    }
  };

  // Supprimer un item sauvegardé (avec confirmation)
  const handleDeleteSavedItem = (itemName: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Êtes-vous sûr de vouloir supprimer "${itemName}" ?`,
      action: () => performDeleteSavedItem(itemName),
    });
  };

  const performDeleteSavedItem = async (itemName: string) => {
    if (!auth?.session) return;
    
    // Fermer le modal immédiatement pour éviter les doubles clics
    setConfirmModal({ isOpen: false, message: "", action: () => {} });
    
    const result = await deleteItem(itemName);
    if (result.success) {
      setSavedItems(prev => prev.filter(item => item.item_name !== itemName));
      setSavedItemsSet(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemName);
        return newSet;
      });
    } else {
      // TODO: Afficher erreur générique DB
      console.error("Erreur suppression:", result.error);
    }
  };

  // Ajouter un item sauvegardé au tirage
  const addSavedItemToLottery = (itemName: string) => {
    if (!lotteryItems.includes(itemName)) {
      setLotteryItems([...lotteryItems, itemName]);
    }
  };

  // Créer un dossier
  const handleCreateFolder = async (folderName?: string) => {
    if (!auth?.session) return;
    
    const nameToUse = folderName || newFolderName.trim();
    if (!nameToUse) return;
    
    const result = await createFolder(nameToUse);
    if (result.success) {
      setNewFolderName("");
      setShowFolderInput(false);
      await loadFolders();
    }
  };

  // Supprimer un dossier (avec confirmation)
  const handleDeleteFolder = (folderName: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Êtes-vous sûr de vouloir supprimer le dossier "${folderName}" ?`,
      action: () => performDeleteFolder(folderName),
    });
  };

  const performDeleteFolder = async (folderName: string) => {
    if (!auth?.session) return;
    
    const result = await deleteFolder(folderName);
    if (result.success) {
      setFolders(prev => prev.filter(folder => folder.folder_name !== folderName));
    } else {
      // TODO: Afficher erreur générique DB
      console.error("Erreur suppression dossier:", result.error);
    }
    setConfirmModal({ isOpen: false, message: "", action: () => {} });
  };


  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/logo_aleatory.webp"
            alt="Aleatory"
            className="h-32 mb-4 mx-auto"
          />
          <h1 className="text-3xl font-bold text-accent-900 mb-2">
            Créez vos propres tirages au sort
          </h1>
          
          {/* Indicateur de connexion */}
          {auth?.session ? (
            <div className="bg-primary-50 border border-primary-300 text-primary-800 px-4 py-2 rounded-lg inline-block">
              ✅ Connecté en tant que {auth.session.user?.user_metadata?.pseudo || auth.session.user?.email}
            </div>
          ) : (
            <div className="bg-secondary-100 border border-secondary-300 text-accent-800 px-4 py-2 rounded-lg inline-block">
              🎯 <Link to="/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                Connectez-vous
              </Link> pour sauvegarder vos tirages
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Tirage au sort */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-secondary-200">
              <h2 className="text-2xl font-bold text-accent-900 mb-4">🎲 Tirage au sort</h2>
              
              {/* Input pour ajouter des items */}
              <div className="mb-4">
                <InputField
                  onAddItem={(item) => {
                    if (lotteryItems.includes(item)) {
                      setLotteryError(`"${item}" est déjà dans la liste`);
                    } else {
                      setLotteryItems([...lotteryItems, item]);
                      setLotteryError(null); // Clear l'erreur en cas de succès
                    }
                  }}
                  placeholder="Ajouter un élément..."
                  buttonLabel="Ajouter"
                  errorMessage={lotteryError}
                  onDismissError={() => setLotteryError(null)}
                />
              </div>

              {/* Liste des items du tirage */}
              {lotteryItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-accent-700 mb-3">
                    Éléments à tirer ({lotteryItems.length})
                  </h3>
                  <div className="space-y-2">
                    {lotteryItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-secondary-50 border border-secondary-200 p-3 rounded"
                      >
                        <span className="text-accent-800">{item}</span>
                        <div className="flex gap-2">
                          {auth?.session && (
                            <>
                              {savingItems.has(item) ? (
                                // En cours de sauvegarde
                                <div
                                  className="text-blue-500 animate-spin"
                                  title="Sauvegarde en cours..."
                                >
                                  ⏳
                                </div>
                              ) : savedItemsSet.has(item) ? (
                                // Déjà sauvé
                                <div
                                  className="text-green-500 cursor-default"
                                  title="Déjà enregistré en base"
                                >
                                  ✅
                                </div>
                              ) : (
                                // Pas encore sauvé
                                <button
                                  onClick={() => handleSaveItem(item)}
                                  className="text-primary-500 hover:text-primary-700 transition-colors"
                                  title="Sauvegarder cet élément"
                                >
                                  💾
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => removeItemFromLottery(index)}
                            className="text-accent-600 hover:text-accent-800 transition-colors"
                            title="Supprimer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton tirage */}
              <Button
                onClick={drawLottery}
                disabled={lotteryItems.length === 0}
                label={lotteryItems.length === 0 ? "Ajoutez des éléments pour tirer au sort" : `🎯 Tirer au sort ! (${lotteryItems.length} éléments)`}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3"
              />
            </div>
          </div>

          {/* Sidebar avec items sauvegardés et dossiers */}
          {auth?.session && (
            <div className="space-y-6">
              {/* Section Dossiers */}
              <div className="bg-white p-6 rounded-lg shadow-lg border border-secondary-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-accent-900">📁 Dossiers</h3>
                  <button
                    onClick={() => setShowFolderInput(!showFolderInput)}
                    className="text-primary-500 hover:text-primary-700 transition-colors"
                    title="Créer un dossier"
                  >
                    ➕
                  </button>
                </div>

                {showFolderInput && (
                  <div className="mb-4">
                    <InputField
                      onAddItem={(folderName) => {
                        if (folderName.trim()) {
                          handleCreateFolder(folderName.trim());
                        }
                      }}
                      placeholder="Nom du dossier"
                      buttonLabel="Créer"
                    />
                    <Button
                      onClick={() => setShowFolderInput(false)}
                      label="Annuler"
                      className="bg-gray-300 hover:bg-gray-400 mt-2"
                    />
                  </div>
                )}

                {loadingFolders ? (
                  <p className="text-accent-600">Chargement...</p>
                ) : folders.length === 0 ? (
                  <p className="text-accent-600 italic">Aucun dossier</p>
                ) : (
                  <div className="space-y-2">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex justify-between items-center bg-secondary-50 border border-secondary-200 p-2 rounded"
                      >
                        <span className="text-accent-800">{folder.folder_name}</span>
                        <button
                          onClick={() => handleDeleteFolder(folder.folder_name)}
                          className="text-accent-600 hover:text-accent-800 transition-colors"
                          title="Supprimer le dossier"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Items sauvegardés */}
              <div className="bg-white p-6 rounded-lg shadow-lg border border-secondary-200">
                <h3 className="text-xl font-bold text-accent-900 mb-4">💾 Items sauvegardés</h3>
                
                {loadingSavedItems ? (
                  <p className="text-accent-600">Chargement...</p>
                ) : savedItems.length === 0 ? (
                  <p className="text-accent-600 italic">Aucun item sauvegardé</p>
                ) : (
                  <div className="space-y-2">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-secondary-50 border border-secondary-200 p-2 rounded"
                      >
                        <span className="text-accent-800">{item.item_name}</span>
                        <div className="flex gap-2">
                          {lotteryItems.includes(item.item_name) ? (
                            // Déjà dans le tirage - coche verte non cliquable
                            <div
                              className="text-green-500 cursor-default"
                              title="Déjà dans le tirage"
                            >
                              ✓
                            </div>
                          ) : (
                            // Pas dans le tirage - bouton + cliquable
                            <button
                              onClick={() => addSavedItemToLottery(item.item_name)}
                              className="text-primary-500 hover:text-primary-700 transition-colors"
                              title="Ajouter au tirage"
                            >
                              ➕
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSavedItem(item.item_name)}
                            className="text-accent-600 hover:text-accent-800 transition-colors"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de résultat */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        result={result}
        items={lotteryItems}
      />

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal({ isOpen: false, message: "", action: () => {} })}
        isDestructive={true}
      />

    </div>
  );
};

export default Home;