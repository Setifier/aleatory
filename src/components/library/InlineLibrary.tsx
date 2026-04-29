import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SavedItem } from "../../lib/savedItemsService";
import { FolderItem, RECENT_FOLDER_NAME } from "../../lib/foldersService";

interface InlineLibraryProps {
  savedItems: SavedItem[];
  recentFolder: FolderItem | null;
  otherFolders: FolderItem[];
  lotteryItems: string[];
  loadingItems: boolean;
  onAddItemToLottery: (itemName: string) => void;
  onDeleteItem: (itemName: string) => void;
  onCreateFolder: (folderName: string) => Promise<void>;
  onDeleteFolder: (folderName: string) => void;
  onToggleItemFolder: (itemId: number, folderId: number, shouldAssign: boolean) => Promise<void>;
}

// ─── Folder assignment popover (portal) ──────────────────────────────────────

interface MenuPosition { top: number; left: number }

interface FolderMenuProps {
  item: SavedItem;
  folders: FolderItem[];
  position: MenuPosition;
  onToggle: (folderId: number, shouldAssign: boolean) => void;
  onClose: () => void;
}

function FolderMenu({ item, folders, position, onToggle, onClose }: FolderMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: position.top, left: position.left, background: "rgba(14,14,46,0.98)" }}
      className="fixed z-[9999] w-48 rounded-xl border border-white/15 shadow-2xl overflow-hidden"
    >
      {folders.length === 0 ? (
        <p className="text-xs text-white/40 text-center px-3 py-3">Aucun dossier créé</p>
      ) : (
        folders.map((folder) => {
          const assigned = item.folder_ids?.includes(folder.id) ?? false;
          return (
            <button
              key={folder.id}
              onClick={() => onToggle(folder.id, !assigned)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/8 transition-colors text-left"
            >
              <span
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                  assigned ? "bg-primary-500 border-primary-500" : "border-white/25"
                }`}
              >
                {assigned && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-white/80 truncate capitalize">{folder.folder_name}</span>
            </button>
          );
        })
      )}
      {/* Explicit close button */}
      <div className="border-t border-white/10 px-3 py-2">
        <button
          onClick={onClose}
          className="w-full text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors py-0.5"
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Folder section ───────────────────────────────────────────────────────────

interface FolderSectionProps {
  label: string;
  items: SavedItem[];
  allFolders: FolderItem[];
  lotteryItems: string[];
  isExpanded: boolean;
  isSystem?: boolean;
  onToggle: () => void;
  onAddItem: (name: string) => void;
  onDeleteItem: (name: string) => void;
  onDeleteFolder?: () => void;
  onToggleItemFolder: (itemId: number, folderId: number, shouldAssign: boolean) => Promise<void>;
}

function FolderSection({
  label,
  items,
  allFolders,
  lotteryItems,
  isExpanded,
  isSystem,
  onToggle,
  onAddItem,
  onDeleteItem,
  onDeleteFolder,
  onToggleItemFolder,
}: FolderSectionProps) {
  const [openMenu, setOpenMenu] = useState<{ itemId: number; position: MenuPosition } | null>(null);

  const handleFolderIconClick = (e: React.MouseEvent<HTMLButtonElement>, item: SavedItem) => {
    e.stopPropagation();
    if (openMenu?.itemId === item.id) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 192; // w-48
    // Flip left if it would overflow the right edge
    const left = rect.right + menuWidth > window.innerWidth
      ? rect.left - menuWidth
      : rect.right - menuWidth;
    // Flip up if it would overflow the bottom
    const menuHeight = allFolders.length * 40 + 8;
    const top = rect.bottom + menuHeight > window.innerHeight
      ? rect.top - menuHeight
      : rect.bottom + 4;

    setOpenMenu({ itemId: item.id, position: { top, left } });
  };

  return (
    <div className="border border-white/10 rounded-xl">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors text-left rounded-xl"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{isExpanded ? "📂" : "📁"}</span>
          <span className="text-sm font-medium text-white/80 truncate capitalize">{label}</span>
          <span className="text-xs text-white/40 shrink-0">({items.length})</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Add all / remove all — non-system folders only */}
          {!isSystem && items.length > 0 && (() => {
            const allSelected = items.every(i => lotteryItems.includes(i.item_name));
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (allSelected) {
                    items.forEach(i => onAddItem(i.item_name));
                  } else {
                    items.filter(i => !lotteryItems.includes(i.item_name))
                         .forEach(i => onAddItem(i.item_name));
                  }
                }}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors border ${
                  allSelected
                    ? "text-primary-400 border-primary-500/50 hover:text-red-400 hover:border-red-400/50"
                    : "text-white/40 border-white/15 hover:text-primary-400 hover:border-primary-500/50"
                }`}
                title={allSelected ? "Tout retirer" : "Tout ajouter"}
              >
                {allSelected ? "−" : "+"}
              </button>
            );
          })()}
          {!isSystem && onDeleteFolder && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFolder(); }}
              className="text-white/30 hover:text-red-400 transition-colors p-1 rounded"
              title="Supprimer le dossier"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <svg
            className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Items grid — 2 cols, scroll after 8 items (~4 rows × 34px) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {items.length === 0 ? (
              <p className="text-xs text-white/30 px-4 py-3 italic">Aucun élément</p>
            ) : (
              <div className="px-2 pb-2 grid grid-cols-2 gap-1 max-h-[136px] overflow-y-auto">
                {items.map((item) => {
                  const inLottery = lotteryItems.includes(item.item_name);
                  const menuOpen = openMenu?.itemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative flex items-center gap-1 group rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
                    >
                      <button
                        onClick={() => onAddItem(item.item_name)}
                        className={`flex-1 text-left text-xs truncate transition-colors ${
                          inLottery ? "text-primary-400 font-medium" : "text-white/70 hover:text-white"
                        }`}
                        title={inLottery ? "Retirer de la loterie" : "Ajouter à la loterie"}
                      >
                        {inLottery && <span className="mr-1">✓</span>}
                        {item.item_name}
                      </button>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {/* Folder assignment icon */}
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => handleFolderIconClick(e, item)}
                          className={`p-0.5 rounded transition-colors ${
                            menuOpen ? "text-primary-400" : "text-white/30 hover:text-white/70"
                          }`}
                          title="Assigner à un dossier"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteItem(item.item_name)}
                          className="p-0.5 rounded text-white/20 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Portal menu */}
                      {menuOpen && openMenu && (
                        <FolderMenu
                          item={item}
                          folders={allFolders}
                          position={openMenu.position}
                          onToggle={(folderId, shouldAssign) => {
                            onToggleItemFolder(item.id, folderId, shouldAssign);
                          }}
                          onClose={() => setOpenMenu(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InlineLibrary({
  savedItems,
  recentFolder,
  otherFolders,
  lotteryItems,
  loadingItems,
  onAddItemToLottery,
  onDeleteItem,
  onCreateFolder,
  onDeleteFolder,
  onToggleItemFolder,
}: InlineLibraryProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolderLoading, setCreatingFolderLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingFolder) inputRef.current?.focus();
  }, [isCreatingFolder]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(folderId) ? next.delete(folderId) : next.add(folderId);
      return next;
    });
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    setCreatingFolderLoading(true);
    await onCreateFolder(name);
    setNewFolderName("");
    setIsCreatingFolder(false);
    setCreatingFolderLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateFolder();
    if (e.key === "Escape") { setIsCreatingFolder(false); setNewFolderName(""); }
  };

  const getItemsInFolder = (folderId: number) =>
    savedItems.filter((item) => item.folder_ids?.includes(folderId));

  const recentItems = recentFolder ? getItemsInFolder(recentFolder.id) : [];

  if (loadingItems) {
    return (
      <div className="flex items-center gap-2 py-2 px-1">
        <div className="w-3 h-3 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
        <span className="text-xs text-white/40">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Bibliothèque
        </span>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          title="Créer un dossier"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* New folder input */}
      <AnimatePresence>
        {isCreatingFolder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nom du dossier..."
                maxLength={50}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary-400 transition-colors"
              />
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creatingFolderLoading}
                className="text-primary-400 hover:text-primary-300 disabled:opacity-30 transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                {creatingFolderLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }}
                className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Récents — always expanded */}
      {recentFolder && (
        <FolderSection
          label={RECENT_FOLDER_NAME}
          items={recentItems}
          allFolders={otherFolders}
          lotteryItems={lotteryItems}
          isExpanded={true}
          isSystem={true}
          onToggle={() => {}}
          onAddItem={onAddItemToLottery}
          onDeleteItem={onDeleteItem}
          onToggleItemFolder={onToggleItemFolder}
        />
      )}

      {/* User folders — collapsed by default */}
      {otherFolders.map((folder) => (
        <FolderSection
          key={folder.id}
          label={folder.folder_name}
          items={getItemsInFolder(folder.id)}
          allFolders={otherFolders}
          lotteryItems={lotteryItems}
          isExpanded={expandedFolders.has(folder.id)}
          onToggle={() => toggleFolder(folder.id)}
          onAddItem={onAddItemToLottery}
          onDeleteItem={onDeleteItem}
          onDeleteFolder={() => onDeleteFolder(folder.folder_name)}
          onToggleItemFolder={onToggleItemFolder}
        />
      ))}
    </div>
  );
}
