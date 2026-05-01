import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { initSentry } from "./lib/sentry";

import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import { AuthProvider } from "./context/AuthContext";
import { MotionConfig } from "framer-motion";

initSentry();

// reducedMotion="user" makes every framer-motion animation across the entire app
// respect the OS-level "prefers-reduced-motion: reduce" setting automatically.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MotionConfig>
  </StrictMode>
);
