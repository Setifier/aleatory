import { useState } from "react";
import { Link } from "react-router-dom";
import { LotteryResult } from "../../hooks/useLottery";
import Button from "../ui/Button";
import ElementsListModal from "./ElementsListModal";
import ConfirmModal from "../ui/ConfirmModal";

interface LotteryHistoryProps {
  history: LotteryResult[];
  onClear?: () => void;
  onDeleteEntry?: (entryId: string) => void;
  isAuthenticated?: boolean;
}

const LotteryHistory = ({
  history,
  onClear,
  onDeleteEntry,
  isAuthenticated = false,
}: LotteryHistoryProps) => {
  const [selectedEntry, setSelectedEntry] = useState<LotteryResult | null>(
    null
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  if (history.length === 0) return null;

  return (
    <>
      <div className="bg-gradient-to-br from-secondary-50 to-white rounded-xl p-6 border-2 border-secondary-200 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-secondary-400 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-semibold text-accent-800">
              🕒 Historique des tirages
            </h3>
            <span className="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-sm font-medium">
              {history.length}
            </span>
          </div>

          {onClear && (
            <Button
              onClick={() => setShowClearConfirm(true)} // ✅ Ouvre modal
              label="🗑️ Vider"
              className="bg-gray-400 hover:bg-gray-500 text-white text-sm px-3 py-1"
            />
          )}
        </div>

        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <div className="text-yellow-500 text-sm">⚠️</div>
              <div className="text-yellow-700 text-sm">
                <strong>Mode invité :</strong> L'historique sera perdu au
                rechargement de la page.
                <br />
                <Link
                  to="/signin"
                  className="text-primary-600 underline hover:text-primary-700 transition-colors"
                >
                  Connectez-vous
                </Link>{" "}
                pour sauvegarder vos données.
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 p-4 max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {history.map((result, index) => (
            <div
              key={`${result.timestamp.getTime()}-${index}`}
              className={`
                relative bg-white border-2 rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-pointer
                ${
                  index === 0
                    ? "border-secondary-500 bg-gradient-to-r from-secondary-200 to-secondary-100"
                    : "border-secondary-200 hover:border-secondary-300"
                }
              `}
              onClick={() => setSelectedEntry(result)}
              title="Cliquez pour voir tous les éléments"
            >
              {index === 0 && (
                <div className="absolute -top-4 -right-3 bg-secondary-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  Récent
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  {result.title && (
                    <div className="mb-2">
                      <h4 className="font-semibold text-accent-800 text-base break-words">
                        {result.title}
                      </h4>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-2xl">🏆</span>
                    <span className="font-bold text-accent-800 text-lg break-words">
                      {result.winner.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-accent-600 flex-wrap">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>🕒</span>
                      {result.timestamp.toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div className="flex items-center gap-1 whitespace-nowrap text-accent-600">
                      <span>👥</span>
                      {result.participantsCount} élément
                      {result.participantsCount > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  {isAuthenticated && onDeleteEntry && result.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryToDelete(result.id!); // ✅ Ouvre modal
                      }}
                      className="text-accent-400 hover:text-red-500 transition-colors text-xs p-1"
                      title="Supprimer cette entrée"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.length > 3 && (
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <div className="text-center text-sm text-accent-600">
              📈 {history.length} tirage{history.length > 1 ? "s" : ""} effectué
              {history.length > 1 ? "s" : ""}
              {!isAuthenticated && " • Données temporaires (mode invité)"}
            </div>
          </div>
        )}

        {selectedEntry && selectedEntry.elements && (
          <ElementsListModal
            isOpen={true}
            elements={selectedEntry.elements}
            winner={selectedEntry.winner}
            title={selectedEntry.title}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>

      {/* ✅ Modal vider historique */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Vider l'historique"
        message="Voulez-vous vraiment supprimer tout l'historique des tirages ?"
        confirmLabel="Vider"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={() => {
          onClear?.();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* ✅ Modal supprimer entrée */}
      {entryToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Supprimer l'entrée"
          message="Voulez-vous vraiment supprimer cette entrée de l'historique ?"
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          isDestructive={true}
          onConfirm={() => {
            onDeleteEntry?.(entryToDelete);
            setEntryToDelete(null);
          }}
          onCancel={() => setEntryToDelete(null)}
        />
      )}
    </>
  );
};

export default LotteryHistory;
