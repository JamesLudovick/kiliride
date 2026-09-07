import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      "/auth": {
        target: "http://api:4000",
        changeOrigin: true,
      },
      "/admin": {
        target: "http://api:4000",
        changeOrigin: true,
      },
      "/vehicles": {
        target: "http://api:4000",
        changeOrigin: true,
      },
      "/drivers": {
        target: "http://api:4000",
        changeOrigin: true,
      },
      "/driver-portal": {
        target: "http://api:4000",
        changeOrigin: true,
      },
      "/bookings": {
        target: "http://api:4000",
        changeOrigin: true,
      },
      "/customers": {
        target: "http://api:4000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
