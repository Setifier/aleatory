import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserAuth } from "../context/AuthContext";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const Home = () => {
  const auth = UserAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground variant="mesh" />

      <div className="relative z-10 max-w-7xl mx-auto py-8 sm:py-16 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            {/* Logo with glow effect */}
            <motion.div
              className="relative inline-block mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 rounded-full blur-3xl animate-pulse" />
              <img
                src="/assets/logo_aleatory.webp"
                alt="Aleatory"
                className="h-32 sm:h-40 md:h-56 mx-auto relative z-10 drop-shadow-2xl"
              />
            </motion.div>

            {/* Title with gradient text */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text animate-gradient">
                Bienvenue sur Aleatory
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              La plateforme ultime pour vos tirages au sort et tournois
            </p>

            {/* Guest Mode Indicator */}
            {!auth?.session && (
              <motion.div
                variants={itemVariants}
                className="inline-block mt-6"
              >
                <div className="glass-strong px-6 sm:px-8 py-4 rounded-2xl shadow-glow-md border border-secondary-500/30">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <span className="text-secondary-400 font-semibold text-lg">
                      Mode Invité
                    </span>
                    <span className="hidden sm:inline text-white/50">•</span>
                    <div className="text-white/90">
                      <Link
                        to="/signin"
                        className="text-secondary-400 hover:text-secondary-300 font-medium underline decoration-2 underline-offset-2 transition-colors"
                      >
                        Connectez-vous
                      </Link>
                      <span className="text-white/70">
                        {" "}
                        pour sauvegarder vos données
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Mode Selection Cards */}
          <motion.div
            variants={itemVariants}
            className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          >
            {/* Lottery Card */}
            <Card
              variant="gradient"
              hoverable
              clickable
              onClick={() => navigate("/lottery")}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                {/* Image */}
                <div className="relative h-48 sm:h-56 mb-6 rounded-xl overflow-hidden">
                  <motion.img
                    src="/assets/lottery_machine.webp"
                    alt="Lottery Machine"
                    className="w-full h-full object-contain p-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:gradient-text transition-all">
                    Lottery Machine
                  </h2>
                  <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                    Tirage au sort rapide avec un seul gagnant. Parfait pour
                    les décisions instantanées.
                  </p>

                  <Button
                    variant="gradient"
                    size="lg"
                    withGlow
                    className="w-full mt-4"
                  >
                    Lancer une loterie
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tournament Card */}
            <Card
              variant="gradient"
              hoverable
              clickable
              onClick={() => navigate("/tournament")}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                {/* Image */}
                <div className="relative h-48 sm:h-56 mb-6 rounded-xl overflow-hidden">
                  <motion.img
                    src="/assets/trophy_vector.webp"
                    alt="Tournament Mode"
                    className="w-full h-full object-contain p-4"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:gradient-text-gold transition-all">
                    Tournament Mode
                  </h2>
                  <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                    Créez des tournois à élimination directe ou par groupes
                    avec système de matchs.
                  </p>

                  <Button
                    variant="secondary"
                    size="lg"
                    withGlow
                    className="w-full mt-4"
                  >
                    Créer un tournoi
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto mt-16"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card variant="glass" padding="md" hoverable>
                <div className="text-center space-y-3">
                  <div className="text-4xl">⚡</div>
                  <h3 className="text-xl font-bold text-white">Ultra Rapide</h3>
                  <p className="text-white/70 text-sm">
                    Résultats instantanés avec animations fluides
                  </p>
                </div>
              </Card>

              <Card variant="glass" padding="md" hoverable>
                <div className="text-center space-y-3">
                  <div className="text-4xl">🔒</div>
                  <h3 className="text-xl font-bold text-white">Sécurisé</h3>
                  <p className="text-white/70 text-sm">
                    Vos données sont protégées et sauvegardées
                  </p>
                </div>
              </Card>

              <Card variant="glass" padding="md" hoverable>
                <div className="text-center space-y-3">
                  <div className="text-4xl">✨</div>
                  <h3 className="text-xl font-bold text-white">
                    Interface Moderne
                  </h3>
                  <p className="text-white/70 text-sm">
                    Design élégant et expérience utilisateur optimale
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
