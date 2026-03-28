// Loads Vite's built-in TypeScript types for import.meta.env, import.meta.hot, etc.
// Without this, TypeScript won't know what import.meta.env is.
/// <reference types="vite/client" />

// Declares the shape of our environment variables so TypeScript can type-check them.
// Only variables prefixed with VITE_ are exposed to the browser by Vite —
// anything else (like a secret key) is stripped out at build time.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;      // Backend API base URL (defaults to http://localhost:4000)
}

// Extends the built-in ImportMeta interface so import.meta.env matches our declaration above.
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
