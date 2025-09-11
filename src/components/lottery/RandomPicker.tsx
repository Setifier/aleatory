import { useState, useCallback, memo, useEffect } from "react";
import InputField from "../ui/InputField";
import ItemsList from "./ItemsList";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import AnimatedText from "./AnimatedText"; // Importer AnimatedText

// Fonction utilitaire pour normaliser le texte (défense en profondeur)
const normalizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return (
    text
      // Réduire les espaces multiples à un seul espace
      .replace(/\s+/g, " ")
      // Supprimer les espaces en début et fin
      .trim()
      // Convertir tout en minuscules d'abord
      .toLowerCase()
      // Mettre en majuscule la première lettre de chaque mot (sauf après un tiret)
      .replace(/(?:^|\s)([a-z])/g, (match, letter) =>
        match.replace(letter, letter.toUpperCase())
      )
  );
};

interface RandomPickerProps {
  onSaveItem: (item: string) => void;
  items?: string[]; // Items du tirage (optionnel, pour synchronisation)  
  onAddItem?: (addItemFunction: (itemName: string) => void) => void; // Fonction pour exposer la méthode d'ajout
  onItemRemoved?: (itemName: string) => void; // Fonction appelée quand un item est supprimé
}

// Liste des éléments sauvegardés

const RandomPicker = memo(
  ({
    onSaveItem,
    items: externalItems,
    onAddItem,
    onItemRemoved,
  }: RandomPickerProps) => {
    const [items, setItems] = useState<string[]>(externalItems || []); // Liste des éléments ajoutés
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Message d'erreur

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // État pour afficher la modale
    const [currentResult, setCurrentResult] = useState<string | null>(null); // Résultat du tirage
    const [previousResults, setPreviousResults] = useState<string[]>([]); // Historique des tirages
    const [showAnimation, setShowAnimation] = useState<boolean>(false); // État pour l'animation du texte

    const handleAddItem = useCallback(
      (item: string) => {
        // Normaliser l'item entrant (défense en profondeur)
        const normalizedItem = normalizeText(item);

        // Effacer toute erreur précédente
        setErrorMessage(null);

        // Vérifier si l'item existe déjà dans la liste (comparaison normalisée)
        if (items.includes(normalizedItem)) {
          setErrorMessage(
            `"${normalizedItem}" est déjà dans la liste de tirage.`
          );
          return; // Ne pas ajouter le doublon
        }

        // Ajouter l'item à la liste
        setItems((prev) => [...prev, normalizedItem]);
      },
      [items]
    );

    const handleRemoveItem = useCallback(
      (index: number) => {
        const removedItem = items[index];
        setItems((prev) => prev.filter((_, i) => i !== index));

        // Notifier le parent quand un item est supprimé
        if (removedItem && onItemRemoved) {
          onItemRemoved(removedItem);
          console.log(`🔄 Item supprimé: "${removedItem}"`);

          // Appeler la fonction globale pour remettre l'état de sauvegarde à "idle"
          if ((window as any).resetItemSaveState) {
            (window as any).resetItemSaveState(removedItem);
          }
        }
      },
      [items, onItemRemoved]
    );

    const handleClearAll = useCallback(() => {
      const clearedItems = [...items];
      setItems([]);

      // Notifier le parent pour tous les items supprimés
      if (onItemRemoved && clearedItems.length > 0) {
        clearedItems.forEach((item) => {
          onItemRemoved(item);

          // Appeler la fonction globale pour remettre l'état de sauvegarde à "idle"
          if ((window as any).resetItemSaveState) {
            (window as any).resetItemSaveState(item);
          }
        });
        console.log(`🔄 Tous les items supprimés: ${clearedItems.join(", ")}`);
      }
    }, [items, onItemRemoved]);

    const handleClearHistory = useCallback(() => {
      setPreviousResults([]); // Réinitialise l'historique des tirages
    }, []);

    const handleDismissError = useCallback(() => {
      setErrorMessage(null);
    }, []);

    // Synchroniser avec les items externes
    useEffect(() => {
      if (externalItems && externalItems.length > 0) {
        setItems(externalItems);
      }
    }, [externalItems]);

    // Exposer la fonction handleAddItem au parent
    useEffect(() => {
      if (onAddItem) {
        onAddItem(handleAddItem);
      }
    }, [onAddItem, handleAddItem]);

    const pickRandomItem = useCallback(() => {
      if (items.length > 1) {
        setShowAnimation(true); // Déclenche l'animation "Let's go!"
      }
    }, [items.length]);

    const handleAnimationComplete = useCallback(() => {
      setShowAnimation(false); // Cache l'animation après la fin
      const randomIndex = Math.floor(Math.random() * items.length);
      setCurrentResult(items[randomIndex]); // Met à jour le résultat du tirage
      setIsModalOpen(true); // Ouvre la modale pour afficher le résultat
    }, [items.length]);

    const closeModal = useCallback(() => {
      if (currentResult) {
        setPreviousResults((prev) => [...prev, currentResult]); // Ajoute le résultat actuel à l'historique
        setCurrentResult(null); // Réinitialise le résultat actuel
      }
      setIsModalOpen(false); // Ferme la modale
    }, [currentResult]);

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center text-accent-800">
          Ajoutez des éléments et tirez au sort !
        </h2>

        {/* Conteneur des champs de saisie et du bouton "Effacer tout" */}
        <div className="flex flex-row gap-4 items-center mb-8 justify-between">
          <div className="flex-1">
            <InputField
              onAddItem={handleAddItem}
              errorMessage={errorMessage}
              onDismissError={handleDismissError}
            />
          </div>
          {items.length > 0 && (
            <Button
              label="Effacer tout"
              onClick={handleClearAll}
              className="bg-accent-600 hover:bg-accent-700"
            />
          )}
        </div>

        {/* Liste des éléments ajoutés */}
        <ItemsList
          items={items}
          onRemoveItem={handleRemoveItem}
          onSaveItem={onSaveItem}
          onItemRemoved={onItemRemoved}
        />

        {/* Bouton pour tirer au sort */}
        <div className="flex justify-center mt-8">
          <Button label="Tirer au sort !" onClick={pickRandomItem} />
        </div>

        {/* Composant Modal pour afficher le résultat du tirage */}
        <Modal
          isOpen={isModalOpen}
          result={currentResult}
          items={items}
          onClose={closeModal}
        />

        {/* Affichage des résultats précédents */}
        {previousResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-accent-800">
              Historique des tirages :
            </h3>
            <ul className="list-disc list-inside bg-secondary-50 border border-secondary-200 p-4 rounded shadow">
              {previousResults.map((result, index) => (
                <li key={index} className="py-1">
                  {result}
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-4">
              <Button
                label="Effacer l'historique"
                onClick={handleClearHistory}
                className="bg-accent-600 hover:bg-accent-700"
              />
            </div>
          </div>
        )}

        {/* Animation "Let's go!" */}
        {showAnimation && (
          <AnimatedText onAnimationComplete={handleAnimationComplete} />
        )}
      </div>
    );
  }
);

RandomPicker.displayName = "RandomPicker";

export default RandomPicker;
