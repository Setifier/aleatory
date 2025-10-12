import { useState } from "react";

interface QuickAddItemFormProps {
  onAddItem: (itemName: string) => Promise<boolean>;
  onCancel: () => void;
}

const QuickAddItemForm = ({ onAddItem, onCancel }: QuickAddItemFormProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [itemName, setItemName] = useState("");

  const handleAddItem = async () => {
    if (isAdding || !itemName.trim()) return;

    setIsAdding(true);
    const success = await onAddItem(itemName.trim());
    setIsAdding(false);

    if (success) {
      setItemName("");
      onCancel(); // Fermer le formulaire après succès
    }
  };

  return (
    <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary-600">💾</span>
        <span className="font-medium text-primary-800 text-sm">
          Nouvel élément
        </span>
      </div>

      <input
        type="text"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        placeholder="Nom de l'élément..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm"
        disabled={isAdding}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && itemName.trim()) {
            handleAddItem();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
      />

      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={handleAddItem}
          disabled={isAdding || !itemName.trim()}
          className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? "⏳ Ajout..." : "Ajouter"}
        </button>

        <button
          onClick={onCancel}
          disabled={isAdding}
          className="w-full py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default QuickAddItemForm;
