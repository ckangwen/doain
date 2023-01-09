import { merge } from "@charrue/toolkit";
import type { AxiosAdapter } from "axios";
import mitt, { EventType } from "mitt";
import type { RouteLocationRaw } from "vue-router";

import type { HttpClientResponse } from "../request/index";

export interface DoainConfig<GlobalUserInfo = Record<string, any>> {
  app: {
    appKey: string;
    storageKey: string;
    version: string;
  };
  layout: {
    [key: string]: any;
    tabViewStorageName: string;
    ignoreNavigationTabKey: string;
  };
  store: {
    // TODO: UserInfo类型
    getRequiredUserData: (userInfo: Record<string, any>) => GlobalUserInfo;
  };
  fetch: {
    baseUrl: string;
    adaptor?: AxiosAdapter;
    tokenWhiteList?: string[];
    fetchUserInfo: () => Promise<HttpClientResponse>;
    login: (data: any) => Promise<HttpClientResponse>;
    getTokenAfterLogin: (data: any) => string | Promise<string>;
  };
  component?: {
    paginationView?: {
      formatColumnValue?: (key: string, value: any) => any;
      formatQueryValue?: (key: string, value: any) => any;
    };
  };
  router: {
    /** 登录页路由 */
    loginRoute: RouteLocationRaw;
    /** 首页路由 */
    homeRoute: RouteLocationRaw;
    /** 路由跳转前是否需要判断token */
    tokenAuth: boolean;
    /** 无论是否有token，都可以直接访问  */
    unimpededRoutes?: string[];
    /**
     * 只能在未登录情况下访问的页面
     * 如果已登录，访问这些页面会自动跳转到homeRoute
     * */
    unloggedRoutes?: string[];
  };
}

type ConfigKey = keyof DoainConfig;
type DoainConfigValueOf<T extends ConfigKey> = DoainConfig[T];

const APP_KEY = "doain-admin";
const defaultConfig: DoainConfig = {
  app: {
    appKey: APP_KEY,
    storageKey: APP_KEY,
    version: "0.0.1",
  },
  layout: {
    logo: "",
    title: "",
    collapse: false,
    layout: "mix",
    sidebarWidth: [54, 200],
    tabViewStorageName: "tabView",
    ignoreNavigationTabKey: "navigationTab",
    sidebarMenu: [],
  },
  fetch: {
    baseUrl: "",
    tokenWhiteList: [],
    fetchUserInfo() {
      return Promise.resolve({
        success: false,
        data: null,
        error: null,
        message: "",
      });
    },
    login() {
      return Promise.resolve({
        success: false,
        data: null,
        error: null,
        message: "",
      });
    },
    getTokenAfterLogin() {
      return "";
    },
  },
  store: {
    getRequiredUserData() {
      return {
        userId: 0,
        username: "",
      };
    },
  },
  router: {
    loginRoute: "/account/login",
    homeRoute: "/",
    tokenAuth: true,
  },
};

interface Events extends Record<EventType, unknown> {
  "*": DoainConfig;
  app: DoainConfig["app"];
  layout: DoainConfig["layout"];
  store: DoainConfig["store"];
  fetch: DoainConfig["fetch"];
  router: DoainConfig["router"];
}

class GlobalDoainConfig {
  private _config: DoainConfig = defaultConfig;
  private emitter = mitt<Events>();
  defineDoainConfig = (config: DoainConfig) => {
    this._config = merge(defaultConfig, config);
    this.emitter.emit("*", this._config);
  };

  get config() {
    return this._config;
  }

  get(key: ConfigKey) {
    return this._config[key];
  }

  set = <T extends ConfigKey>(key: T, value: DoainConfig[T]) => {
    this._config[key] = value;
    this.emitter.emit(key as keyof Events, value);
  };

  subscribe = <N extends ConfigKey>(
    name: N,
    cb: (config: N extends ConfigKey ? DoainConfigValueOf<N> : DoainConfig) => void,
  ) => {
    this.emitter.on(name, (type: any) => {
      cb(type);
    });
  };
}

const globalDoainConfig = new GlobalDoainConfig();

function getDoainConfig() {
  return globalDoainConfig.config;
}
function getDoainConfigKey(key: ConfigKey) {
  return globalDoainConfig.get(key);
}

function setDoainConfig<T extends ConfigKey>(key: T, value: DoainConfig[T]) {
  globalDoainConfig.set(key, value);
}

function subscribeDoainConfigKey<N extends ConfigKey>(
  name: N,
  cb: (config: N extends ConfigKey ? DoainConfigValueOf<N> : DoainConfig) => void,
) {
  globalDoainConfig.subscribe(name, cb);
}

const { defineDoainConfig } = globalDoainConfig;

export {
  getDoainConfig,
  defineDoainConfig,
  setDoainConfig,
  getDoainConfigKey,
  subscribeDoainConfigKey,
};
