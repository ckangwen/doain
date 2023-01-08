import { defineConfig } from "@doain/node"

export default defineConfig({
  builtPlugins: {
    unocss: false,
    autoImport: false,
    vueComponents: false,
    visualizer: false,
  }
})