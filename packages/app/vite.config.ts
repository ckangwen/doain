import { defineConfig } from "vite";

import alias from "./vite.config.alias";
import plugins from "./vite.config.plugin";

export default defineConfig({
  base: "./",
  resolve: {
    alias,
  },
  plugins,
});
