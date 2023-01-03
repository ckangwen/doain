import { to } from "@effective/shared";
import type { AxiosAdapter, Method } from "axios";
import axios from "axios";

import { FetchResponse } from "../types";
import { getResponseData, stringifyData, tokenGuard } from "./interceptors";

export interface CreateRequestOptions {
  baseUrl: string;
  adaptor?: AxiosAdapter;
}

export const createRequest = (config: CreateRequestOptions) => {
  const service = axios.create({
    baseURL: config.baseUrl,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    timeout: 20000,
  });

  service.interceptors.request.use(tokenGuard);
  service.interceptors.request.use(stringifyData);
  service.interceptors.response.use(getResponseData);

  return (url: string, data: Record<string, any> = {}, method: Method = "POST") =>
    to(
      service.request<FetchResponse, FetchResponse>({
        method,
        url,
        data,
      }),
    );
};
