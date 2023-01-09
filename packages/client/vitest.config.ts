import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    deps: {
      inline: true,
    },
    setupFiles: ["./vitest.setup.ts"],
    include: ["./tests/**/*.ts"],
  },
});
