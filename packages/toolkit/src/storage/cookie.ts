import Cookie, { CookieAttributes } from "js-cookie";

import { getDoainClientConfig, subscribeDoainClientConfigKey } from "../config/index";

let { appKey } = getDoainClientConfig().app;
subscribeDoainClientConfigKey("app", (config) => {
  appKey = config.appKey;
});

export const cookieStorage = {
  get: (key?: string) => {
    if (!key) {
      return Cookie.get();
    }
    return Cookie.get(`${appKey}_${key}`);
  },
  set: (key: string, value: string, option?: CookieAttributes) =>
    Cookie.set(`${appKey}_${key}`, value, option),
  remove: (key: string, option?: CookieAttributes) => Cookie.remove(`${appKey}_${key}`, option),
};
