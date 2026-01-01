import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserAuth } from "../context/AuthContext";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import GroupsDrawSection from "../components/tournament/GroupsDrawSection";
import Button from "../components/ui/Button";

const Tournament = () => {
  const navigate = useNavigate();
  const auth = UserAuth();
  const isAuthenticated = !!auth?.session;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="mesh" />

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4">
        {/* Back Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-white/80 hover:text-white"
          >
            <svg
              className="w-5 h-5 inline mr-2"
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
            Retour à l'accueil
          </Button>
        </motion.div>

        {/* Title Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">🏆 MODE TOURNAMENT</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {isAuthenticated
              ? "Créez vos tirages par groupes avec chapeaux ou aléatoire"
              : "Connectez-vous pour sauvegarder vos tirages"}
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GroupsDrawSection isAuthenticated={isAuthenticated} />
        </motion.div>
      </div>
    </div>
  );
};

export default Tournament;
