// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nitroPreset =
  process.env["NITRO_PRESET"] || (process.env["VERCEL"] ? "vercel" : undefined);

// Better Auth 1.7.25 and TanStack Start plugins require Zod v4 (installed at
// node_modules/better-auth/node_modules/zod). Aliasing bare 'zod' ensures Vite bundles
// the compatible Zod v4 runtime (providing .loose(), z.looseObject, z.email, z.validate)
// preventing "TypeError: sessionSchema.loose is not a function" in production SSR.
const betterAuthZod = [
  path.resolve(__dirname, "node_modules/better-auth/node_modules/zod/index.js"),
  path.resolve(__dirname, "node_modules/zod/v4/index.js"),
].find((p) => fs.existsSync(p)) || "zod";

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        { find: /^zod$/, replacement: betterAuthZod },
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  ...(nitroPreset ? { nitro: { preset: nitroPreset } } : {}),
});
