import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Supertracker",
        short_name: "Supertracker",
        description: "A personal productivity tracker for study, health, and habit goals.",
        theme_color: "#12121c",
        background_color: "#12121c",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/logo192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/logo512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
          { src: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon", purpose: "any" }
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
