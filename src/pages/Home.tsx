import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import SelectionCard from "../components/ui/SelectionCard";

const Home = () => {
  const auth = UserAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-secondary-50 via-white to-accent-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header moderne */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <img
              src="/assets/logo_aleatory.webp"
              alt="Aleatory"
              className="h-48 mx-auto mb-4 drop-shadow-lg"
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-full blur-xl -z-10"></div>
          </div>

          {/* Indicateur de connexion moderne */}
          {!auth?.session && (
            <div className="bg-gradient-to-r from-secondary-100 to-accent-100 border-2 border-accent-300 px-6 py-3 rounded-xl inline-block shadow-lg">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-semibold text-accent-800 mb-1">
                    Mode Invité
                  </div>
                  <Link
                    to="/signin"
                    className="text-primary-600 hover:text-primary-700 font-medium underline decoration-2 underline-offset-2"
                  >
                    Connectez-vous
                  </Link>
                  <span className="text-accent-600">
                    {" "}
                    pour sauvegarder vos données
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectionCard
              title="Lottery Machine"
              description="Tirage au sort rapide avec un seul gagnant"
              image="/assets/lottery_machine.webp"
              onClick={() => navigate("/lottery")}
            />

            <SelectionCard
              title="Tournament Mode"
              description="Créez des tournois à élimination directe ou par groupes"
              image="/assets/trophy_vector.webp"
              onClick={() => navigate("/tournament")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
