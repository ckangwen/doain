import { definePlugin } from "../../src/plugin"

export default definePlugin(() => {
  return {
    name: "test",
    command: "build",
    vite: {
      resolve: {
        alias: {
          "~dist/": "dist/",
        }
      }
    }
  }
})