import { Navigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { session } = UserAuth();

  // Si connecté, rediriger vers la home
  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicOnlyRoute;
