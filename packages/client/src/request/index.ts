import { getDoainConfig, onDoainConfigChange } from "../config/index";
import { HttpClient } from "./HttpClient";
import type { HttpClientResponse } from "./HttpClient";

const config = getDoainConfig();

const httpClient = new HttpClient({
  baseUrl: config.fetch.baseUrl,
  tokenWhiteList: config.fetch.tokenWhiteList || [],
});

onDoainConfigChange((changed) => {
  if (changed.fetch.baseUrl !== config.fetch.baseUrl) {
    httpClient.resetAxiosInstance({
      baseUrl: changed.fetch.baseUrl,
      tokenWhiteList: changed.fetch.tokenWhiteList || [],
    });
  }
});

export { HttpClient, httpClient };
export type { HttpClientResponse };
