import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

// Helper Components
import Loader from "./components/Loader";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// --- Lazy-loaded Page Components ---
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const FormEditorPage = lazy(() => import("./pages/FormEditorPage"));
// NEW: Import the FormResponsesPage
const FormResponsesPage = lazy(() => import("./pages/FormResponsesPage"));


const rootRoutes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<Loader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "auth/callback",
        element: (
          <Suspense fallback={<Loader />}>
            <AuthCallbackPage />
          </Suspense>
        ),
      },
      // --- Protected Routes ---
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<Loader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "forms/:id/edit",
            element: (
              <Suspense fallback={<Loader />}>
                <FormEditorPage />
              </Suspense>
            ),
          },
          // NEW: The route with an ID for the responses page
          {
            path: "forms/:id/responses",
            element: (
              <Suspense fallback={<Loader />}>
                <FormResponsesPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // --- Catch-all for undefined routes ---
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default rootRoutes;