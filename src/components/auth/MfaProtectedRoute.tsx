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
    if (auth?.session && !auth?.isMfaRequired && !auth?.mfaChallenge) {
      navigate("/", { replace: true });
    }
  }, [auth?.session, auth?.mfaChallenge, auth?.isMfaRequired, navigate]);

  if (auth?.session && (auth?.isMfaRequired || auth?.mfaChallenge)) {
    return <>{children}</>;
  }

  if (auth?.session && !auth?.isMfaRequired && !auth?.mfaChallenge) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProtectedRoute;
