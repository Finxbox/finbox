const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_DEVELOPMENT_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

export default CLERK_PUBLISHABLE_KEY;
