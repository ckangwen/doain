import { describe, expect, test } from "vitest";

import { getDoainConfig, setDoainConfig, subscribeDoainConfigKey } from "../toolkit/config/index";

describe("GlobalDoainConfig", () => {
  test("should get the latest value", () => {
    const globalConfig = getDoainConfig();

    expect(globalConfig.app).toEqual({
      appKey: "doain-admin",
      storageKey: "doain-admin",
      version: "0.0.1",
    });

    setDoainConfig("app", {
      appKey: "doain-admin-new",
      storageKey: "doain-admin-new",
      version: "0.0.2",
    });

    expect(globalConfig.app).toEqual({
      appKey: "doain-admin-new",
      storageKey: "doain-admin-new",
      version: "0.0.2",
    });
  });

  test("subscribe", () => {
    subscribeDoainConfigKey("app", (config) => {
      expect(config).toEqual({
        appKey: "doain-admin-new",
        storageKey: "doain-admin-new",
        version: "0.0.2",
      });
    });

    setDoainConfig("app", {
      appKey: "doain-admin-new",
      storageKey: "doain-admin-new",
      version: "0.0.2",
    });
  });
});
