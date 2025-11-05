import InputField from "../ui/InputField";
import { normalizeText } from "../../lib/textUtils";

interface AddElementFormProps {
  onAddItem: (itemName: string) => void;
  error: string | null;
  onDismissError: () => void;
}

const AddElementForm = ({
  onAddItem,
  error,
  onDismissError,
}: AddElementFormProps) => {
  const handleAddItem = (itemName: string) => {
    const normalizedItem = normalizeText(itemName); // ✅ Normalize ici
    onAddItem(normalizedItem);
  };

  return (
    <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-4 sm:p-6 border-2 border-secondary-200 shadow-lg">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary-400 rounded-full animate-pulse"></div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-accent-800">
          Ajouter un élément
        </h3>
      </div>

      <InputField
        onAddItem={handleAddItem} // ✅ Passe la fonction wrapper
        placeholder="Entrez votre choix..."
        buttonLabel="➕ Ajouter"
        errorMessage={error}
        onDismissError={onDismissError}
      />
    </div>
  );
};

export default AddElementForm;
