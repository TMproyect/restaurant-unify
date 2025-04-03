
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Explicitly configure how assets are handled
  build: {
    rollupOptions: {
      // External files that should not be bundled
      external: ['/qz-tray.js']
    }
  },
  // Configure static assets
  optimizeDeps: {
    // Exclude QZ Tray from optimization
    exclude: ['qz-tray']
  },
}));
