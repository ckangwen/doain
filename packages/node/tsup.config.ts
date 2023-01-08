import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/cli.ts", "./src/index.ts"],
  dts: true,
  clean: true,
  format: ["esm"],
});
