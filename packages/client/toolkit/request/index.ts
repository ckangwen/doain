import { getDoainConfig, subscribeDoainConfigKey } from "~toolkit";

import { HttpClient } from "./HttpClient";
import type { HttpClientResponse } from "./HttpClient";

const globalConfig = getDoainConfig();

const httpClient = new HttpClient({
  baseUrl: globalConfig.fetch.baseUrl,
  tokenWhiteList: globalConfig.fetch.tokenWhiteList || [],
});

subscribeDoainConfigKey("fetch", (config) => {
  if (config.baseUrl !== globalConfig.fetch.baseUrl) {
    httpClient.resetAxiosInstance({
      baseUrl: config.baseUrl,
      tokenWhiteList: config.tokenWhiteList || [],
    });
  }
});

export { HttpClient, httpClient };
export type { HttpClientResponse };
