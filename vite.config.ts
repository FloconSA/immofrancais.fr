import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        // React et le routeur changent rarement : un fichier à part reste en cache entre deux mises en ligne
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return "vendor"
        },
      },
    },
  },
});
