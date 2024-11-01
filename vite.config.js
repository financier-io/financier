import { defineConfig } from "vite";
import babelPlugin from "vite-plugin-babel";
import { VitePWA } from "vite-plugin-pwa";

import pJson from "./package.json" with { type: "json" };
import { webfontDownload } from "vite-plugin-webfont-dl";

export default defineConfig({
  assetsInclude: ["src/**/*.html"],
  plugins: [
    {
      name: "wrap-i18n-as-module-plugin",
      enforce: "pre",
      async transform(code, id) {
        if (!isAngularLocaleFile(id)) return code;

        return `export default function() {\n${code}\n};`;
      },
    },
    webfontDownload(),
    babelPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Financier",
        icons: [
          {
            src: "/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        theme_color: "#76b852",
        start_url: "/",
        display: "standalone",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,woff,ttf,svg,eot}"],
        navigateFallbackDenylist: [/^\/(api|docs|manage|db)\/?/, /^\/_/, /^_/],
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: [
          "import",
          "slash-div",
          "global-builtin",
          "color-functions",
          "mixed-decls",
          "legacy-js-api",
        ],
      },
    },
  },
  define: {
    VERSION: {
      number: pJson.version,
      date: pJson.releaseDate,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (isAngularLocaleFile(id)) return "i18n";
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./testSetup"],
    globals: true,
  },
});

function isAngularLocaleFile(file) {
  return file.includes("/angular-locale_");
}
