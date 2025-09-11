import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import RandomPicker from "../components/lottery/RandomPicker";
import SavedItemsList from "../components/lottery/SavedItemsList";
import FoldersList from "../components/lottery/FoldersList";
import { UserAuth } from "../context/AuthContext";

const Home = () => {
  const auth = UserAuth();
  const [addItemToRandomPicker, setAddItemToRandomPicker] = useState<((item: string) => void) | null>(null);

  const handleItemDeleted = useCallback((itemName: string) => {
    // Cette fonction peut être utilisée pour synchroniser avec d'autres composants si nécessaire
  }, []);

  const handleFolderDeleted = useCallback((folderName: string) => {
    // Cette fonction peut être utilisée pour synchroniser avec d'autres composants si nécessaire
  }, []);

  const handleFolderSelected = useCallback((folderName: string) => {
    // Cette fonction sera appelée quand un dossier est sélectionné
    // TODO: Gérer la sélection de dossier pour filtrer les items
  }, []);

  const handleItemAdded = useCallback((itemName: string) => {
    // Appeler la fonction d'ajout du RandomPicker si disponible
    if (addItemToRandomPicker) {
      addItemToRandomPicker(itemName);
    }
  }, [addItemToRandomPicker]);

  return (
    <div className="bg-secondary-50 min-h-screen flex flex-col items-center p-4">
      {/* Titre et sous-titre */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="/assets/logo_aleatory.webp"
          alt="Aleatory"
          className="h-64 mb-8 mx-auto"
        />
        <p className="text-center mb-4 text-accent-700">
          Créez vos propres tirages au sort
        </p>

        {/* Indicateur d'authentification */}
        {auth?.session ? (
          <div className="bg-primary-50 border border-primary-300 text-primary-800 px-4 py-2 rounded-lg mb-4">
            <p className="text-sm">
              ✅ Bonjour{" "}
              <span className="font-semibold">
                {auth.session.user?.user_metadata?.pseudo ||
                  auth.session.user?.email}
              </span>{" "}
              !
            </p>
          </div>
        ) : (
          <div className="bg-secondary-50 border border-secondary-300 text-accent-800 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm text-center">
              🎯{" "}
              <span className="font-medium">
                Connectez-vous pour ne pas perdre vos tirages
              </span>
            </p>
            <div className="text-center mt-2">
              <Link
                to="/signin"
                className="inline-flex items-center px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-md hover:bg-primary-600 transition-colors duration-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full max-w-4xl m-6 items-start">
        <div className="flex flex-col gap-6 mr-6">
          <FoldersList
            onFolderDeleted={handleFolderDeleted}
            onFolderSelected={handleFolderSelected}
          />
          <SavedItemsList
            onItemDeleted={handleItemDeleted}
            onItemAdded={handleItemAdded}
          />
        </div>
        <div className="flex justify-end flex-grow">
          <div className="max-w-md w-full bg-white p-6 items-center rounded-lg shadow-lg border border-secondary-200">
            <RandomPicker
              onSaveItem={() => {}}
              onAddItem={setAddItemToRandomPicker}
              onItemRemoved={(itemName: string) => {
                // Quand un item est supprimé du tirage, on peut le traiter si nécessaire
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
