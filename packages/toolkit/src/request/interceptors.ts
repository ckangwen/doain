import { inBrowser } from "@charrue/toolkit";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { stringify } from "qs";

export const stringifyData = (axiosConfig: AxiosRequestConfig) => {
  try {
    if (inBrowser && axiosConfig.data instanceof FormData) {
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

export const validateUrl = (axiosConfig: AxiosRequestConfig) => {
  const { url } = axiosConfig;
  // 是否以 https:// 或 http:// 开始
  if (url?.startsWith("https://") || url?.startsWith("http://")) {
    axiosConfig.baseURL = "";
    axiosConfig.url = url;
  }

  return axiosConfig;
};

export const getResponseData = (response: AxiosResponse) => response.data;
