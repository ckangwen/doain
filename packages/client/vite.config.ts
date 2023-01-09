import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import fg from "fast-glob";
import { defineConfig } from "vite";

import pkg from "./package.json";

const external = Object.keys(pkg.dependencies || {});

const routerFiles = fg.sync(["./app/router/*.ts", "./app/store/*.ts"]);
export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: ["./src/index", "./app/index", ...routerFiles],
      name: "doain.client",
      formats: ["es"],
    },
    rollupOptions: {
      external: [...external, /^virtual:/, "~pages", /^~doain\//],
      output: {
        preserveModules: true,
        dir: "dist",
        format: "es",
      },
    },

    minify: false,
  },
});
