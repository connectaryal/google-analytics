import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2019",
  sourcemap: true,
  clean: false, // dist/*.d.ts is emitted separately by tsc before this runs
  dts: false, // declarations come from `tsc --emitDeclarationOnly`, not tsup
  splitting: false,
  external: ["react", "react/jsx-runtime"],
  // esbuild only hoists "use client" when every bundled module has it; since
  // this single-file bundle mixes GAProvider/hooks (client) with the plain
  // GoogleAnalytics/GATracker classes (framework-agnostic), it silently drops
  // the directive rather than mis-tagging the non-client code. Force it back
  // on: every tracking method already no-ops outside the browser (isBrowser()
  // guards), so nothing server-side actually depended on being import-able
  // from a Server Component/Action — but GAProvider/useGoogleAnalytics etc.
  // *do* need the directive present to work under Next.js App Router at all.
  banner: {
    js: '"use client";',
  },
});
