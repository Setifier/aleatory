import { useState } from "react";
import Button from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = UserAuth();
  if (!auth) {
    return null;
  }
  const { session, signUpNewUser } = auth;
  const navigate = useNavigate();

  console.log(session);

  // Fonction de validation et formatage du pseudo
  const formatAndValidatePseudo = (
    input: string
  ): { isValid: boolean; formatted: string; error?: string } => {
    // 1. Validation des caractères interdits AVANT nettoyage
    if (/[0-9]/.test(input)) {
      return {
        isValid: false,
        formatted: input,
        error: "Le pseudo ne peut pas contenir de chiffres",
      };
    }

    if (/[^a-zA-ZÀ-ÿ\s]/.test(input)) {
      return {
        isValid: false,
        formatted: input,
        error: "Le pseudo ne peut contenir que des lettres",
      };
    }

    // 2. Remplace les espaces multiples par un seul
    const singleSpaced = input.replace(/\s+/g, " ");

    // 3. Trim les espaces en début/fin
    const trimmed = singleSpaced.trim();

    // 4. Capitalise chaque mot
    const formatted = trimmed
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // 5. Validations
    if (formatted.length < 2) {
      return {
        isValid: false,
        formatted,
        error: "Le pseudo doit contenir au moins 2 lettres",
      };
    }

    const spaceCount = (formatted.match(/\s/g) || []).length;
    if (spaceCount > 2) {
      return {
        isValid: false,
        formatted,
        error: "Maximum 2 espaces autorisés",
      };
    }

    return { isValid: true, formatted };
  };

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
          alert(
            `📧 Un email de confirmation a été envoyé à ${email}.\n\nVeuillez cliquer sur le lien dans l'email pour activer votre compte, puis vous connecter.`
          );
          navigate("/signin"); // Redirection vers la page de connexion
        } else {
          // Inscription directe (si confirmation désactivée)
          console.log("Inscription réussie ! Redirection...");
          navigate("/");
        }
      } else {
        setError(result.error.message);
      }
    } catch (error) {
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
                placeholder="Mot de passe (min. 8 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-accent-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
      </div>
    </div>
  );
};

export default Signup;
