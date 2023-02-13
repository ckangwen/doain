import { simpleDeepMerge } from "@charrue/toolkit";
import { describe, expect, test, vi } from "vitest";

import {
  DoainClientConfig,
  defaultDoainClientConfig,
  defineClientConfig,
  defineClientConfigByKey,
  getDoainClientConfig,
  getDoainClientConfigByKey,
  subscribeDoainClientConfigKey,
} from "../index";

describe("config", () => {
  test("default value", () => {
    expect(getDoainClientConfig()).toEqual(defaultDoainClientConfig);
  });

  test("defineDoainConfig", () => {
    const newConfig: DoainClientConfig = {
      app: {
        appKey: "appKey",
      },
      layout: {
        data: [],
      },
      store: {
        formatUserData() {
          return {
            username: "",
            userId: 0,
          };
        },
      },
      fetch: {
        baseUrl: "",
        async fetchUserInfo() {
          return {} as any;
        },
        async login() {
          return {} as any;
        },
        getTokenAfterLogin() {
          return "";
        },
      },
      router: {
        enableTokenAuth: false,
        homeRoute: "/",
        loginRoute: "/account/login",
        unloggedOnlyRoutes: ["/account/login"],
      },
    };
    defineClientConfig(() => {
      return newConfig;
    });

    expect(getDoainClientConfig()).toEqual(simpleDeepMerge(defaultDoainClientConfig, newConfig));
  });

  test("defineClientConfigByKey & getDoainClientConfigByKey", () => {
    const appConfig: DoainClientConfig["app"] = {
      appKey: "appKey",
      storageKey: "storageKey",
    };
    defineClientConfigByKey("app", appConfig);

    expect(getDoainClientConfig().app).toEqual(appConfig);
    expect(getDoainClientConfigByKey("app")).toEqual(appConfig);
  });

  test("subscribeDoainClientConfigKey", () => {
    const fn = vi.fn();
    subscribeDoainClientConfigKey("app", (config) => {
      fn(config);
    });
    const appConfig: DoainClientConfig["app"] = {
      appKey: "appKey",
      storageKey: "storageKey",
    };
    defineClientConfigByKey("app", appConfig);

    expect(fn).toBeCalledWith(appConfig);
  });
});
