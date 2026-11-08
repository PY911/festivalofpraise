// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isRender = process.env["RENDER"] === "true";

export default defineConfig({
  vite: { base: "/" },
  // Render runs a Node web service; retain Lovable's default target elsewhere.
  ...(isRender ? { nitro: { preset: "node-server" } } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    prerender: {
      // The preview adapter expects a fetch export; Node's entry starts a server.
      // Render serves these routes through SSR instead.
      enabled: !isRender,
      crawlLinks: true,
      concurrency: 12,
      failOnError: true,
    },
  },
});
