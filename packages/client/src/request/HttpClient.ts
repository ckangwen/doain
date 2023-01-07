/* eslint-disable @typescript-eslint/member-ordering */
import { has, to } from "@effective/shared";
import type { AxiosInstance, AxiosRequestConfig, Method } from "axios";
import axios from "axios";
import mitt from "mitt";
import type { Emitter } from "mitt";

import { getToken } from "../helpers/index";
import { FetchResponse } from "../types";
import { getResponseData, stringifyData } from "./interceptors";

type Event = Record<string, any>;
const ONE_SECOND = 1000;

interface RequestOption {
  url: string;
  data?: any;
  method?: Method;
}

export interface HttpClientResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  error: Error | null;
}

export class HttpClient {
  axiosInstance: AxiosInstance;
  timeout = 20000;
  defaultHeaders: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };
  emitter: Emitter<Event> = mitt();

  /** 不需要token的接口 */
  private tokenWhiteList: string[] = [];

  /** 缓存的token */
  private _cachedToken = "";

  /** 记录接口不同参数的请求记录 */
  private repeatedRequestList: Record<
    string,
    Record<string, Array<{ data: any; handler: Promise<any>; expired: number }>>
  > = {};

  /** 没有token的请求队列 */
  private noTokenRequestList: AxiosRequestConfig[] = [];

  /** 记录可以取消的接口 */
  private abortControllerMap: Record<string, AbortController> = {};

  constructor(options: { baseUrl: string; tokenWhiteList?: string[] }) {
    const { baseUrl } = options;
    this.tokenWhiteList = options.tokenWhiteList || [];

    const service = axios.create({
      baseURL: baseUrl,
      headers: this.defaultHeaders,
      timeout: this.timeout,
    });

    this.axiosInstance = service;
    this.setupInterceptors();
  }

  /**
   * 缓存的token
   * 如果需要更新，需要调用 refreshToken
   */
  get token() {
    if (!this._cachedToken) {
      this._cachedToken = getToken();
    }
    return this._cachedToken;
  }

  /**
   * 1. 如果请求的header里面没有Authorization，那么就添加上 getToken() 的值
   * 2. 如果此时还没有token，那么就把这个请求放到一个队列里面，等待token获取到之后再执行
   */
  private tokenGuardInterceptor = (config: AxiosRequestConfig) => {
    const { token } = this;
    const url = config.url!;
    if (!token && !this.tokenWhiteList.includes(url)) {
      this.noTokenRequestList.push(config);
      this.abortControllerMap[config.url!] = new AbortController();
      return config;
    }

    this.callWithToken();
    if (!config.headers?.Authorization) {
      config.headers!.Authorization = getToken();
    }

    return config;
  };

  private cancelRequestInterceptor = (config: AxiosRequestConfig) => {
    if (!config.data || !config.url) {
      return config;
    }

    if (has(config.data, "cancelable") && !this.abortControllerMap[config.url!]) {
      delete config.data.cancelable;
      const abortController = new AbortController();
      this.abortControllerMap[config.url!] = abortController;
      config.signal = abortController.signal;
    }

    return config;
  };
  /**
   * 在获取到token之后，执行队列里面的请求
   */
  private callWithToken = () => {
    this.noTokenRequestList.forEach((config) => {
      const url = config.url!;
      const abortController = this.abortControllerMap[url];
      if (abortController) {
        abortController.abort();
        delete this.abortControllerMap[url];
      }

      config.headers!.Authorization = getToken();
      this.axiosInstance.request(config);
    });

    this.noTokenRequestList = [];
  };

  private setupInterceptors = (service: AxiosInstance = this.axiosInstance) => {
    service.interceptors.request.use(this.cancelRequestInterceptor);
    service.interceptors.request.use(this.tokenGuardInterceptor);
    service.interceptors.request.use(stringifyData);
    service.interceptors.response.use(getResponseData);
  };

  getState() {
    return {
      noTokenRequestList: this.noTokenRequestList,
      repeatedRequestList: this.repeatedRequestList,
      abortControllerMap: this.abortControllerMap,
    };
  }

  resetAxiosInstance = (instance: AxiosInstance) => {
    this.axiosInstance = instance;
  };

  /**
   * 获取最新的token
   */
  refreshToken = () => {
    this._cachedToken = getToken();
  };

  /**
   * 取消请求
   * (该请求必须是通过cancelable: true来发起的)
   */
  cancelRequest = (url: string) => {
    const abortController = this.abortControllerMap[url];
    if (abortController) {
      abortController.abort();
      delete this.abortControllerMap[url];
    }
  };

  /**
   * 请求在规定时间内只会触发一次
   */
  limitRepeatedRequest = (options: RequestOption & { timeout?: number }) => {
    const { url, method = "POST", data = {}, timeout = ONE_SECOND } = options;

    const currentTime = Date.now();
    const KEY = JSON.stringify(data);

    this.repeatedRequestList[url] = this.repeatedRequestList[url] || {};
    this.repeatedRequestList[url][KEY] = this.repeatedRequestList[url][KEY] || [];
    // 获取当前url+当前请求参数的所有记录
    const records = this.repeatedRequestList[url][KEY];
    // 获取最新的一条记录
    const latest = records[records.length - 1];

    // 如果存在最新的一条记录，并且还没有超时，那么就直接返回最新的一条记录的handler
    if (latest && latest.expired > currentTime) {
      return latest.handler;
    }

    // 最新的一条记录都过期了，那么所有的记录都过期了，需要清除之前的所有数据，并重新发起请求
    if (latest && latest.expired < currentTime) {
      this.repeatedRequestList[url][KEY] = [];
    }

    const handler = new Promise((resolve) => {
      this.request({
        url,
        method,
        data,
      }).then((res) => {
        resolve(res);
      });
    });

    this.repeatedRequestList[url][KEY].push({
      data,
      handler,
      expired: currentTime + timeout,
    });

    return handler;
  };

  /**
   * 常规的接口请求
   */
  request = async (options: RequestOption): Promise<HttpClientResponse> => {
    const { url, method = "POST", data = {} } = options;

    const [res, err] = await to(
      this.axiosInstance.request<FetchResponse, FetchResponse>({
        method,
        url,
        data,
      }),
    );

    this.emitter.emit(url, [res, err]);

    if (err) {
      return {
        success: false,
        message: res ? (res as any).message : err.message,
        error: err,
        data: null,
      };
    }

    return {
      success: Number(res.status) === 1,
      message: res.message,
      error: null,
      data: res.data,
    };
  };

  subscribe = (
    url: string,
    callback: (payload: [FetchResponse<any> | undefined, Error | null]) => void,
  ) => {
    this.emitter.on(url, callback);
  };
}
