import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Settings from "./pages/Settings";
import AuthProtectedRoute from "./components/auth/AuthProtectedRoute";

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
          <AuthProtectedRoute>
            <Signup />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "signin",
        element: <Signin />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
