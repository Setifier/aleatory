import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Participant } from "../../types/tournamentDraw";
import type { TournamentMode } from "../../types/tournamentDraw";
import type { SavedItem } from "../../lib/savedItemsService";
import type { FolderItem } from "../../lib/foldersService";
import LibraryPickerModal from "../library/LibraryPickerModal";

interface ParticipantsPhaseProps {
  mode: TournamentMode;
  participants: Participant[];
  minParticipants: number;
  error: string | null;
  isAuthenticated: boolean;
  savedItems: SavedItem[];
  tournamentRecentFolder: FolderItem | null;
  otherFolders: FolderItem[];
  loadingItems: boolean;
  onAdd: (name: string) => boolean;
  onToggle: (name: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onDeleteSavedItem: (name: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (name: string) => void;
  onToggleItemFolder: (itemId: number, folderId: number, shouldAssign: boolean) => Promise<void>;
}

export default function ParticipantsPhase({
  mode,
  participants,
  minParticipants,
  error,
  isAuthenticated,
  savedItems,
  tournamentRecentFolder,
  otherFolders,
  loadingItems,
  onAdd,
  onToggle,
  onRemove,
  onClear,
  onDeleteSavedItem,
  onCreateFolder,
  onDeleteFolder,
  onToggleItemFolder,
}: ParticipantsPhaseProps) {
  const [inputValue, setInputValue] = useState("");
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (onAdd(trimmed)) setInputValue("");
  };

  const modeLabel =
    mode === "groups"
      ? "participants"
      : mode === "bracket"
      ? "participants"
      : "équipes / participants";

  return (
    <div className="px-6 pt-5 pb-4 space-y-4">
      {/* Input */}
      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim()) handleAdd();
            }}
            placeholder={`Ajouter un ${modeLabel.slice(0, -1)}…`}
            autoFocus
            className="
              flex-1 px-4 py-4 rounded-2xl text-lg
              bg-black/50 border-2 border-white/20
              focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20
              text-white placeholder-white/30 transition-all
            "
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="w-14 h-14 rounded-2xl bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-2xl font-bold flex items-center justify-center flex-shrink-0 transition-all shadow-lg shadow-primary-500/30"
          >
            +
          </button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-sm mt-2 px-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Library button */}
      {isAuthenticated && (
        <button
          onClick={() => setShowLibraryPicker(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
          style={{
            background: "rgba(121,101,224,0.07)",
            border: "1px solid rgba(121,101,224,0.2)",
          }}
        >
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(121,101,224,0.18)" }}
          >
            <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-primary-300">Bibliothèque</p>
            <p className="text-xs text-white/35">Importer depuis vos dossiers</p>
          </div>
          <svg className="w-4 h-4 text-white/25 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Participants list — multi-column when many */}
      <AnimatePresence>
        {participants.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">
                Liste · {participants.length}
                {participants.length < minParticipants && (
                  <span className="text-red-400 ml-2">(min {minParticipants})</span>
                )}
              </span>
              <button
                onClick={onClear}
                className="text-white/25 hover:text-red-400 transition-colors text-xs"
              >
                Tout vider
              </button>
            </div>
            {(() => {
              const n = participants.length;
              const cols = n <= 8 ? 1 : n <= 16 ? 2 : 3;
              return (
                <div
                  className="grid gap-x-2 gap-y-1.5"
                  style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                  {participants.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-center gap-2 bg-black/25 border border-white/8 group ${
                        cols > 1 ? "px-3 py-2 rounded-xl" : "px-4 py-2.5 rounded-xl"
                      }`}
                    >
                      <span
                        className={`text-primary-400 font-bold flex-shrink-0 tabular-nums text-center ${
                          cols > 1 ? "text-xs w-4" : "text-xs w-5"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-white font-medium text-sm truncate">
                        {p.name}
                      </span>
                      <button
                        onClick={() => onRemove(p.id)}
                        className="text-white/20 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library picker modal */}
      <LibraryPickerModal
        isOpen={showLibraryPicker}
        onClose={() => setShowLibraryPicker(false)}
        savedItems={savedItems}
        recentFolder={tournamentRecentFolder}
        otherFolders={otherFolders}
        selectedItems={participants.map((p) => p.name)}
        loadingItems={loadingItems}
        onToggleItem={onToggle}
        onDeleteItem={onDeleteSavedItem}
        onCreateFolder={onCreateFolder}
        onDeleteFolder={onDeleteFolder}
        onToggleItemFolder={onToggleItemFolder}
      />
    </div>
  );
}
