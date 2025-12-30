import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SavedItem } from "../../lib/savedItemsService";
import ItemCardGaming from "./ItemCardGaming";
import Button from "../ui/Button";
import InputField from "../ui/InputField";

interface ItemsLibraryGamingProps {
  savedItems: SavedItem[];
  loadingSavedItems: boolean;
  lotteryItems: string[];
  onSaveItem: (itemName: string) => Promise<boolean>;
  onDeleteItem: (itemName: string) => void;
  onAddItemToLottery: (itemName: string) => void;
}

export default function ItemsLibraryGaming({
  savedItems,
  loadingSavedItems,
  lotteryItems,
  onSaveItem,
  onDeleteItem,
  onAddItemToLottery,
}: ItemsLibraryGamingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = savedItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isItemInLottery = (itemName: string) => lotteryItems.includes(itemName);

  const handleAddItem = async (itemName: string) => {
    const success = await onSaveItem(itemName);
    if (success) {
      setShowAddForm(false);
    }
  };

  if (savedItems.length === 0 && !showAddForm) {
    return (
      <motion.div
        className="glass-strong rounded-2xl p-8 border border-white/10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Bibliothèque vide
        </h3>
        <p className="text-white/60 mb-6">
          Sauvegardez des éléments pour les réutiliser plus tard
        </p>
        <Button
          onClick={() => setShowAddForm(true)}
          variant="gradient"
          size="lg"
          withGlow
        >
          ➕ Sauvegarder un élément
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        className="glass-strong rounded-2xl p-6 border border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎮
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">
                Ma Bibliothèque
              </h2>
              <p className="text-white/60 text-sm">
                {savedItems.length} élément{savedItems.length > 1 ? "s" : ""} sauvegardé
                {savedItems.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "gradient"}
              size="md"
            >
              {showAddForm ? "✖ Annuler" : "➕ Ajouter"}
            </Button>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="md"
            >
              {isExpanded ? "▲ Réduire" : "▼ Développer"}
            </Button>
          </div>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <InputField
                onAddItem={handleAddItem}
                placeholder="Nom de l'élément à sauvegarder..."
                buttonLabel="💾 Sauvegarder"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        {savedItems.length > 3 && isExpanded && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher..."
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Items Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loadingSavedItems ? (
              <div className="glass-strong rounded-2xl p-12 border border-white/10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent mx-auto mb-4" />
                <p className="text-white/60">Chargement...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="glass-strong rounded-2xl p-12 border border-white/10 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-white/60">
                  {searchTerm
                    ? "Aucun élément trouvé"
                    : "Aucun élément sauvegardé"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ItemCardGaming
                      item={item}
                      isInLottery={isItemInLottery(item.item_name)}
                      onAddToLottery={() => onAddItemToLottery(item.item_name)}
                      onDelete={() => onDeleteItem(item.item_name)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
