import { motion } from "framer-motion";
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
    const normalizedItem = normalizeText(itemName);
    onAddItem(normalizedItem);
  };

  return (
    <div>
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-3 h-3 bg-primary-400 rounded-full shadow-glow-sm"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Ajouter un élément
        </h3>
      </motion.div>

      <InputField
        onAddItem={handleAddItem}
        placeholder="Entrez votre choix..."
        buttonLabel="➕ Ajouter"
        errorMessage={error}
        onDismissError={onDismissError}
      />
    </div>
  );
};

export default AddElementForm;
