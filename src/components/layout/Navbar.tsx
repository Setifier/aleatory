import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import { logger } from "../../lib/logger";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const auth = UserAuth();

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
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/aleatory_logo_typo_s.webp"
                alt="Aleatory"
                className="h-14"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {auth?.session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="text-accent-700 hover:text-primary-600 px-3 py-2 rounded-md text-xl font-medium transition-colors flex items-center"
                >
                  {auth?.session?.user?.user_metadata?.pseudo ||
                    auth?.session?.user?.email?.split("@")[0] ||
                    "Mon Profil"}
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-secondary-200">
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-lg text-accent-700 hover:bg-secondary-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      ⚙️ Paramètres
                    </Link>

                    <div className="border-t border-secondary-200 my-1"></div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowSignOutModal(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-lg text-accent-700 hover:bg-secondary-50 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="text-accent-700 hover:text-primary-600 px-3 py-2 rounded-md text-xl font-medium transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-4 rounded-md text-accent-700 hover:text-primary-600 hover:bg-secondary-50 transition-colors relative z-50 touch-manipulation"
            aria-label="Menu utilisateur"
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
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-secondary-200 bg-white z-40"
          ref={mobileMenuRef}
        >
          <div className="py-2">
            {auth?.session ? (
              <>
                <div className="px-4 py-2 text-sm text-accent-600">
                  {auth?.session?.user?.user_metadata?.pseudo ||
                    auth?.session?.user?.email}
                </div>
                <Link
                  to="/settings"
                  className="block px-4 py-3 text-accent-700 hover:bg-secondary-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ⚙️ Paramètres
                </Link>
                <div className="border-t border-secondary-200 my-1"></div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowSignOutModal(true);
                  }}
                  className="block w-full text-left px-4 py-3 text-accent-700 hover:bg-secondary-50 transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="block px-4 py-3 text-accent-700 hover:bg-secondary-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Se déconnecter ?
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Vous allez être déconnecté et redirigé vers la page de connexion.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
