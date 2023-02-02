import { describe, expect, test } from "vitest";

import { resolveDoainConfig } from "../src/config/index";

const ROOT = __dirname;

describe("config", () => {
  test("resolveDoainConfig", async () => {
    const config = await resolveDoainConfig({ root: ROOT });

    expect(config.base).toBeDefined();
    expect(config.outDir).toBeDefined();
    expect(config.builtPlugins.pages).toBe(false);

    expect(config.vite).toEqual({});
    const newConfig = await resolveDoainConfig({ root: ROOT, command: "build" });

    expect(newConfig.vite).toEqual({
      resolve: {
        alias: {
          "~dist/": "dist/",
        },
      },
    });
  });
});
