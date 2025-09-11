// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080", // backend
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:8080", // socket.io backend
        ws: true,
      },
    },
  },
  define: {
    "process.env": {},
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
