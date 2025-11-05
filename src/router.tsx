import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Tournament from "./pages/Tournament";
import Lottery from "./pages/Lottery";
import LegalNotice from "./pages/LegalNotice";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "signup",
        element: (
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "signin",
        element: (
          <PublicOnlyRoute>
            <Signin />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "lottery",
        element: <Lottery />,
      },
      {
        path: "tournament",
        element: <Tournament />,
      },
      {
        path: "legal-notice",
        element: <LegalNotice />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "terms-of-service",
        element: <TermsOfService />,
      },
    ],
  },
]);
