import { useState } from "react";
import Button from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [showMfaStep, setShowMfaStep] = useState(false);

  const auth = UserAuth();
  // On vérifie que le contexte d'authentification est disponible
  if (!auth) {
    return null; // Si le contexte n'est pas disponible, on ne rend rien
  }
  const { signInUser, mfaChallenge, verifyMfaAndSignIn } = auth;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        console.log("Connexion réussie ! Redirection...");
        navigate("/");
      } else if (result.requiresMfa) {
        // MFA requis - passer à l'étape de saisie du code
        console.log("🔥 Interface MFA activée");
        setShowMfaStep(true);
        setError(""); // Pas d'erreur, juste MFA requis
        // Empêcher toute redirection automatique
        return; // Important : sortir ici
      } else {
        setError(result.error?.message || "Erreur de connexion");
      }
    } catch (error) {
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
        console.log("Connexion MFA réussie ! Redirection...");
        navigate("/");
      } else {
        setError(result.error?.message || "Code invalide");
      }
    } catch (error) {
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
              <div className="text-accent-600 text-sm text-center bg-accent-50 border border-accent-200 px-3 py-2 rounded">
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
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMfaCode(value);
                  
                  // Auto-soumission dès que 6 chiffres sont saisis
                  if (value.length === 6 && !loading) {
                    setTimeout(async () => {
                      setError("");
                      setLoading(true);
                      
                      try {
                        const result = await verifyMfaAndSignIn(value);
                        if (result.success) {
                          console.log("Connexion MFA réussie ! Redirection...");
                          navigate("/");
                        } else {
                          setError(result.error?.message || "Code invalide");
                        }
                      } catch (error) {
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
            <div className="text-accent-600 text-sm text-center bg-accent-50 border border-accent-200 px-3 py-2 rounded">
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
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-accent-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
