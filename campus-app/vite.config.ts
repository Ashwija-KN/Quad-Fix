import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Pin the build output to Netlify (Netlify Functions for SSR) instead of
  // the Cloudflare Workers default, since that's where this site is deployed.
  nitro: {
    preset: "netlify",
  },
});
