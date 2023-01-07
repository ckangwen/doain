import { getGlobalThis } from "@effective/shared";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { stringify } from "qs";

export const stringifyData = (axiosConfig: AxiosRequestConfig) => {
  try {
    if (getGlobalThis().FormData && axiosConfig.data instanceof FormData) {
      Object.keys(axiosConfig.data).forEach((k) => {
        axiosConfig.data.append(k, axiosConfig.data.get(k));
      });
    } else {
      axiosConfig.data = stringify(axiosConfig.data);
    }
  } catch (e) {
    return axiosConfig;
  }
  return axiosConfig;
};

export const getResponseData = (response: AxiosResponse) => response.data;
