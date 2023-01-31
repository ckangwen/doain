import { definePlugin } from "../../src/plugin"

export default definePlugin(() => {
  return {
    name: "test",
    stage: "build",
    vite: {
      resolve: {
        alias: {
          "~dist/": "dist/",
        }
      }
    }
  }
})