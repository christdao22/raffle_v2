// apps/api/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  // These packages have no `build` step of their own (raw TS source only),
  // so they must be bundled in rather than left as external imports -
  // otherwise the compiled dist/index.js tries to `import` raw .ts files
  // at runtime and Node can't resolve them.
  noExternal: [/^@raffle_v2\//],
});
