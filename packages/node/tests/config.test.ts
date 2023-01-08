import { normalizePath } from "vite";
import { describe, expect, test } from "vitest";

import { resolveDoainConfig } from "../src/config";

const ROOT = __dirname;

describe("config", () => {
  test("resolveDoainConfig", async () => {
    const config = await resolveDoainConfig(ROOT);

    expect(config.root).toBe(normalizePath(ROOT));
  });
});
