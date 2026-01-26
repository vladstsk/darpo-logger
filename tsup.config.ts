import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/transports/index.ts"],
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: true,
    outDir: "dist",
  },
  {
    entry: ["src/index.ts", "src/transports/index.ts"],
    format: ["esm"],
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: true,
    outDir: "dist",
  },
]);
