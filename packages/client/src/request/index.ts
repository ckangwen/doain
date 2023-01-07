import axios from "axios";

import { getEffectiveConfig, onEffectiveConfigChange } from "../config/index";
import { HttpClient } from "./HttpClient";
import type { HttpClientResponse } from "./HttpClient";

const config = getEffectiveConfig();

const httpClient = new HttpClient({
  baseUrl: config.fetch.baseUrl,
  tokenWhiteList: config.fetch.tokenWhiteList || [],
});

onEffectiveConfigChange((changed) => {
  if (changed.fetch.baseUrl !== config.fetch.baseUrl) {
    const service = axios.create({
      baseURL: changed.fetch.baseUrl,
      headers: httpClient.defaultHeaders,
      timeout: httpClient.timeout,
    });
    httpClient.resetAxiosInstance(service);
  }
});

export { HttpClient, httpClient };
export type { HttpClientResponse };
