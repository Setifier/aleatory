import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserAuth } from "../../context/AuthContext";
import { logger } from "../../lib/logger";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const auth = UserAuth();

  // Detect scroll for navbar style change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Dropdown desktop
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      const result = await auth?.signOut();
      if (result?.success) {
        window.location.href = "/signin";
      } else {
        logger.error("Sign out error", result?.error);
      }
    } catch (error) {
      logger.error("Sign out error", error);
    } finally {
      setIsDropdownOpen(false);
      setShowSignOutModal(false);
    }
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-strong shadow-glass-lg border-b border-white/10"
            : "bg-transparent border-b border-white/5"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="flex items-center transition-opacity hover:opacity-80"
              >
                <img
                  src="/assets/aleatory_logo_typo_s.webp"
                  alt="Aleatory"
                  className="h-14 drop-shadow-lg"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {auth?.session ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={toggleDropdown}
                    className="text-white/90 hover:text-white px-4 py-2 rounded-lg text-lg font-medium transition-all flex items-center gap-2 glass-dark hover:glass-strong"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="gradient-text-gold">
                      {auth?.session?.user?.user_metadata?.pseudo ||
                        auth?.session?.user?.email?.split("@")[0] ||
                        "Mon Profil"}
                    </span>
                    <motion.svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl shadow-glass-lg py-2 z-50 border border-white/10 overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          to="/settings"
                          className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all text-base hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="flex items-center gap-2">
                            ⚙️ Paramètres
                          </span>
                        </Link>

                        <div className="border-t border-white/10 my-1"></div>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setShowSignOutModal(true);
                          }}
                          className="block w-full text-left px-4 py-3 text-white/90 hover:bg-white/10 transition-all text-base hover:text-white"
                        >
                          Se déconnecter
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/signin">
                  <motion.div
                    className="text-white/90 hover:text-white px-4 py-2 rounded-lg text-lg font-medium glass-dark hover:glass-strong transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Connexion
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              ref={mobileButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-lg text-white/90 hover:text-white glass-dark hover:glass-strong transition-all relative z-50 touch-manipulation"
              aria-label="Menu utilisateur"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="h-8 w-8 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-white/10 glass-strong z-40"
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-2">
                {auth?.session ? (
                  <>
                    <div className="px-4 py-2 text-sm text-secondary-400 font-medium">
                      {auth?.session?.user?.user_metadata?.pseudo ||
                        auth?.session?.user?.email}
                    </div>
                    <Link
                      to="/settings"
                      className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ⚙️ Paramètres
                    </Link>
                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowSignOutModal(true);
                      }}
                      className="block w-full text-left px-4 py-3 text-white/90 hover:bg-white/10 transition-all hover:text-white"
                    >
                      Se déconnecter
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    className="block px-4 py-3 text-white/90 hover:bg-white/10 transition-all hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSignOutModal(false)}
          >
            <motion.div
              className="glass-strong rounded-2xl p-6 max-w-sm w-full shadow-glass-lg border border-white/10"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Se déconnecter ?
              </h3>
              <p className="text-white/70 text-sm mb-6">
                Vous allez être déconnecté et redirigé vers la page de
                connexion.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 px-4 py-2 glass-dark text-white font-medium rounded-lg hover:glass-strong transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-glow-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirmer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
