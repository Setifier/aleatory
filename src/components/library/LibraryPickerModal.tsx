import { AnimatePresence, motion } from "framer-motion";
import InlineLibrary from "./InlineLibrary";
import { SavedItem } from "../../lib/savedItemsService";
import { FolderItem } from "../../lib/foldersService";

interface LibraryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  recentFolder: FolderItem | null;
  otherFolders: FolderItem[];
  selectedItems: string[];
  loadingItems: boolean;
  onToggleItem: (name: string) => void;
  onDeleteItem: (name: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (name: string) => void;
  onToggleItemFolder: (itemId: number, folderId: number, shouldAssign: boolean) => Promise<void>;
}

export default function LibraryPickerModal({
  isOpen,
  onClose,
  savedItems,
  recentFolder,
  otherFolders,
  selectedItems,
  loadingItems,
  onToggleItem,
  onDeleteItem,
  onCreateFolder,
  onDeleteFolder,
  onToggleItemFolder,
}: LibraryPickerModalProps) {
  const selectedCount = selectedItems.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            paddingTop: "80px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 100px)",
              background: "rgba(10,10,40,0.99)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}
            initial={{ opacity: 0, y: "50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "50%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wide">
                  Bibliothèque
                </h2>
                {selectedCount > 0 && (
                  <p className="text-xs text-primary-400 mt-0.5 font-medium">
                    {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 text-white/50 hover:text-white transition-all text-sm"
              >
                ✕
              </button>
            </div>

            {/* Selected items preview */}
            <AnimatePresence initial={false}>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 overflow-hidden"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="px-5 pt-3 pb-3 max-h-[110px] overflow-y-auto">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">
                      Sélection · {selectedCount}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <AnimatePresence>
                        {selectedItems.map((name) => (
                          <motion.button
                            key={name}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => onToggleItem(name)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-75"
                            style={{
                              background: "rgba(121,101,224,0.14)",
                              border: "1px solid rgba(121,101,224,0.28)",
                              color: "rgba(161,149,248,0.9)",
                            }}
                          >
                            {name}
                            <span className="text-primary-400/50 leading-none text-sm">×</span>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Library content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <InlineLibrary
                savedItems={savedItems}
                recentFolder={recentFolder}
                otherFolders={otherFolders}
                lotteryItems={selectedItems}
                loadingItems={loadingItems}
                onAddItemToLottery={onToggleItem}
                onDeleteItem={onDeleteItem}
                onCreateFolder={onCreateFolder}
                onDeleteFolder={onDeleteFolder}
                onToggleItemFolder={onToggleItemFolder}
              />
            </div>

            {/* Footer */}
            <div
              className="px-5 py-4 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all"
              >
                {selectedCount > 0
                  ? `Confirmer · ${selectedCount} sélectionné${selectedCount > 1 ? "s" : ""}`
                  : "OK"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
