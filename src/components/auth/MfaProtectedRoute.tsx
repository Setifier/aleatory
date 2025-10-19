import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";

interface AuthProtectedRouteProps {
  children: React.ReactNode;
}

const AuthProtectedRoute = ({ children }: AuthProtectedRouteProps) => {
  const auth = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté ET qu'il n'y a pas de MFA requis, on le redirige vers la home
    if (auth?.session && !auth?.isMfaRequired && !auth?.mfaChallenge) {
      navigate("/", { replace: true });
    }
  }, [auth?.session, auth?.mfaChallenge, auth?.isMfaRequired, navigate]);

  // Si l'utilisateur est connecté MAIS qu'il y a un MFA requis, afficher la page d'auth
  if (auth?.session && (auth?.isMfaRequired || auth?.mfaChallenge)) {
    return <>{children}</>;
  }

  // Si l'utilisateur est connecté sans MFA requis, on ne rend rien (pendant la redirection)
  if (auth?.session && !auth?.isMfaRequired && !auth?.mfaChallenge) {
    return null;
  }

  // Si l'utilisateur n'est pas connecté, on affiche la page d'auth
  return <>{children}</>;
};

export default AuthProtectedRoute;
