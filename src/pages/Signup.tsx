import { useState } from "react";
import Button from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth, getErrorMessage } from "../context/AuthContext";
import { formatAndValidatePseudo } from "../lib/pseudoUtils";
import ConfirmModal from "../components/ui/ConfirmModal";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false);
  const [showEmailConfirmDialog, setShowEmailConfirmDialog] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const auth = UserAuth();
  const navigate = useNavigate();

  if (!auth) {
    return null;
  }
  const { signUpNewUser } = auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation du pseudo
    const pseudoValidation = formatAndValidatePseudo(pseudo);
    if (!pseudoValidation.isValid) {
      setError(pseudoValidation.error || "Pseudo invalide");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      // Utilise le pseudo formaté
      const formattedPseudo = pseudoValidation.formatted;
      const result = await signUpNewUser(email, password, formattedPseudo);
      if (result.success) {
        if (result.needsEmailConfirmation) {
          // Email de confirmation nécessaire
          setError(""); // Pas d'erreur, juste un message informatif
          setConfirmationEmail(email);
          setShowEmailConfirmDialog(true);
        } else {
          // Inscription directe (si confirmation désactivée)
          navigate("/");
        }
      } else if (result.isUserAlreadyExists) {
        // Compte existant - afficher la modale
        setShowAccountExistsModal(true);
      } else {
        setError(
          result.error ? getErrorMessage(result.error) : "Erreur d'inscription"
        );
      }
    } catch {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg border border-secondary-200">
        <div className="flex justify-between items-center">
          <h2 className="mt-6 text-center text-3xl font-bold text-accent-900">
            Créer un compte
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-700 text-sm text-center bg-red-100 border-2 border-red-300 px-4 py-3 rounded-lg font-medium shadow-sm">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-accent-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <div className="flex">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-l-lg relative block w-full px-3 py-2 border border-r-0 border-secondary-300 placeholder-secondary-500 text-accent-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Mot de passe (min. 8 caractères)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-secondary-300 rounded-r-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors flex items-center"
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirmer le mot de passe
              </label>
              <div className="flex">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-l-lg relative block w-full px-3 py-2 border border-r-0 border-secondary-300 placeholder-secondary-500 text-accent-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-secondary-300 rounded-r-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors flex items-center"
                >
                  {showConfirmPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="pseudo" className="sr-only">
                Pseudo
              </label>
              <input
                id="pseudo"
                name="pseudo"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-accent-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Pseudo (min. 2 lettres)"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              label={loading ? "Inscription en cours..." : "S'inscrire"}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            />
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-accent-600">
            Déjà un compte ?{" "}
            <Link
              to="/signin"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Dialog Email de confirmation */}
        <ConfirmModal
          isOpen={showEmailConfirmDialog}
          title="Email de confirmation envoyé"
          message={`Un email de confirmation a été envoyé à ${confirmationEmail}.\n\nVeuillez cliquer sur le lien dans l'email pour activer votre compte, puis vous connecter.`}
          onConfirm={() => {
            setShowEmailConfirmDialog(false);
            setConfirmationEmail("");
            navigate("/signin");
          }}
          onCancel={() => {
            setShowEmailConfirmDialog(false);
            setConfirmationEmail("");
            navigate("/signin");
          }}
          confirmLabel="Compris"
          cancelLabel="Fermer"
          advancedA11y={true}
        />

        {/* Modale compte existant */}
        {showAccountExistsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Compte déjà existant
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Un compte avec l'adresse <strong>{email}</strong> existe déjà.
                  <br />
                  Vous pouvez vous connecter directement.
                </p>
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/signin"
                    className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors text-center"
                  >
                    Se connecter
                  </Link>
                  <button
                    onClick={() => setShowAccountExistsModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
