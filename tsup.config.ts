import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/crypt/index.ts",
    "src/definition/index.ts",
    "src/formatter/index.ts",
    "src/signature/index.ts",
    "src/struct/index.ts",
  ],
  format: ["cjs", "esm"], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
});
