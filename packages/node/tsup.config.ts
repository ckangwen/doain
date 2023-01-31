import { builtinModules } from "module";
import { defineConfig } from "tsup";

import pkg from "./package.json";

const external = [...Object.keys(pkg.dependencies), ...builtinModules];

export default defineConfig({
  entry: ["./src/index.ts", "./src/cli.ts", "./src/config.ts", "./src/plugin.ts"],
  dts: true,
  clean: true,
  format: ["esm"],
  target: "node14",
  external,
});
