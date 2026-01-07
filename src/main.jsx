import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ClerkProvider } from "@clerk/clerk-react";

const CurrentDeployment = "production"; // Change to "development" as needed

const CLERK_PUBLISHABLE_KEYS = {
  production: "pk_live_Y2xlcmsuZmlueGJveC5jb20k", // Replace with actual live key
  development: "pk_test_Y2hhcm1lZC1zaGVwaGVyZC00MC5jbGVyay5hY2NvdW50cy5kZXYk", // Replace with actual test key
};

// Check environment and assign the appropriate key
const CLERK_PUBLISHABLE_KEY =
  CurrentDeployment === "production"
    ? CLERK_PUBLISHABLE_KEYS.production
    : CLERK_PUBLISHABLE_KEYS.development;

console.log("Clerk Publishable Key:", CLERK_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);