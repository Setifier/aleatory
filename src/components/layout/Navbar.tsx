import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const auth = UserAuth();

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      const result = await auth?.signOut();
      if (result?.success) {
        console.log("Déconnexion réussie ! Session terminée.");
        // La session sera automatiquement mise à null par onAuthStateChange
        // Pas besoin de redirection, l'utilisateur verra le changement d'état
      } else {
        console.error("Erreur lors de la déconnexion:", result?.error);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsDropdownOpen(false);
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

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {auth?.session ? (
              // Menu déroulant "Mon Profil" quand connecté
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="text-accent-700 hover:text-primary-600 px-3 py-2 rounded-md text-xl font-medium transition-colors flex items-center"
                >
                  Mon Profil
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

                {/* Menu déroulant */}
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
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-lg text-accent-700 hover:bg-secondary-50 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Lien "Connexion" quand non connecté
              <Link
                to="/signin"
                className="text-accent-700 hover:text-primary-600 px-3 py-2 rounded-md text-xl font-medium transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
