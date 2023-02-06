import { defineConfig } from "doain/config"
import LayoutSkeleton from "@doain/plugin-layout-skeleton"
// import ImportMapPlugin from "@doain/plugin-build-service"
export default defineConfig({
  html: {
    title: "Doain",
  },
  plugins: [LayoutSkeleton(),],
  vite: {
    build: {
      minify: false,
    }
  }
})