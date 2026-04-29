import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors into separate cached chunks.
        // Browsers cache these independently — a UI change won't invalidate
        // the framer-motion or supabase chunk that the user already downloaded.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-sentry": ["@sentry/react"],
        },
      },
    },
  },
});
