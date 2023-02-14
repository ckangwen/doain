import { subscribeDoainClientConfigKey } from "../config/index";
import { HttpClient, httpClient } from "./HttpClient";
import type { HttpClientResponse } from "./HttpClient";

subscribeDoainClientConfigKey("fetch", (config) => {
  httpClient.resetAxiosInstance({
    baseUrl: config.baseUrl,
    tokenWhiteList: config.tokenWhiteList || [],
  });
});

export { HttpClient, httpClient };
export type { HttpClientResponse };
