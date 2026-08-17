import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  shims: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  outDir: "dist",
  target: "node18",
  splitting: false,
  sourcemap: false,
});
