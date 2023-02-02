import { defineConfig } from "doain/config"
import LayoutSkeleton from "@doain/plugin-layout-skeleton"
export default defineConfig({
  html: {
    title: "Doain",
  },
  plugins: [LayoutSkeleton()]
})