import { defineConfig } from "@doain/node"

export default defineConfig({
  builtPlugins: {
    pageLayout: false,
    pages: false,
    unocss: false,
    autoImport: false,
    vueComponents: false,
    visualizer: false,
  }
})