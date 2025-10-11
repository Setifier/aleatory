import { useNavigate } from "react-router-dom";

const Tournament = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-accent-600 hover:text-accent-800 flex items-center gap-2 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </button>

          <h1 className="text-4xl font-bold text-accent-900">
            🏆 Tournament Mode
          </h1>
          <p className="text-accent-600 mt-2">
            Create brackets and group stages for your competitions
          </p>
        </div>

        {/* Placeholder content */}
        <div className="bg-white rounded-xl p-8 border border-secondary-200 shadow-md text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-accent-800 mb-2">
            Under Construction
          </h2>
          <p className="text-accent-600">
            Tournament creation interface coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tournament;
