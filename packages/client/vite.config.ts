import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import fg from "fast-glob";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import pkg from "./package.json";

const external = Object.keys(pkg.dependencies || {});

const routerFiles = fg.sync(["./app/router/*.ts", "./app/store/*.ts", "./app/unocss/*.ts"]);
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      exclude: ["./app/*", "./components/*"],
    }),
  ],
  resolve: {
    alias: {
      "~components": resolve(__dirname, "components/index.ts"),
    },
  },
  build: {
    lib: {
      entry: [
        "index.ts",
        "./app/index",
        "./app/registerApp",
        "./app/client.config",
        "./components/index.ts",
        ...routerFiles,
      ],
      name: "doain.client",
      formats: ["es"],
    },
    rollupOptions: {
      external: [...external, /^virtual:/, "uno.css", "~pages", /^~doain\//],
      output: {
        preserveModules: true,
        preserveModulesRoot: ".",
        dir: "dist",
        format: "es",
      },
    },

    minify: false,
  },
});
