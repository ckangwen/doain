import { HttpClient } from "./HttpClient";
import type { HttpClientResponse } from "./HttpClient";

const httpClient = new HttpClient({
  baseUrl: "",
  tokenWhiteList: [],
});

export { HttpClient, httpClient };
export type { HttpClientResponse };
