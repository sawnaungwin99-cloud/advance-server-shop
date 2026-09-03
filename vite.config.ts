// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const supabaseUrl =
  process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"] ?? "";
const supabasePublishableKey =
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  process.env["SUPABASE_PUBLISHABLE_KEY"] ??
  "";

export default defineConfig({
  vite: {
    // Some production builders provide the managed backend values only under
    // their server-side names. The browser client needs the same public URL
    // and publishable key embedded at build time, so bridge those values when
    // the VITE-prefixed aliases are unavailable.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        supabasePublishableKey,
      ),
      // The generated browser client intentionally uses bracket notation for
      // its SSR fallback. Defining the small public process.env object keeps
      // that fallback available in browser bundles where the hosting build
      // only injects the non-VITE aliases. Never add server-only secrets here.
      "process.env": JSON.stringify({
        SUPABASE_URL: supabaseUrl,
        SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
      }),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
