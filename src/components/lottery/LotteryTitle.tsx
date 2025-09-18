interface LotteryTitleProps {
  value: string;
  onChange: (value: string) => void;
  itemsCount: number;
}

const LotteryTitle = ({ value, onChange, itemsCount }: LotteryTitleProps) => {
  if (itemsCount < 2) return null;

  return (
    <div className="bg-gradient-to-br from-white to-secondary-50 rounded-xl p-4 border border-secondary-200 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <h3 className="text-lg font-semibold text-accent-800">
          Titre du tirage (optionnel)
        </h3>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Tirage équipes projet, Choix restaurant, etc..."
        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-accent-800 placeholder-accent-400"
        maxLength={100}
      />
      {value.trim() && (
        <p className="text-xs text-accent-500 mt-2">
          💡 Ce titre apparaîtra dans votre historique
        </p>
      )}
    </div>
  );
};

export default LotteryTitle;