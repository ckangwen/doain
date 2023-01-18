import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./index.ts", "./cli.ts"],
  dts: true,
  clean: true,
  format: ["esm"],
});
