import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ClerkProvider } from "@clerk/clerk-react";
import CLERK_PUBLISHABLE_KEY from "../clerkConfig.js";

console.log("Clerk Publishable Key:", CLERK_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <HelmetProvider>

      <BrowserRouter>
        <App />
      </BrowserRouter>
        </HelmetProvider>

    </ClerkProvider>
  </StrictMode>
);

