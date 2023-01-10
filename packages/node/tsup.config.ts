import { builtinModules } from "module";
import { defineConfig } from "tsup";

import pkg from "./package.json";

const external = [...Object.keys(pkg.dependencies), ...builtinModules];

export default defineConfig({
  entry: ["./src/cli.ts", "./src/index.ts"],
  dts: true,
  clean: true,
  format: ["esm"],
  target: "node14",
  external,
});
