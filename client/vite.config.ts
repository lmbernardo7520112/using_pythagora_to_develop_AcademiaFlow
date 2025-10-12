//client/vite.config.ts

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // 🔹 permite acesso via rede local (útil em testes)
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/logs": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: ["localhost", "127.0.0.1", ".pythagora.ai"],
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**", "**/public/**", "**/log/**"],
    },
  },
});
