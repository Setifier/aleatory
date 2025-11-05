interface TournamentModeCardProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
  disabled?: boolean;
}

const TournamentModeCard = ({
  title,
  description,
  image,
  onClick,
  disabled = false,
}: TournamentModeCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative bg-gradient-to-br from-white to-secondary-50 
        rounded-2xl border-2 transition-all duration-300
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

      <div className="relative p-4 sm:p-6">
        {/* Vector */}
        <div className="group-hover:scale-110 transition-transform duration-300 -translate-y-4 sm:-translate-y-6">
          <img
            alt={`${title} illustration`}
            src={image}
            className="w-32 h-32 sm:w-40 sm:h-40 mx-auto object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-accent-800 mb-2">{title}</h3>

        {/* Description */}
        <p className="text-accent-600 text-xs sm:text-sm">{description}</p>

        {/* Arrow indicator */}
        {!disabled && (
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-primary-500 font-medium text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
