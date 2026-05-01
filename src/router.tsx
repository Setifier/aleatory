import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";

// Lazy-loaded pages — each page becomes a separate JS chunk.
// The browser only downloads a page's code when the user navigates to it.
const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Signup"));
const Signin = lazy(() => import("./pages/Signin"));
const Settings = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Lottery = lazy(() => import("./pages/Lottery"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// Minimal spinner shown during chunk download (first visit to a route)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
  </div>
);

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Lazy><Home /></Lazy>,
      },
      {
        path: "signup",
        element: (
          <PublicOnlyRoute>
            <Lazy><Signup /></Lazy>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "signin",
        element: (
          <PublicOnlyRoute>
            <Lazy><Signin /></Lazy>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PublicOnlyRoute>
            <Lazy><ForgotPassword /></Lazy>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "reset-password",
        element: <Lazy><ResetPassword /></Lazy>,
      },
      {
        path: "settings",
        element: <Lazy><Settings /></Lazy>,
      },
      {
        path: "lottery",
        element: <Lazy><Lottery /></Lazy>,
      },
      {
        path: "legal-notice",
        element: <Lazy><LegalNotice /></Lazy>,
      },
      {
        path: "privacy-policy",
        element: <Lazy><PrivacyPolicy /></Lazy>,
      },
      {
        path: "terms-of-service",
        element: <Lazy><TermsOfService /></Lazy>,
      },
    ],
  },
]);
