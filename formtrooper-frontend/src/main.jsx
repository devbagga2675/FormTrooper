import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import rootRoutes from "./RootRoutes"; // Import the routes we just defined
import "./index.css"; // Import Tailwind CSS styles

// Create the router instance
const router = createBrowserRouter(rootRoutes);

// Render the application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);