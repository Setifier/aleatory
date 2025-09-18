import Button from "../ui/Button";

interface DrawButtonProps {
  itemsCount: number;
  isDrawing: boolean;
  onDraw: () => void;
}

const DrawButton = ({ itemsCount, isDrawing, onDraw }: DrawButtonProps) => {
  return (
    <div className="text-center">
      <Button
        onClick={onDraw}
        disabled={itemsCount < 2 || isDrawing}
        label={
          isDrawing
            ? "🎯 TIRAGE EN COURS..."
            : itemsCount === 0
            ? "⚠️ Ajoutez des éléments"
            : itemsCount === 1
            ? "⚠️ Ajoutez au moins 1 élément de plus"
            : `🎰 LANCER LE TIRAGE ! (${itemsCount} éléments)`
        }
        className={`
          text-xl px-8 py-4 font-bold rounded-xl transform transition-all duration-300 shadow-xl
          ${
            itemsCount < 2
              ? "bg-gray-400 cursor-not-allowed"
              : isDrawing
              ? "bg-primary-600 scale-105 animate-pulse cursor-wait"
              : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:scale-105 active:scale-95"
          }
        `}
      />
    </div>
  );
};

export default DrawButton;