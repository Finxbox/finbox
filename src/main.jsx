import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const isProduction = import.meta.env.MODE === "production";
const PUBLISHABLE_KEY = isProduction
  ? import.meta.env.VITE_CLERK_PRODUCTION_KEY
  : import.meta.env.VITE_CLERK_TEST_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Clerk Publishable Key. Check your environment variables."
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
