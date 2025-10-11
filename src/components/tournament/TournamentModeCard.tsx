interface TournamentModeCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

const TournamentModeCard = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
}: TournamentModeCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative bg-gradient-to-br from-white to-secondary-50 
        rounded-2xl p-8 border-2 transition-all duration-300
        ${
          disabled
            ? "border-secondary-200 opacity-50 cursor-not-allowed"
            : "border-secondary-200 hover:border-primary-400 hover:shadow-xl hover:scale-105 cursor-pointer"
        }
      `}
    >
      {/* Glow effect on hover */}
      {!disabled && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
      )}

      <div className="relative">
        {/* Icon */}
        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-accent-800 mb-2">{title}</h3>

        {/* Description */}
        <p className="text-accent-600 text-sm">{description}</p>

        {/* Arrow indicator */}
        {!disabled && (
          <div className="mt-4 flex items-center justify-center gap-2 text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Commencer</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
};

export default TournamentModeCard;
