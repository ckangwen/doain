import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";

import pkg from "./package.json";

const external = Object.keys(pkg.dependencies || {});

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: ["./src/index", "./app/index"],
      name: "doain.client",
      formats: ["es"],
    },
    rollupOptions: {
      external: [...external, /^virtual:/],
      output: {
        preserveModules: true,
        dir: "dist",
        format: "es",
      },
    },

    minify: false,
  },
});
