import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Required for ethers v6 to work in browser environment
    global: "globalThis",
  },
  build: {
    outDir:        "dist",
    sourcemap:     true,
    rollupOptions: {
      output: {
        manualChunks: {
          ethers: ["ethers"],
          react:  ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
