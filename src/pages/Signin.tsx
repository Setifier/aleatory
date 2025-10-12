import { useState, useEffect, useRef } from "react";
import Button from "../components/ui/Button";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { UserAuth, getErrorMessage } from "../context/AuthContext";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [showMfaStep, setShowMfaStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const auth = UserAuth();
  const navigate = useNavigate();

  // Ref pour stocker le timeout du auto-submit MFA
  const mfaAutoSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier si on vient d'un reset de mot de passe réussi ou d'un forgot password
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const resetSuccess = searchParams.get("reset");
    if (resetSuccess === "success") {
      setSuccessMessage(
        "Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter."
      );

      // Faire disparaître le message après 10 secondes
      timeoutId = setTimeout(() => {
        setSuccessMessage("");
      }, 10000);
    }

    // Vérifier si on vient de ForgotPassword avec un message
    const stateMessage = location.state?.message;
    if (stateMessage) {
      setSuccessMessage(stateMessage);
      // Nettoyer l'état pour éviter que le message persiste
      window.history.replaceState({}, "", window.location.pathname);

      // Faire disparaître le message après 10 secondes
      // Note: Si les deux conditions sont vraies, on garde le dernier timeout
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSuccessMessage("");
      }, 10000);
    }

    // Cleanup: annuler le timeout si le composant se démonte avant la fin
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchParams, location.state]);

  // Cleanup du timeout MFA au démontage du composant
  useEffect(() => {
    return () => {
      if (mfaAutoSubmitTimeoutRef.current) {
        clearTimeout(mfaAutoSubmitTimeoutRef.current);
      }
    };
  }, []);

  // On vérifie que le contexte d'authentification est disponible
  if (!auth) {
    return null; // Si le contexte n'est pas disponible, on ne rend rien
  }
  const { signInUser, verifyMfaAndSignIn } = auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        navigate("/");
      } else if (result.requiresMfa) {
        // MFA requis - passer à l'étape de saisie du code
        setShowMfaStep(true);
        setError(""); // Pas d'erreur, juste MFA requis
        // Empêcher toute redirection automatique
        return; // Important : sortir ici
      } else {
        setError(
          result.error ? getErrorMessage(result.error) : "Erreur de connexion"
        );
      }
    } catch {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await verifyMfaAndSignIn(mfaCode);
      if (result.success) {
        navigate("/");
      } else {
        setError(
          result.error ? getErrorMessage(result.error) : "Code invalide"
        );
      }
    } catch {
      setError("Erreur lors de la vérification MFA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg border border-secondary-200">
        <div className="flex justify-between items-center">
          <h2 className="mt-6 text-center text-3xl font-bold text-accent-900">
            {showMfaStep ? "Code d'authentification" : "Se connecter"}
          </h2>
        </div>

        {showMfaStep ? (
          // Interface MFA
          <form className="mt-8 space-y-6" onSubmit={handleMfaSubmit}>
            {error && (
              <div className="text-red-700 text-sm text-center bg-red-100 border-2 border-red-300 px-4 py-3 rounded-lg font-medium shadow-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Entrez le code à 6 chiffres de votre app d'authentification
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Connecté en tant que : <strong>{email}</strong>
              </p>
            </div>

            <div>
              <input
                type="text"
                placeholder="123456"
                value={mfaCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setMfaCode(value);

                  // Annuler tout timeout précédent pour éviter les race conditions
                  if (mfaAutoSubmitTimeoutRef.current) {
                    clearTimeout(mfaAutoSubmitTimeoutRef.current);
                    mfaAutoSubmitTimeoutRef.current = null;
                  }

                  // Auto-soumission dès que 6 chiffres sont saisis
                  if (value.length === 6 && !loading) {
                    mfaAutoSubmitTimeoutRef.current = setTimeout(async () => {
                      setError("");
                      setLoading(true);

                      try {
                        const result = await verifyMfaAndSignIn(value);
                        if (result.success) {
                          navigate("/");
                        } else {
                          setError(
                            result.error
                              ? getErrorMessage(result.error)
                              : "Code invalide"
                          );
                        }
                      } catch {
                        setError("Erreur lors de la vérification MFA");
                      } finally {
                        setLoading(false);
                      }
                    }, 200);
                  }
                }}
                className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={6}
                required
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                label={loading ? "Vérification..." : "Vérifier"}
                disabled={loading || mfaCode.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              />

              <button
                type="button"
                onClick={() => {
                  setShowMfaStep(false);
                  setMfaCode("");
                  setError("");
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Retour à la connexion
              </button>
            </div>
          </form>
        ) : (
          // Interface de connexion normale
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-700 text-sm text-center bg-red-100 border-2 border-red-300 px-4 py-3 rounded-lg font-medium shadow-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-green-600 text-sm text-center bg-green-50 border border-green-200 px-3 py-2 rounded">
                {successMessage}
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
                    placeholder="Mot de passe"
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
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div>
              <Button
                type="submit"
                label={loading ? "Connexion en cours..." : "Se connecter"}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              />
            </div>
          </form>
        )}

        {!showMfaStep && (
          <div className="text-center">
            <p className="text-sm text-accent-600">
              Pas encore de compte ?{" "}
              <Link
                to="/signup"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signin;
