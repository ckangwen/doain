import { defineConfig } from "../../src/config"
import FooPlugin from "./foo"
export default defineConfig({
  builtPlugins: {
    pages: false,
    pageLayout: false
  },
  plugins: [FooPlugin()]
})